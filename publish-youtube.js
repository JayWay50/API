// /app/api/publish/youtube/route.js
// ViralLift OS — YouTube Publishing Connector
// Uses YouTube Data API v3

import { google } from "googleapis";
import { db }    from "@/lib/db";
import { Readable } from "stream";

const youtube = google.youtube("v3");

export async function POST(req) {
  try {
    const { postId } = await req.json();

    const post = await db.publishQueue.findUnique({ where: { id: postId } });
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    const user = await db.user.findUnique({
      where: { id: post.userId },
      select: { youtubeAccessToken: true, youtubeRefreshToken: true },
    });

    if (!user?.youtubeAccessToken) {
      return Response.json({ error: "YouTube not connected" }, { status: 401 });
    }

    // Init OAuth2 client
    const auth = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );
    auth.setCredentials({
      access_token:  user.youtubeAccessToken,
      refresh_token: user.youtubeRefreshToken,
    });

    if (post.format === "Shorts Script" || post.videoUrl) {
      // Video upload
      const res = await youtube.videos.insert({
        auth,
        part:          ["snippet", "status"],
        requestBody: {
          snippet: {
            title:       post.hook,
            description: post.content,
            tags:        post.tags || [],
            categoryId:  "22", // People & Blogs
          },
          status: {
            privacyStatus:          "public",
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          body: await fetchVideoStream(post.videoUrl),
        },
      });

      await db.publishQueue.update({
        where: { id: postId },
        data: { status: "published", publishedAt: new Date(), platformId: res.data.id, platform: "youtube" },
      });

      return Response.json({ success: true, videoId: res.data.id });

    } else {
      // Community post (text only)
      // NOTE: Community posts require channel with 500+ subscribers via YouTube API
      // For channels without access, store as draft and notify user
      await db.publishQueue.update({
        where: { id: postId },
        data: { status: "draft", platform: "youtube", notes: "Community post — manual publish required" },
      });
      return Response.json({ success: true, note: "Saved as draft — YouTube community posts require manual publish for new channels" });
    }

  } catch (err) {
    console.error("[YouTube Publish Error]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

async function fetchVideoStream(url) {
  const res = await fetch(url);
  return Readable.fromWeb(res.body);
}
