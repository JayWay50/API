// /lib/publisher.js
// ViralLift OS — Unified Publisher
// Routes posts to the correct platform connector

export async function publishPost(post) {
  const platform = post.platform.toLowerCase().replace("/", "_");

  const routes = {
    twitter:   "/api/publish/twitter",
    twitter_x: "/api/publish/twitter",
    linkedin:  "/api/publish/linkedin",
    tiktok:    "/api/publish/tiktok",
    reels:     "/api/publish/reels",   // Uses Instagram Graph API
    youtube:   "/api/publish/youtube",
  };

  const route = routes[platform];
  if (!route) throw new Error(`No connector for platform: ${platform}`);

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}${route}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", "x-internal-key": process.env.INTERNAL_API_KEY },
    body:    JSON.stringify({ postId: post.id }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `Publish failed for ${platform}`);
  }

  return res.json();
}
