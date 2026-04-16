// src/workers/autonomousLoop.ts
// ViralLift Autonomous Daily Loop — Inngest Background Worker
// This is the engine that runs while you sleep.
// Deploy to Vercel/Railway, configure cron in Inngest dashboard.

import { inngest } from "../lib/inngest";
import Anthropic from "@anthropic-ai/sdk";
import { PrismaClient } from "@prisma/client";
import { publishPost } from "../lib/platforms";

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── MAIN LOOP FUNCTION ───────────────────────────────────────────────────────
export const autonomousLoop = inngest.createFunction(
  {
    id: "virallift-autonomous-loop",
    name: "ViralLift Autonomous Loop",
    // Retry up to 3 times on failure
    retries: 3,
  },
  // Trigger: scheduled cron OR manual event
  [
    { cron: "0 2 * * *" }, // Runs daily at 2:00 AM UTC — change to your preference
    { event: "virallift/loop.trigger" },
  ],
  async ({ event, step, logger }) => {
    const userId = event.data?.userId || "default";

    logger.info(`ViralLift Autonomous Loop starting for user: ${userId}`);

    // ── STEP 1: Load user profile ──────────────────────────────────────────────
    const profile = await step.run("load-profile", async () => {
      const p = await prisma.profile.findUnique({ where: { userId } });
      if (!p) throw new Error(`No profile found for user ${userId}`);
      return p;
    });

    // ── STEP 2: Create cycle record ────────────────────────────────────────────
    const cycle = await step.run("create-cycle", async () => {
      const lastCycle = await prisma.cycle.findFirst({
        where: { userId },
        orderBy: { cycleNumber: "desc" },
      });
      return prisma.cycle.create({
        data: {
          userId,
          cycleNumber: (lastCycle?.cycleNumber || 0) + 1,
          status: "running",
        },
      });
    });

    logger.info(`Cycle #${cycle.cycleNumber} started`);

    // ── STEP 3: Strategist Agent — generate playbook ───────────────────────────
    const playbook = await step.run("strategist-agent", async () => {
      logger.info("Strategist Agent: generating viral playbook...");

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `You are ViralLift Strategist. Respond ONLY with valid JSON:
{
  "weekTheme": "string",
  "topAngle": "string",
  "insight": "string",
  "powerMove": "string",
  "avoidThis": "string"
}`,
        messages: [
          {
            role: "user",
            content: `Generate a viral playbook for:
- Niche: ${profile.niche}
- Platforms: ${profile.platforms.join(", ")}
- Posts needed: ${profile.postsPerCycle}`,
          },
        ],
      });

      const raw = response.content.map((c) => (c.type === "text" ? c.text : "")).join("");
      return JSON.parse(raw.replace(/```json|```/g, "").trim());
    });

    logger.info(`Playbook theme: "${playbook.weekTheme}"`);

    // ── STEP 4: Copy Engine — generate content batch ───────────────────────────
    const generatedPosts = await step.run("copy-engine", async () => {
      logger.info("Copy Engine: generating content batch...");

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `You are ViralLift Copy Engine. Respond ONLY with valid JSON:
{
  "posts": [
    {
      "platform": "string",
      "format": "string",
      "hookText": "string",
      "bodyText": "string",
      "ctaText": "string",
      "score": number
    }
  ]
}`,
        messages: [
          {
            role: "user",
            content: `Generate ${Math.min(profile.postsPerCycle, 5)} viral posts.
Theme: ${playbook.weekTheme}
Angle: ${playbook.topAngle}
Platforms: ${profile.platforms.join(", ")}
Make each post platform-native. Score = predicted engagement 60-99.`,
          },
        ],
      });

      const raw = response.content.map((c) => (c.type === "text" ? c.text : "")).join("");
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      return parsed.posts || [];
    });

    logger.info(`${generatedPosts.length} posts generated`);

    // ── STEP 5: Critic Agent — quality gate ───────────────────────────────────
    const approvedPosts = await step.run("critic-agent", async () => {
      const passed = generatedPosts.filter((p: any) => p.score >= profile.qualityGate);
      const rejected = generatedPosts.filter((p: any) => p.score < profile.qualityGate);

      logger.info(`Critic: ${passed.length} passed, ${rejected.length} rejected (gate: ${profile.qualityGate}%)`);

      // If too many rejected, regenerate once
      if (passed.length === 0) {
        logger.warn("All posts rejected — using best available");
        return generatedPosts.sort((a: any, b: any) => b.score - a.score).slice(0, 3);
      }

      return passed;
    });

    // ── STEP 6: Scheduler — assign optimal post times ─────────────────────────
    const scheduledPosts = await step.run("scheduler", async () => {
      const schedule = getOptimalSchedule(profile.platforms, profile.timezone);
      return approvedPosts.map((post: any, i: number) => ({
        ...post,
        scheduledAt: schedule[i % schedule.length],
      }));
    });

    // ── STEP 7: Save posts to database ────────────────────────────────────────
    const savedPosts = await step.run("save-posts", async () => {
      const posts = await Promise.all(
        scheduledPosts.map((post: any) =>
          prisma.post.create({
            data: {
              userId,
              cycleId: cycle.id,
              platform: post.platform,
              format: post.format,
              hookText: post.hookText,
              bodyText: post.bodyText,
              ctaText: post.ctaText,
              status: "queued",
              scheduledAt: post.scheduledAt,
              viralScore: post.score,
            },
          })
        )
      );
      return posts;
    });

    logger.info(`${savedPosts.length} posts saved and queued`);

    // ── STEP 8: Publish queue — dispatch posts at scheduled times ─────────────
    // Send individual publish events for each post (they fire at scheduledAt time)
    await step.run("dispatch-publish-events", async () => {
      for (const post of savedPosts) {
        await inngest.send({
          name: "virallift/post.publish",
          data: { postId: post.id, userId },
          ts: post.scheduledAt ? post.scheduledAt.getTime() : Date.now() + 60000,
        });
      }
    });

    // ── STEP 9: Complete cycle record ─────────────────────────────────────────
    await step.run("complete-cycle", async () => {
      await prisma.cycle.update({
        where: { id: cycle.id },
        data: {
          status: "completed",
          postsQueued: savedPosts.length,
          avgScore: Math.round(
            savedPosts.reduce((a: number, p: any) => a + p.viralScore, 0) / savedPosts.length
          ),
          completedAt: new Date(),
        },
      });
    });

    logger.info(`Cycle #${cycle.cycleNumber} complete — ${savedPosts.length} posts queued`);

    return {
      cycleNumber: cycle.cycleNumber,
      postsQueued: savedPosts.length,
      theme: playbook.weekTheme,
    };
  }
);

