const test = require("node:test");
const assert = require("node:assert/strict");
const { buildAuthorizeUrl } = require("../src/shopee");

test("buildAuthorizeUrl returns a Shopee auth URL with partner data", () => {
  const url = buildAuthorizeUrl({
    partnerId: "2038751",
    partnerKey: "test-key",
    redirectUrl: "https://example.com/callback",
    timestamp: 1710000000,
  });

  const parsed = new URL(url);
  assert.equal(parsed.host, "partner.shopeemobile.com");
  assert.equal(parsed.pathname, "/api/v2/shop/auth_partner");
  assert.equal(parsed.searchParams.get("partner_id"), "2038751");
  assert.equal(
    parsed.searchParams.get("redirect"),
    "https://example.com/callback",
  );
  assert.ok(parsed.searchParams.get("sign"));
  assert.equal(parsed.searchParams.get("timestamp"), "1710000000");
});
