// /app/api/publish/twitter/route.js
// ViralLift OS — Twitter/X Publishing Connector
// Uses Twitter API v2 with OAuth 2.0

import { TwitterApi } from "twitter-api-v2";
import { db } from "@/lib/db";
import { validatePostQueue } from "@/lib/validators";

export async function POST(req) {
  try {
    const { postId, content, scheduleTime } = await req.json();

    // Validate incoming post
    const post = await db.publishQueue.findUnique({ where: { id: postId } });
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    // Init Twitter client with user OAuth tokens
    const client = new TwitterApi({
      appKey:            process.env.TWITTER_API_KEY,
      appSecret:         process.env.TWITTER_API_SECRET,
      accessToken:       process.env.TWITTER_ACCESS_TOKEN,
      accessSecret:      process.env.TWITTER_ACCESS_SECRET,
    });

    const rwClient = client.readWrite;

    // Handle thread vs single tweet
    let result;
    if (post.format === "Thread") {
      // Split on double newline for thread segments
      const tweets = content.split("\n\n").filter(Boolean);
      result = await postThread(rwClient, tweets);
    } else {
      result = await rwClient.v2.tweet(content);
    }

    // Update DB record
    await db.publishQueue.update({
      where: { id: postId },
      data: {
        status:      "published",
        publishedAt: new Date(),
        platformId:  result.data?.id || result[0]?.data?.id,
        platform:    "twitter",
      },
    });

    return Response.json({ success: true, tweetId: result.data?.id });
  } catch (err) {
    console.error("[Twitter Publish Error]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// Post a thread: tweet 1 → reply chain
async function postThread(client, tweets) {
  let lastId = null;
  const results = [];
  for (const tweet of tweets) {
    const params = lastId
      ? { text: tweet, reply: { in_reply_to_tweet_id: lastId } }
      : { text: tweet };
    const res = await client.v2.tweet(params);
    lastId = res.data.id;
    results.push(res);
  }
  return results;
}