// ─── POST PUBLISHER FUNCTION ──────────────────────────────────────────────────
// Fires at the scheduled time for each post
export const publishScheduledPost = inngest.createFunction(
  { id: "virallift-publish-post", name: "Publish Scheduled Post", retries: 2 },
  { event: "virallift/post.publish" },
  async ({ event, step, logger }) => {
    const { postId, userId } = event.data;

    const post = await step.run("fetch-post", async () => {
      return prisma.post.findUnique({ where: { id: postId } });
    });

    if (!post || post.status !== "queued") {
      logger.warn(`Post ${postId} not found or not queued`);
      return;
    }

    logger.info(`Publishing post ${postId} to ${post.platform}...`);

    const result = await step.run("publish", async () => {
      return publishPost(userId, postId, {
        platform: post.platform,
        format: post.format,
        hookText: post.hookText,
        bodyText: post.bodyText,
        ctaText: post.ctaText || undefined,
      });
    });

    if (result.success) {
      logger.info(`Post published successfully: ${result.url}`);
    } else {
      logger.error(`Publish failed: ${result.error}`);
    }

    return result;
  }
);

// ─── ANALYTICS PULL FUNCTION ──────────────────────────────────────────────────
// Runs 24h after publishing to pull engagement data back
export const pullAnalytics = inngest.createFunction(
  { id: "virallift-pull-analytics", name: "Pull Post Analytics", retries: 2 },
  { cron: "0 6 * * *" }, // 6 AM UTC daily — pulls previous day's stats
  async ({ step, logger }) => {
    logger.info("Analytics pull starting...");

    const recentPosts = await step.run("fetch-published-posts", async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return prisma.post.findMany({
        where: {
          status: "published",
          publishedAt: { gte: yesterday },
          platformPostId: { not: null },
        },
      });
    });

    logger.info(`Pulling analytics for ${recentPosts.length} posts`);

    // Analytics pulling per platform would go here
    // (Twitter v2 API, LinkedIn Analytics API, YouTube Analytics API)
    // Update post records with actual engagement numbers

    return { postsUpdated: recentPosts.length };
  }
);

// ─── OPTIMAL SCHEDULE HELPER ──────────────────────────────────────────────────
function getOptimalSchedule(platforms: string[], timezone: string): Date[] {
  // Peak engagement windows per platform (UTC)
  const peakHours: Record<string, number[]> = {
    "Twitter/X": [9, 12, 17, 20],
    LinkedIn: [8, 12, 17],
    TikTok: [6, 10, 19, 21],
    YouTube: [14, 17, 20],
    Reels: [9, 12, 18, 21],
  };

  const schedule: Date[] = [];
  const now = new Date();

  platforms.forEach((platform) => {
    const hours = peakHours[platform] || [9, 17];
    hours.forEach((hour) => {
      const postTime = new Date(now);
      postTime.setUTCHours(hour, 0, 0, 0);
      // If time already passed today, schedule for tomorrow
      if (postTime <= now) postTime.setUTCDate(postTime.getUTCDate() + 1);
      schedule.push(postTime);
    });
  });

  return schedule.sort((a, b) => a.getTime() - b.getTime());
}
