const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface AskSource {
  document_id: string | null;
  location: {
    type?: string;
    s3Location?: { uri?: string };
    webLocation?: { url?: string };
    [key: string]: unknown;
  } | null;
  metadata: Record<string, unknown>;
  score: number | null;
}

export interface AskResponse {
  question: string;
  answer: { answer: string; source: AskSource[] };
}

export interface MessageOut {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string | null;
}

export interface ConversationOut {
  id: number;
  title: string | null;
  created_at: string | null;
  updated_at: string | null;
  messages: MessageOut[];
}

function authHeader(token: string): HeadersInit {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function throwIfError(detail: unknown, fallback: string): never {
  const message = Array.isArray(detail)
    ? (detail as { msg: string }[]).map((d) => d.msg).join(" ")
    : (detail as string) ?? fallback;
  throw new Error(message);
}

// ── Legacy single-shot RAG ────────────────────────────────────────────────────
export async function askQuestion(token: string, question: string): Promise<AskResponse> {
  const res = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throwIfError((await res.json().catch(() => ({}))).detail, `Failed (${res.status})`);
  return res.json();
}

// ── Conversations ─────────────────────────────────────────────────────────────
export async function listConversations(token: string): Promise<ConversationOut[]> {
  const res = await fetch(`${API_URL}/conversations`, { headers: authHeader(token) });
  if (!res.ok) throwIfError((await res.json().catch(() => ({}))).detail, `Failed (${res.status})`);
  return res.json();
}

export async function getConversation(token: string, id: number): Promise<ConversationOut> {
  const res = await fetch(`${API_URL}/conversations/${id}`, { headers: authHeader(token) });
  if (!res.ok) throwIfError((await res.json().catch(() => ({}))).detail, `Failed (${res.status})`);
  return res.json();
}

export async function createConversation(token: string): Promise<ConversationOut> {
  const res = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: authHeader(token),
  });
  if (!res.ok) throwIfError((await res.json().catch(() => ({}))).detail, `Failed to start conversation (${res.status})`);
  return res.json();
}

export async function sendMessage(
  token: string,
  conversationId: number,
  content: string,
  mode: "rag" | "llm"
): Promise<MessageOut> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify({ content, mode }),
  });
  if (!res.ok) throwIfError((await res.json().catch(() => ({}))).detail, `Failed to send message (${res.status})`);
  return res.json();
}

export async function deleteConversation(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/conversations/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
  if (!res.ok) throwIfError((await res.json().catch(() => ({}))).detail, `Failed to delete conversation (${res.status})`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getSourceLabel(source: AskSource): string {
  const uri = source.location?.s3Location?.uri;
  if (uri) return uri.split("/").pop() || uri;
  const url = source.location?.webLocation?.url;
  if (url) return url;
  const t = source.metadata?.["title"] ?? source.metadata?.["x-amz-bedrock-kb-title"];
  if (typeof t === "string") return t;
  return source.document_id ?? "Source";
}

/** Return a short human-readable title for a conversation. */
export function conversationTitle(conv: ConversationOut): string {
  if (conv.title?.trim()) return conv.title.trim();
  const first = conv.messages.find((m) => m.role === "user");
  if (first) return first.content.slice(0, 48) + (first.content.length > 48 ? "…" : "");
  return `New conversation`;
}

/** Format a UTC ISO string as a relative label like "Today", "Yesterday", or a date. */
export function relativeDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (daysDiff === 0) return "Today";
  if (daysDiff === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
