export type SafeStreamSseOptions = {
  signal?: AbortSignal;
  onChunk: (text: string) => void;
  /** Called when a malformed SSE line is skipped (network blip / truncated JSON). */
  onParseWarning?: (detail: string) => void;
};

export type SafeStreamSseResult = {
  /** Full text accumulated from successful chunks. */
  text: string;
  aborted: boolean;
  /** Set when the stream ended with an error but partial text may exist. */
  error: string | null;
  /** Number of malformed lines skipped during decode. */
  skippedLines: number;
};

function parseSseDataLine(
  line: string,
): { text?: string; error?: string } | null {
  if (!line.startsWith("data: ")) return null;

  const data = line.slice(6).trim();
  if (!data || data === "[DONE]") return null;

  try {
    const parsed = JSON.parse(data) as { text?: string; error?: string };
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fail-safe SSE POST decoder: never throws on malformed lines; supports abort;
 * returns partial text when the connection drops mid-stream.
 */
export async function safeStreamSsePost(
  url: string,
  body: unknown,
  options: SafeStreamSseOptions,
): Promise<SafeStreamSseResult> {
  const { signal, onChunk, onParseWarning } = options;
  let accumulated = "";
  let skippedLines = 0;
  let streamError: string | null = null;

  if (signal?.aborted) {
    return { text: "", aborted: true, error: "Request cancelled", skippedLines: 0 };
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network request failed";
    return {
      text: accumulated,
      aborted: signal?.aborted ?? false,
      error: message,
      skippedLines,
    };
  }

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    return {
      text: accumulated,
      aborted: false,
      error: errorPayload?.error ?? "Request failed",
      skippedLines,
    };
  }

  if (!response.body) {
    return {
      text: accumulated,
      aborted: false,
      error: "No response stream received from the server",
      skippedLines,
    };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const processLine = (line: string) => {
    const parsed = parseSseDataLine(line);
    if (parsed === null) {
      if (line.startsWith("data: ")) {
        skippedLines += 1;
        onParseWarning?.("Skipped malformed stream chunk");
      }
      return;
    }

    if (parsed.error) {
      streamError = parsed.error;
      return;
    }

    if (parsed.text) {
      accumulated += parsed.text;
      onChunk(parsed.text);
    }
  };

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel().catch(() => undefined);
        return {
          text: accumulated,
          aborted: true,
          error: streamError ?? "Request cancelled",
          skippedLines,
        };
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        processLine(line);
      }
    }

    if (buffer.trim()) {
      processLine(buffer);
    }
  } catch (error) {
    if (signal?.aborted) {
      return {
        text: accumulated,
        aborted: true,
        error: streamError ?? "Request cancelled",
        skippedLines,
      };
    }

    const message =
      error instanceof Error ? error.message : "Stream read failed";
    return {
      text: accumulated,
      aborted: false,
      error: streamError ?? message,
      skippedLines,
    };
  }

  return {
    text: accumulated,
    aborted: false,
    error: streamError,
    skippedLines,
  };
}
