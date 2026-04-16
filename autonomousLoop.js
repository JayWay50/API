// /inngest/autonomousLoop.js
// ViralLift OS — Autonomous Daily Loop Worker
// Powered by Inngest — runs on server, zero manual trigger needed

import { inngest } from "./client";
import Anthropic   from "@anthropic-ai/sdk";
import { db }      from "@/lib/db";
import { publishPost } from "@/lib/publisher";

const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── CRON TRIGGER ─────────────────────────────────────────────────────────────
// Fires every day at 2:00 AM UTC — runs for ALL active users
export const dailyCycle = inngest.createFunction(
  { id: "virallift-daily-cycle", name: "ViralLift Daily Cycle" },
  { cron: "0 2 * * *" }, // 2AM UTC daily
  async ({ step, logger }) => {

    // Get all users with autonomous mode enabled
    const users = await step.run("fetch-active-users", async () => {
      return db.user.findMany({
        where: { autonomousMode: true, active: true },
        include: { companyProfile: true },
      });
    });

    logger.info(`Running cycle for ${users.length} users`);

    // Run each user's cycle in parallel
    await Promise.all(users.map(user =>
      step.run(`cycle-user-${user.id}`, () => runUserCycle(user, logger))
    ));

    return { success: true, usersProcessed: users.length };
  }
);

// ── PER-USER CYCLE ────────────────────────────────────────────────────────────
async function runUserCycle(user, logger) {
  const profile  = user.companyProfile;
  const cycleNum = (user.cyclesCompleted || 0) + 1;

  logger.info(`[User ${user.id}] Cycle #${cycleNum} starting`);

  try {
    // ── STEP 1: STRATEGIST AGENT ──────────────────────────────────────────────
    logger.info(`[User ${user.id}] Strategist agent running...`);
    const playbookRes = await ai.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: `You are ViralLift Strategist. Respond ONLY with valid JSON:
{
  "weekTheme": "string",
  "topAngle": "string",
  "hooks": [{"hook":"string","platform":"string","score":number}],
  "schedule": [{"day":"string","platform":"string","time":"string","format":"string"}]
}`,
      messages: [{
        role: "user",
        content: `Generate viral playbook. Niche: ${profile.niche}. Platforms: ${profile.platforms.join(", ")}. Posts needed: ${profile.postsPerCycle || 5}.`,
      }],
    });

    const playbook = JSON.parse(
      playbookRes.content[0].text.replace(/```json|```/g, "").trim()
    );

    // Save playbook to DB
    const savedPlaybook = await db.playbook.create({
      data: {
        userId:    user.id,
        weekTheme: playbook.weekTheme,
        topAngle:  playbook.topAngle,
        cycleNum,
        raw:       JSON.stringify(playbook),
      },
    });

    // ── STEP 2: COPY ENGINE ───────────────────────────────────────────────────
    logger.info(`[User ${user.id}] Copy engine running...`);
    const copyRes = await ai.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: `You are ViralLift Copy Engine. Respond ONLY with valid JSON:
{"posts":[{"platform":"string","format":"string","hook":"string","body":"string","cta":"string","score":number}]}`,
      messages: [{
        role: "user",
        content: `Generate ${profile.postsPerCycle || 5} viral posts.
Theme: ${playbook.weekTheme}. Angle: ${playbook.topAngle}.
Platforms: ${profile.platforms.join(", ")}. Platform-native. Score 60-99.`,
      }],
    });

    const { posts } = JSON.parse(
      copyRes.content[0].text.replace(/```json|```/g, "").trim()
    );

    // ── STEP 3: CRITIC AGENT (Quality Gate) ───────────────────────────────────
    const qualityGate = profile.qualityGate || 70;
    const passed  = posts.filter(p => p.score >= qualityGate);
    const rejected = posts.filter(p => p.score < qualityGate);

    logger.info(`[User ${user.id}] ${passed.length} passed, ${rejected.length} rejected (gate: ${qualityGate}%)`);

    // If nothing passes, use top 3 regardless
    const finalPosts = passed.length > 0 ? passed : posts.slice(0, 3);

    // ── STEP 4: SCHEDULE ──────────────────────────────────────────────────────
    const postTimes = generatePostTimes(finalPosts.length);
    const queuedPosts = [];

    for (let i = 0; i < finalPosts.length; i++) {
      const p = finalPosts[i];
      const scheduledAt = postTimes[i];

      const queued = await db.publishQueue.create({
        data: {
          userId:      user.id,
          playbookId:  savedPlaybook.id,
          platform:    p.platform.toLowerCase().replace("/", "_"),
          format:      p.format,
          hook:        p.hook,
          content:     `${p.hook}\n\n${p.body}\n\n${p.cta}`,
          viralScore:  p.score,
          scheduledAt,
          status:      "queued",
          cycleNum,
        },
      });
      queuedPosts.push(queued);
    }

    // ── STEP 5: DIRECTOR MODE CHECK ────────────────────────────────────────────
    if (user.directorMode) {
      // Don't publish — send approval notification instead
      await db.notification.create({
        data: {
          userId:  user.id,
          type:    "approval_required",
          message: `Cycle #${cycleNum}: ${queuedPosts.length} posts ready for your approval`,
          data:    JSON.stringify({ cycleNum, postIds: queuedPosts.map(p => p.id) }),
        },
      });
      logger.info(`[User ${user.id}] Director mode — sent for approval`);
    } else {
      // ── STEP 6: AUTO-PUBLISH ─────────────────────────────────────────────
      for (const post of queuedPosts) {
        try {
          await publishPost(post);
          logger.info(`[User ${user.id}] Published [${post.platform}]`);
        } catch (err) {
          logger.error(`[User ${user.id}] Publish failed [${post.platform}]: ${err.message}`);
          await db.publishQueue.update({
            where: { id: post.id },
            data: { status: "failed", error: err.message },
          });
        }
      }
    }

    // ── STEP 7: UPDATE CYCLE STATS ────────────────────────────────────────────
    await db.user.update({
      where: { id: user.id },
      data: {
        cyclesCompleted: cycleNum,
        lastCycleAt:     new Date(),
        totalPostsQueued: { increment: queuedPosts.length },
      },
    });

    logger.info(`[User ${user.id}] Cycle #${cycleNum} complete ✓`);

  } catch (err) {
    logger.error(`[User ${user.id}] Cycle failed: ${err.message}`);
    await db.cycleError.create({
      data: { userId: user.id, cycleNum, error: err.message, stack: err.stack },
    });
  }
}

// Generate optimal posting times spread across the next 24h
function generatePostTimes(count) {
  const now   = new Date();
  const times = [];
  // Best windows: 9AM, 12PM, 5PM, 8PM (user's local time — use UTC for now)
  const windows = [9, 12, 17, 20, 22, 7, 15, 18];
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setHours(windows[i % windows.length], Math.floor(Math.random() * 30), 0, 0);
    if (d <= now) d.setDate(d.getDate() + 1);
    times.push(d);
  }
  return times;
}
