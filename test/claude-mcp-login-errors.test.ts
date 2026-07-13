import test from "node:test";
import assert from "node:assert/strict";
import { friendlyLoginError } from "@/lib/agents/claude-mcp-login";

test("maps Meta's DCR refusal to copy that names the cause and the fix", () => {
  const raw = 'Error: {"error":"invalid_client_metadata","error_description":"Dynamic registration is not available for this client."}';
  const mapped = friendlyLoginError(raw);
  assert.ok(mapped, "expected a mapped message");
  assert.match(mapped, /Claude Code/);
});

test("leaves unrecognized errors alone so we never mask a real failure", () => {
  assert.equal(friendlyLoginError("Error: connection refused"), null);
});

test("returns null for empty output", () => {
  assert.equal(friendlyLoginError(""), null);
});
