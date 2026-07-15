const express = require("express");
const { buildAuthorizeUrl } = require("./shopee");

const app = express();
const PORT = process.env.PORT || 3000;
const PARTNER_ID = process.env.PARTNER_ID || "2038751";
const PARTNER_KEY =
  process.env.PARTNER_KEY ||
  "shpk76484f6c656d46675a745457444e555a73454e694f444b5472785250636e";
const REDIRECT_URL =
  process.env.REDIRECT_URL ||
  "https://shopee-api-production.up.railway.app/shopee-webhook";

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Shopee API backend is running",
    endpoints: {
      webhook: "/shopee-webhook",
      authorize: "/authorize",
      callback: "/shopee-webhook",
    },
  });
});

app.get("/authorize", (req, res) => {
  try {
    const authorizeUrl = buildAuthorizeUrl({
      partnerId: PARTNER_ID,
      partnerKey: PARTNER_KEY,
      redirectUrl: REDIRECT_URL,
      state: req.query.state || "shop-auth",
    });

    res.redirect(authorizeUrl);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/shopee-webhook", (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    console.error("❌ Shopee authorization failed:", error);
    return res.status(400).send(`Authorization failed: ${error}`);
  }

  if (code) {
    console.log("✅ Shopee authorization code received:", code);
    console.log("State:", state || "none");
    return res.status(200).json({
      message: "Authorization code received",
      code,
      state,
    });
  }

  return res.status(200).send("OK");
});

app.post("/shopee-webhook", (req, res) => {
  const body = req.body;

  if (body && body.code) {
    console.log(
      "👉 Validating callback URL with Shopee. Code received:",
      body.code,
    );
    return res.status(200).json({ code: body.code });
  }

  console.log("📦 Received real Shopee notification:", body);
  return res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Server Shopee Webhook đang chạy trên cổng ${PORT}`);
  console.log(`Authorize URL: http://localhost:${PORT}/authorize`);
});
