import type { KnowledgeProviderId, KnowledgePolicy } from "@/lib/knowledge-sources/store";

/**
 * Connect Knowledge providers (docs/CONNECT_KNOWLEDGE_PRD.md §10). Client-safe
 * metadata only — provider *detection* (scanning the local desktop-sync mount)
 * lives server-side (e.g. detect-desktop.ts for Drive). v1 enables `local` and
 * `google-drive`; iCloud / SharePoint are present-but-disabled ("Coming soon")
 * so the menu reads as a roadmap, not a dead end.
 */
export interface KnowledgeProviderMeta {
  id: KnowledgeProviderId;
  /** Display label (English; menu trigger strings are i18n'd at the call site). */
  label: string;
  /** false → rendered disabled with a "Soon" hint in the Connect Knowledge menu. */
  enabled: boolean;
  /** Default read/write policy for a new connection from this provider. */
  defaultPolicy: KnowledgePolicy;
  /** Brand logo under /public (used for the tree mount icon). Undefined → generic glyph. */
  logo?: string;
}

export const KNOWLEDGE_PROVIDERS: KnowledgeProviderMeta[] = [
  { id: "local", label: "Local folder", enabled: true, defaultPolicy: "read-write" },
  { id: "google-drive", label: "Google Drive", enabled: true, defaultPolicy: "read-only", logo: "/logos/google-drive.svg" },
  { id: "icloud", label: "iCloud Drive", enabled: false, defaultPolicy: "read-only" },
  { id: "sharepoint", label: "SharePoint / OneDrive", enabled: false, defaultPolicy: "read-only", logo: "/logos/onedrive.svg" },
  { id: "dropbox", label: "Dropbox", enabled: false, defaultPolicy: "read-only", logo: "/logos/dropbox.webp" },
];

/** Brand logo path for a provider, or undefined (caller falls back to a glyph). */
export function providerLogo(id: KnowledgeProviderId): string | undefined {
  return KNOWLEDGE_PROVIDERS.find((p) => p.id === id)?.logo;
}

/**
 * Tiles shown in the Connect Knowledge picker (a roadmap grid styled like the
 * Integrations Hub "Files & Storage" row). `kind` drives the click action:
 * "local" → folder-symlink flow, "google-drive" → Drive picker, "soon" →
 * disabled placeholder. This is presentation only — distinct from the store's
 * KnowledgeProviderId (the providers that actually persist a source today).
 */
export interface ConnectKnowledgeTile {
  key: string;
  label: string;
  /**
   * "local" → folder-symlink flow; "google-drive"/"icloud"/… → desktop-sync
   * folder picker; "hub" → open the Integrations Hub at this connector (the
   * key doubles as the catalog slug); "soon" → disabled placeholder.
   */
  kind: "local" | "google-drive" | "icloud" | "onedrive" | "hub" | "soon";
  /** Brand logo under /public; undefined → caller renders a Lucide glyph. */
  logo?: string;
}

export const CONNECT_KNOWLEDGE_TILES: ConnectKnowledgeTile[] = [
  { key: "local", label: "Local folder", kind: "local" },
  { key: "google-drive", label: "Google Drive", kind: "google-drive", logo: "/logos/google-drive.svg" },
  { key: "icloud", label: "iCloud Drive", kind: "soon" },
  { key: "onedrive", label: "OneDrive", kind: "soon", logo: "/logos/onedrive.svg" },
  { key: "sharepoint", label: "SharePoint", kind: "soon", logo: "/logos/sharepoint.svg" },
  { key: "dropbox", label: "Dropbox", kind: "soon", logo: "/logos/dropbox.webp" },
  { key: "box", label: "Box", kind: "soon", logo: "/logos/box.webp" },
  { key: "notion", label: "Notion", kind: "hub", logo: "/logos/notion.svg" },
  { key: "confluence", label: "Confluence", kind: "hub", logo: "/logos/confluence.svg" },
];
