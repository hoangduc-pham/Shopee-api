const crypto = require("crypto");

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

module.exports = {
  buildAuthorizeUrl,
};
