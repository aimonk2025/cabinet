import { NextResponse, type NextRequest } from "next/server";
import { execFile } from "node:child_process";

import { getCatalogEntry } from "@/lib/agents/mcp-catalog";
import { readServerAuthDetail } from "@/lib/agents/claude-mcp-login";
import { claudeCodeProvider } from "@/lib/agents/providers/claude-code";
import { getRuntimePath, resolveCliCommand } from "@/lib/agents/provider-cli";

/**
 * On-demand "does this actually work?" probe.
 *
 * The cheap handshake (`readServerAuthDetail`) already proves the CLI can reach
 * the server with a valid token — that's what gates the connect flow. This goes
 * one step further and has the agent CALL a tool, so the user sees evidence in
 * their own words ("3 channels visible") rather than a green chip. It spawns an
 * agent, so it's behind a button, never on the connect path.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { id } = (await request.json()) as { id?: string };
  const entry = id ? getCatalogEntry(id) : undefined;
  if (!entry) {
    return NextResponse.json({ ok: false, summary: "Unknown integration." }, { status: 400 });
  }

  // Never run an agent against a server that isn't even connected — the failure
  // would be a confusing agent transcript instead of the real reason.
  const { state, detail } = await readServerAuthDetail(entry.mcpServerName);
  if (state !== "authenticated") {
    return NextResponse.json({
      ok: false,
      summary: detail ?? "Not signed in yet. Click Connect & sign in first.",
    });
  }

  const prompt =
    `Use ONLY the ${entry.mcpServerName} MCP tools. Report the signed-in account and ` +
    `how many channels/resources you can see, in ONE short sentence starting with "Connected as". ` +
    `If the tools error, reply with the exact error text and nothing else.`;

  const summary = await new Promise<string>((resolve) => {
    execFile(
      resolveCliCommand(claudeCodeProvider),
      ["-p", prompt, "--permission-mode", "bypassPermissions"],
      { env: { ...process.env, PATH: getRuntimePath() }, timeout: 90_000, maxBuffer: 1024 * 1024 },
      (err, stdout, stderr) => {
        const out = `${stdout ?? ""}`.trim();
        if (out) return resolve(out.split("\n").filter(Boolean).slice(-1)[0] ?? out);
        resolve(err ? `Couldn't complete the check: ${`${stderr ?? err.message}`.trim()}` : "No response from the agent.");
      },
    );
  });

  return NextResponse.json({ ok: /^connected as/i.test(summary), summary });
}
