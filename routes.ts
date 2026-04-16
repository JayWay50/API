// src/api/routes.ts
// ViralLift API Routes Reference
// These map to Next.js App Router: /app/api/...

// ─────────────────────────────────────────────────────────────────────────────
// FILE: app/api/auth/[platform]/route.ts
// Initiates OAuth flow for each platform
// ─────────────────────────────────────────────────────────────────────────────
export const oauthInitHandler = `
// app/api/auth/[platform]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

export async function GET(req: NextRequest, { params }: { params: { platform: string } }) {
  const { platform } = params;

  switch (platform) {
    case "twitter": {
      const client = new TwitterApi({
        clientId: process.env.TWITTER_CLIENT_ID!,
        clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      });
      const { url, state, codeVerifier } = client.generateOAuth2AuthLink(
        process.env.TWITTER_CALLBACK_URL!,
        { scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] }
      );
      // Store state & codeVerifier in session/cookie
      const response = NextResponse.redirect(url);
      response.cookies.set("oauth_state", state, { httpOnly: true, secure: true });
      response.cookies.set("oauth_verifier", codeVerifier, { httpOnly: true, secure: true });
      return response;
    }

    case "linkedin": {
      const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        redirect_uri: process.env.LINKEDIN_CALLBACK_URL!,
        scope: "openid profile w_member_social",
        state: crypto.randomUUID(),
      });
      return NextResponse.redirect(\`https://www.linkedin.com/oauth/v2/authorization?\${params}\`);
    }

    case "google": {
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
        response_type: "code",
        scope: "https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload",
        access_type: "offline",
        prompt: "consent",
      });
      return NextResponse.redirect(\`https://accounts.google.com/o/oauth2/v2/auth?\${params}\`);
    }

    case "tiktok": {
      const params = new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        response_type: "code",
        scope: "user.info.basic,video.upload,video.publish",
        redirect_uri: process.env.TIKTOK_CALLBACK_URL!,
        state: crypto.randomUUID(),
      });
      return NextResponse.redirect(\`https://www.tiktok.com/v2/auth/authorize/?\${params}\`);
    }

    default:
      return NextResponse.json({ error: "Unknown platform" }, { status: 400 });
  }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// FILE: app/api/auth/callback/[platform]/route.ts
// Handles OAuth callback, stores encrypted tokens
// ─────────────────────────────────────────────────────────────────────────────
export const oauthCallbackHandler = `
// app/api/auth/callback/[platform]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { PrismaClient } from "@prisma/client";
import { encryptToken } from "@/lib/crypto";
import { getSessionUser } from "@/lib/auth";
import axios from "axios";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { platform: string } }) {
  const { platform } = params;
  const { searchParams } = new URL(req.url);
  const userId = await getSessionUser(req); // Get from JWT/session

  try {
    switch (platform) {
      case "twitter": {
        const code = searchParams.get("code")!;
        const state = searchParams.get("state")!;
        const storedState = req.cookies.get("oauth_state")?.value;
        const codeVerifier = req.cookies.get("oauth_verifier")?.value!;

        if (state !== storedState) throw new Error("State mismatch");

        const client = new TwitterApi({
          clientId: process.env.TWITTER_CLIENT_ID!,
          clientSecret: process.env.TWITTER_CLIENT_SECRET!,
        });

        const { accessToken, refreshToken, expiresIn, client: authedClient } =
          await client.loginWithOAuth2({ code, codeVerifier, redirectUri: process.env.TWITTER_CALLBACK_URL! });

        const me = await authedClient.v2.me();

        await prisma.platformConnection.upsert({
          where: { userId_platform: { userId, platform: "twitter" } },
          create: {
            userId, platform: "twitter",
            accessToken: encryptToken(accessToken),
            refreshToken: refreshToken ? encryptToken(refreshToken) : null,
            tokenExpiry: new Date(Date.now() + expiresIn * 1000),
            accountId: me.data.id,
            accountName: me.data.username,
          },
          update: {
            accessToken: encryptToken(accessToken),
            refreshToken: refreshToken ? encryptToken(refreshToken) : null,
            tokenExpiry: new Date(Date.now() + expiresIn * 1000),
            isActive: true,
          },
        });

        return NextResponse.redirect(\`\${process.env.NEXT_PUBLIC_APP_URL}/settings?connected=twitter\`);
      }

      case "linkedin": {
        const code = searchParams.get("code")!;
        const tokenRes = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", {
          grant_type: "authorization_code",
          code,
          redirect_uri: process.env.LINKEDIN_CALLBACK_URL,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        });

        const { access_token, expires_in } = tokenRes.data;
        const profileRes = await axios.get("https://api.linkedin.com/v2/me", {
          headers: { Authorization: \`Bearer \${access_token}\` },
        });

        await prisma.platformConnection.upsert({
          where: { userId_platform: { userId, platform: "linkedin" } },
          create: {
            userId, platform: "linkedin",
            accessToken: encryptToken(access_token),
            tokenExpiry: new Date(Date.now() + expires_in * 1000),
            accountId: profileRes.data.id,
            accountName: \`\${profileRes.data.localizedFirstName} \${profileRes.data.localizedLastName}\`,
          },
          update: {
            accessToken: encryptToken(access_token),
            tokenExpiry: new Date(Date.now() + expires_in * 1000),
            isActive: true,
          },
        });

        return NextResponse.redirect(\`\${process.env.NEXT_PUBLIC_APP_URL}/settings?connected=linkedin\`);
      }

      default:
        return NextResponse.json({ error: "Unknown platform" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.redirect(
      \`\${process.env.NEXT_PUBLIC_APP_URL}/settings?error=\${encodeURIComponent(error.message)}\`
    );
  }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// FILE: app/api/loop/trigger/route.ts
// Manually trigger the autonomous loop
// ─────────────────────────────────────────────────────────────────────────────
export const loopTriggerHandler = `
// app/api/loop/trigger/route.ts
import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = await getSessionUser(req);
  await inngest.send({ name: "virallift/loop.trigger", data: { userId } });
  return NextResponse.json({ success: true, message: "Autonomous loop triggered" });
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// FILE: app/api/inngest/route.ts
// Inngest webhook handler — DO NOT MODIFY
// ─────────────────────────────────────────────────────────────────────────────
export const inngestHandler = `
// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { autonomousLoop, publishScheduledPost, pullAnalytics } from "@/workers/autonomousLoop";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [autonomousLoop, publishScheduledPost, pullAnalytics],
});
`;

// ─────────────────────────────────────────────────────────────────────────────
// FILE: app/api/analytics/route.ts
// Returns analytics data for the dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const analyticsHandler = `
// app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const userId = await getSessionUser(req);

  const [posts, cycles, connections] = await Promise.all([
    prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.cycle.findMany({
      where: { userId },
      orderBy: { cycleNumber: "desc" },
      take: 10,
    }),
    prisma.platformConnection.findMany({
      where: { userId, isActive: true },
    }),
  ]);

  const totalImpressions = posts.reduce((a, p) => a + (p.impressions || 0), 0);
  const totalEngagements = posts.reduce((a, p) => a + (p.engagements || 0), 0);
  const avgScore = posts.length
    ? Math.round(posts.reduce((a, p) => a + p.viralScore, 0) / posts.length)
    : 0;

  return NextResponse.json({
    posts,
    cycles,
    connections: connections.map((c) => ({ platform: c.platform, accountName: c.accountName })),
    summary: {
      totalImpressions,
      totalEngagements,
      avgScore,
      totalPosts: posts.length,
      totalCycles: cycles.length,
    },
  });
}
`;
