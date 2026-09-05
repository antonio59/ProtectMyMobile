import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeGoogleSiteVerification } from "./googleSiteVerification";

const TOKEN = "ExampleGoogleSiteVerificationToken123";

test("returns a bare token unchanged", () => {
  assert.equal(normalizeGoogleSiteVerification(TOKEN), TOKEN);
});

test("trims whitespace around a bare token", () => {
  assert.equal(normalizeGoogleSiteVerification(`  ${TOKEN}  `), TOKEN);
});

test("extracts content=\"...\" from a full meta tag", () => {
  const snippet = `<meta name="google-site-verification" content="${TOKEN}" />`;
  assert.equal(normalizeGoogleSiteVerification(snippet), TOKEN);
});

test("extracts content='...' single-quoted attribute", () => {
  const snippet = `<meta name='google-site-verification' content='${TOKEN}'>`;
  assert.equal(normalizeGoogleSiteVerification(snippet), TOKEN);
});

test("extracts content=&quot;...&quot; from an HTML-escaped snippet", () => {
  const snippet = `<meta name=&quot;google-site-verification&quot; content=&quot;${TOKEN}&quot; />`;
  assert.equal(normalizeGoogleSiteVerification(snippet), TOKEN);
});

test("unwraps the live nested-meta env value", () => {
  const nested =
    `<meta name="google-site-verification" content="<meta name=&quot;google-site-verification&quot; content=&quot;${TOKEN}&quot; />">`;
  assert.equal(normalizeGoogleSiteVerification(nested), TOKEN);
});

test("returns empty for missing or blank input", () => {
  assert.equal(normalizeGoogleSiteVerification(undefined), "");
  assert.equal(normalizeGoogleSiteVerification(null), "");
  assert.equal(normalizeGoogleSiteVerification(""), "");
  assert.equal(normalizeGoogleSiteVerification("   "), "");
});

test("rejects leftover markup that still contains < or >", () => {
  assert.equal(normalizeGoogleSiteVerification("<script>alert(1)</script>"), "");
  assert.equal(normalizeGoogleSiteVerification("abc<def"), "");
});
