// src/lib/platforms.ts
// ViralLift Platform API Connectors
// Handles publishing to Twitter/X, LinkedIn, YouTube, TikTok

import { TwitterApi } from "twitter-api-v2";
import { google } from "googleapis";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { decryptToken } from "./crypto";

const prisma = new PrismaClient();

// ─── TYPES ────────────────────────────────────────────────────────────────────
export interface PostPayload {
  platform: string;
  hookText: string;
  bodyText: string;
  ctaText?: string;
  format: string;
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  error?: string;
  url?: string;
}

// ─── TOKEN HELPER ─────────────────────────────────────────────────────────────
async function getConnection(userId: string, platform: string) {
  const conn = await prisma.platformConnection.findUnique({
    where: { userId_platform: { userId, platform } },
  });
  if (!conn || !conn.isActive) throw new Error(`No active ${platform} connection`);

  // Check token expiry and refresh if needed
  if (conn.tokenExpiry && conn.tokenExpiry < new Date()) {
    return await refreshToken(userId, platform, conn);
  }

  return {
    accessToken: decryptToken(conn.accessToken),
    refreshToken: conn.refreshToken ? decryptToken(conn.refreshToken) : null,
    accountId: conn.accountId,
    accountName: conn.accountName,
  };
}

async function refreshToken(userId: string, platform: string, conn: any) {
  // Platform-specific token refresh logic
  if (platform === "twitter") {
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });
    const { accessToken, refreshToken } = await client.refreshOAuth2Token(
      decryptToken(conn.refreshToken)
    );
    await prisma.platformConnection.update({
      where: { id: conn.id },
      data: {
        accessToken: encryptToken(accessToken),
        refreshToken: encryptToken(refreshToken),
        tokenExpiry: new Date(Date.now() + 7200 * 1000), // 2 hours
      },
    });
    return { accessToken, accountId: conn.accountId, accountName: conn.accountName };
  }
  throw new Error(`Token refresh not implemented for ${platform}`);
}

// ─── TWITTER / X PUBLISHER ────────────────────────────────────────────────────
export async function publishToTwitter(
  userId: string,
  payload: PostPayload
): Promise<PublishResult> {
  try {
    const conn = await getConnection(userId, "twitter");
    const client = new TwitterApi(conn.accessToken);

    const fullText = `${payload.hookText}\n\n${payload.bodyText}${
      payload.ctaText ? `\n\n${payload.ctaText}` : ""
    }`;

    if (payload.format === "Thread") {
      // Split into thread chunks of ~260 chars
      const chunks = splitIntoThread(fullText);
      let lastTweetId: string | undefined;
      let firstTweetId: string | undefined;

      for (const chunk of chunks) {
        const tweet = await client.v2.tweet({
          text: chunk,
          ...(lastTweetId ? { reply: { in_reply_to_tweet_id: lastTweetId } } : {}),
        });
        if (!firstTweetId) firstTweetId = tweet.data.id;
        lastTweetId = tweet.data.id;
      }
      return {
        success: true,
        platformPostId: firstTweetId,
        url: `https://twitter.com/i/web/status/${firstTweetId}`,
      };
    } else {
      // Single tweet
      const tweet = await client.v2.tweet({ text: fullText.slice(0, 280) });
      return {
        success: true,
        platformPostId: tweet.data.id,
        url: `https://twitter.com/i/web/status/${tweet.data.id}`,
      };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function splitIntoThread(text: string): string[] {
  const maxLen = 260;
  const paragraphs = text.split("\n\n");
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length > maxLen) {
      if (current) chunks.push(current.trim());
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }
  if (current) chunks.push(current.trim());

  // Add numbering
  return chunks.map((c, i) => (chunks.length > 1 ? `${i + 1}/${chunks.length} ${c}` : c));
}

// ─── LINKEDIN PUBLISHER ───────────────────────────────────────────────────────
export async function publishToLinkedIn(
  userId: string,
  payload: PostPayload
): Promise<PublishResult> {
  try {
    const conn = await getConnection(userId, "linkedin");
    const fullText = `${payload.hookText}\n\n${payload.bodyText}${
      payload.ctaText ? `\n\n${payload.ctaText}` : ""
    }`;

    const response = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        author: `urn:li:person:${conn.accountId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: fullText },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    const postId = response.headers["x-restli-id"] || response.data.id;
    return {
      success: true,
      platformPostId: postId,
      url: `https://www.linkedin.com/feed/update/${postId}`,
    };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// ─── YOUTUBE PUBLISHER ────────────────────────────────────────────────────────
export async function publishToYouTube(
  userId: string,
  payload: PostPayload
): Promise<PublishResult> {
  try {
    const conn = await getConnection(userId, "youtube");
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ access_token: conn.accessToken });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    if (payload.format === "Community Post") {
      // YouTube Community Post (text-only)
      // Note: requires YouTube Partner Program or 500+ subscribers
      const response = await youtube.commentThreads.insert({
        part: ["snippet"],
        requestBody: {
          snippet: {
            channelId: conn.accountId,
            topLevelComment: {
              snippet: {
                textOriginal: `${payload.hookText}\n\n${payload.bodyText}`,
              },
            },
          },
        },
      });
      return { success: true, platformPostId: response.data.id! };
    }

    // For Shorts/video uploads — returns instructions since video file needed
    return {
      success: true,
      platformPostId: "text-content-queued",
      url: `Content scripted for YouTube. Upload video via YouTube Studio with this script.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── TIKTOK PUBLISHER ─────────────────────────────────────────────────────────
export async function publishToTikTok(
  userId: string,
  payload: PostPayload
): Promise<PublishResult> {
  try {
    const conn = await getConnection(userId, "tiktok");

    // TikTok Content Posting API v2
    // Note: Direct video upload requires video file. Text content queued for video creation.
    const response = await axios.post(
      "https://open.tiktokapis.com/v2/post/publish/content/init/",
      {
        post_info: {
          title: payload.hookText.slice(0, 150),
          description: `${payload.bodyText}\n\n${payload.ctaText || ""}`,
          privacy_level: "SELF_ONLY", // Change to PUBLIC_TO_EVERYONE when ready
          disable_comment: false,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: "", // You must provide a hosted video URL
        },
      },
      {
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );

    return {
      success: true,
      platformPostId: response.data?.data?.publish_id,
      url: "TikTok post queued — attach video file via TikTok Creator Portal",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

// ─── UNIFIED PUBLISHER ────────────────────────────────────────────────────────
export async function publishPost(
  userId: string,
  postId: string,
  payload: PostPayload
): Promise<PublishResult> {
  let result: PublishResult;

  switch (payload.platform.toLowerCase()) {
    case "twitter":
    case "twitter/x":
      result = await publishToTwitter(userId, payload);
      break;
    case "linkedin":
      result = await publishToLinkedIn(userId, payload);
      break;
    case "youtube":
      result = await publishToYouTube(userId, payload);
      break;
    case "tiktok":
    case "reels":
      result = await publishToTikTok(userId, payload);
      break;
    default:
      result = { success: false, error: `Unknown platform: ${payload.platform}` };
  }

  // Update post record in DB
  await prisma.post.update({
    where: { id: postId },
    data: {
      status: result.success ? "published" : "failed",
      publishedAt: result.success ? new Date() : undefined,
      platformPostId: result.platformPostId,
    },
  });

  return result;
}

// Placeholder — implement with your crypto lib
function encryptToken(token: string): string {
  return Buffer.from(token).toString("base64"); // REPLACE with real encryption
}
