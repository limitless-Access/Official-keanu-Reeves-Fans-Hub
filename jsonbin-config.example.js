// JSONBin configuration (PUBLIC files only)
// ─────────────────────────────────────────
// NEVER put secret keys in client-side code.
// Keep the Master Key / Access Key in a protected backend or serverless function.
// The Bin ID can safely be referenced by the frontend.

window.JSONBIN_CONFIG = {
  binId: "YOUR_PUBLIC_BIN_ID"
};

// Recommended production setup:
// 1. Create a small API endpoint (Cloudflare Worker, Vercel, Netlify, etc.)
// 2. Store the JSONBin Master Key as an environment secret on that endpoint
// 3. Set the line below so the browser talks only to your endpoint:
//
// window.HUB_PROXY_URL = "https://your-api.example.com/hub-write";
