// /app/api/publish/tiktok/route.js
// ViralLift OS — TikTok Publishing Connector
// Uses TikTok Content Posting API v2

import { db } from "@/lib/db";

const TIKTOK_API = "https://open.tiktokapis.com/v2";

export async function POST(req) {
  try {
    const { postId } = await req.json();

    const post = await db.publishQueue.findUnique({ where: { id: postId } });
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    const user = await db.user.findUnique({
      where: { id: post.userId },
      select: { tiktokAccessToken: true, tiktokOpenId: true },
    });

    if (!user?.tiktokAccessToken) {
      return Response.json({ error: "TikTok not connected" }, { status: 401 });
    }

    const headers = {
      Authorization:  `Bearer ${user.tiktokAccessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    };

    // Step 1: Initialize direct post (text + caption)
    // For video, you'd upload to the video_url field
    const initPayload = {
      post_info: {
        title:           post.hook,
        description:     post.content,
        privacy_level:   "PUBLIC_TO_EVERYONE",
        disable_duet:    false,
        disable_comment: false,
        disable_stitch:  false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source:    "PULL_FROM_URL",
        video_url: post.videoUrl || null, // Attach video URL if available
      },
    };

    // TikTok photo post (text+image) — use if no video
    const photoPayload = {
      post_info: {
        title:         post.hook,
        description:   post.content,
        privacy_level: "PUBLIC_TO_EVERYONE",
      },
      source_info: {
        source:     "WEB_IMAGES",
        images:     post.imageUrls || [],
        image_cover_index: 0,
      },
      post_mode:    "DIRECT_POST",
      media_type:   "PHOTO",
    };

    const payload = post.videoUrl ? initPayload : photoPayload;
    const endpoint = post.videoUrl
      ? `${TIKTOK_API}/post/publish/video/init/`
      : `${TIKTOK_API}/post/publish/content/init/`;

    const res = await fetch(endpoint, {
      method:  "POST",
      headers,
      body:    JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.error?.code !== "ok") {
      throw new Error(data.error?.message || "TikTok publish failed");
    }

    await db.publishQueue.update({
      where: { id: postId },
      data: {
        status:      "published",
        publishedAt: new Date(),
        platformId:  data.data?.publish_id,
        platform:    "tiktok",
      },
    });

    return Response.json({ success: true, publishId: data.data?.publish_id });
  } catch (err) {
    console.error("[TikTok Publish Error]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
