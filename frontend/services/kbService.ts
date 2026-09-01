const API_URL = process.env.NEXT_PUBLIC_API_URL; // "http://localhost:8000/api/v1"

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
  answer: {
    answer: string;
    source: AskSource[];
  };
}

export async function askQuestion(token: string, question: string): Promise<AskResponse> {
  const res = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body.detail;
    const message = Array.isArray(detail)
      ? detail.map((d: { msg: string }) => d.msg).join(" ")
      : detail ?? `Failed to get an answer (${res.status})`;
    throw new Error(message);
  }

  return res.json();
}

/**
 * Best-effort human-readable label for a source, since the exact shape of
 * `location`/`metadata` depends on how the knowledge base was configured
 * (S3 documents, web crawler, etc.).
 */
export function getSourceLabel(source: AskSource): string {
  const uri = source.location?.s3Location?.uri;
  if (uri) {
    return uri.split("/").pop() || uri;
  }

  const url = source.location?.webLocation?.url;
  if (url) return url;

  const titleMeta = source.metadata?.["title"] ?? source.metadata?.["x-amz-bedrock-kb-title"];
  if (typeof titleMeta === "string") return titleMeta;

  if (source.document_id) return source.document_id;

  return "Source";
}
