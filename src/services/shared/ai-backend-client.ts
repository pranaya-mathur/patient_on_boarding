import { failureResult, successResult, type AdapterResult } from "@/services/shared/adapter-result";

const AI_BACKEND_URL = process.env.AI_BACKEND_URL ?? "http://localhost:8001";

export async function postJson<TResponse, TBody>(path: string, body: TBody): Promise<AdapterResult<TResponse>> {
  try {
    const response = await fetch(`${AI_BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      return failureResult({
        code: "AI_BACKEND_HTTP_ERROR",
        message: `AI backend request failed with ${response.status}`,
        retryable: response.status >= 500 || response.status === 429,
        transient: response.status >= 500,
        details: { path, status: response.status },
      });
    }

    const json = (await response.json()) as TResponse;
    return successResult(json);
  } catch (error) {
    return failureResult({
      code: "AI_BACKEND_UNREACHABLE",
      message: "Unable to connect to AI backend.",
      retryable: true,
      transient: true,
      details: { path, error: error instanceof Error ? error.message : "unknown" },
    });
  }
}

