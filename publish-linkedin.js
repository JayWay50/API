// /app/api/publish/linkedin/route.js
// ViralLift OS — LinkedIn Publishing Connector
// Uses LinkedIn API v2 with OAuth 2.0

import { db } from "@/lib/db";

const LINKEDIN_API = "https://api.linkedin.com/v2";

export async function POST(req) {
  try {
    const { postId } = await req.json();

    const post = await db.publishQueue.findUnique({ where: { id: postId } });
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    // Get user's LinkedIn access token from DB
    const user = await db.user.findUnique({
      where: { id: post.userId },
      select: { linkedinAccessToken: true, linkedinPersonId: true },
    });

    if (!user?.linkedinAccessToken) {
      return Response.json({ error: "LinkedIn not connected" }, { status: 401 });
    }

    const headers = {
      Authorization:   `Bearer ${user.linkedinAccessToken}`,
      "Content-Type":  "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    };

    // Build LinkedIn UGC post payload
    const payload = {
      author:          `urn:li:person:${user.linkedinPersonId}`,
      lifecycleState:  "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: post.content },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    const res = await fetch(`${LINKEDIN_API}/ugcPosts`, {
      method:  "POST",
      headers,
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "LinkedIn publish failed");
    }

    const data = await res.json();

    await db.publishQueue.update({
      where: { id: postId },
      data: {
        status:      "published",
        publishedAt: new Date(),
        platformId:  data.id,
        platform:    "linkedin",
      },
    });

    return Response.json({ success: true, postId: data.id });
  } catch (err) {
    console.error("[LinkedIn Publish Error]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
