const express = require("express");
const {
  buildAuthorizeUrl,
  exchangeCodeForToken,
  getProducts,
} = require("./shopee");

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

app.get("/shopee-webhook", async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    console.error("❌ Shopee authorization failed:", error);
    return res.status(400).send(`Authorization failed: ${error}`);
  }

  if (code) {
    console.log("✅ Shopee authorization code received:", code);
    console.log("State:", state || "none");

    try {
      const tokenResponse = await exchangeCodeForToken({
        code,
        partnerId: PARTNER_ID,
        partnerKey: PARTNER_KEY,
        shopId: req.query.shop_id,
      });

      return res.status(200).json({
        message: "Authorization code received",
        code,
        state,
        tokenResponse,
      });
    } catch (err) {
      console.error("Failed to exchange code:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(200).send("OK");
});

app.get("/products", async (req, res) => {
  const accessToken = req.query.access_token;
  const shopId = req.query.shop_id;

  if (!accessToken || !shopId) {
    return res.status(400).json({
      error: "Missing access_token or shop_id",
    });
  }

  try {
    const products = await getProducts({
      accessToken,
      partnerId: PARTNER_ID,
      partnerKey: PARTNER_KEY,
      shopId,
      pageSize: Number(req.query.page_size || 10),
      offset: Number(req.query.offset || 0),
    });

    return res.status(200).json(products);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return res.status(500).json({ error: err.message });
  }
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
