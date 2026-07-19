import "dotenv/config";

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

/**
 * Searches the web via Tavily and returns a compact list of results
 * (title, url, short content snippet) ready to feed into a chat prompt.
 */
export async function searchWeb(query, maxResults = 5) {
  if (!TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KEY is not set — web search is unavailable.");
  }
  if (!query || !query.trim()) {
    return [];
  }

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query,
      max_results: maxResults,
      include_answer: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`Web search request failed (${res.status})`);
  }

  const data = await res.json();
  return (data.results || []).map((r) => ({
    title: r.title,
    url: r.url,
    content: r.content,
  }));
}

/** Formats search results into a text block to append as chat context. */
export function formatSearchContext(results) {
  if (!results || !results.length) return "";
  return results
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.content}`)
    .join("\n\n");
}
