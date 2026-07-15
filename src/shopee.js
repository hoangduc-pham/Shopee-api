const crypto = require("crypto");
const https = require("https");

function buildAuthorizeUrl({
  partnerId,
  partnerKey,
  redirectUrl,
  timestamp = Math.floor(Date.now() / 1000),
  state,
}) {
  if (!partnerId) {
    throw new Error("partnerId is required");
  }

  if (!redirectUrl) {
    throw new Error("redirectUrl is required");
  }

  const params = new URLSearchParams({
    partner_id: String(partnerId),
    timestamp: String(timestamp),
    redirect: redirectUrl,
  });

  if (state) {
    params.set("state", state);
  }

  const sortedEntries = Array.from(params.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const baseString = sortedEntries
    .map(([key, value]) => `${key}${value}`)
    .join("");
  const sign = crypto
    .createHmac("sha256", partnerKey || "")
    .update(baseString)
    .digest("hex")
    .toUpperCase();

  params.set("sign", sign);

  return `https://partner.shopeemobile.com/api/v2/shop/auth_partner?${params.toString()}`;
}

function buildSignedParams({
  partnerId,
  partnerKey,
  params = {},
  timestamp = Math.floor(Date.now() / 1000),
}) {
  const allParams = {
    ...params,
    partner_id: Number(partnerId),
    timestamp: Number(timestamp),
  };

  const sortedEntries = Object.entries(allParams)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .sort(([a], [b]) => a.localeCompare(b));
  const baseString = sortedEntries
    .map(([key, value]) => `${key}${value}`)
    .join("");
  const sign = crypto
    .createHmac("sha256", partnerKey || "")
    .update(baseString)
    .digest("hex")
    .toUpperCase();

  return {
    ...allParams,
    sign,
  };
}

function postShopeeJson({ host, path, payload, partnerKey }) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(payload));
    const req = https.request(
      {
        hostname: host,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": data.length,
        },
      },
      (res) => {
        let response = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          response += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(response));
          } catch (error) {
            resolve({ raw: response });
          }
        });
      },
    );

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function exchangeCodeForToken({ code, partnerId, partnerKey, shopId }) {
  const payload = buildSignedParams({
    partnerId,
    partnerKey,
    params: { code, shop_id: shopId },
  });

  return postShopeeJson({
    host: "partner.shopeemobile.com",
    path: "/api/v2/auth/token/get",
    payload,
    partnerKey,
  });
}

async function getProducts({
  accessToken,
  partnerId,
  partnerKey,
  shopId,
  pageSize = 10,
  offset = 0,
}) {
  const payload = buildSignedParams({
    partnerId,
    partnerKey,
    params: {
      access_token: accessToken,
      shop_id: shopId,
      page_size: pageSize,
      offset,
      item_status: "NORMAL",
    },
  });

  return postShopeeJson({
    host: "partner.shopeemobile.com",
    path: "/api/v2/product/get_item_list",
    payload,
    partnerKey,
  });
}

module.exports = {
  buildAuthorizeUrl,
  buildSignedParams,
  exchangeCodeForToken,
  getProducts,
};
