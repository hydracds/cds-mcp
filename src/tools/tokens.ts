import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, decryptField } from "../api/client.js";

export function registerTokenTools(server: McpServer): void {
  server.tool(
    "get_trending_tokens",
    "Get trending tokens on Cardano DEXes ranked by trading activity for the given timeframe.",
    {
      timeframe: z
        .string()
        .default("1 day")
        .describe(
          "Time window for trending data. Options: '15 mins', '30 mins', '1 hour', '4 hour', '12 hour', '1 day', '7 day'"
        ),
      count: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(50)
        .describe("Number of trending tokens to return (1-100, default 50)"),
    },
    async ({ timeframe, count }) => {
      try {
        const data = await apiGet("/tokens/trending", { timeframe, count });
        const trendingTokens = decryptField(data, "trendingTokens");
        const tradesCount = data.trades?.[0]?.count ?? 0;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { trendingTokens: trendingTokens ?? [], totalTrades: tradesCount },
                null,
                2
              ),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [{ type: "text" as const, text: `Error fetching trending tokens: ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "search_tokens",
    "Search for Cardano native tokens by ticker symbol or name. Returns token details including policyId, asset name, decimals, price, and verification status.",
    {
      query: z
        .string()
        .default("")
        .describe(
          "Token ticker or name to search for (e.g., 'SNEK', 'HOSKY'). Leave empty to list all tokens."
        ),
    },
    async ({ query }) => {
      try {
        const data = await apiGet("/tokens/list", { asset: query });
        const tokenList = decryptField(data, "list");

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(tokenList ?? [], null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [{ type: "text" as const, text: `Error searching tokens: ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_ada_price",
    "Get the current price of ADA (Cardano's native cryptocurrency) in USD.",
    {},
    async () => {
      try {
        const data = await apiGet("/adaprice");
        const decryptedData = decryptField(data, "data");
        const price = decryptedData?.adaPrice?.value?.price ?? null;

        return {
          content: [
            { type: "text" as const, text: JSON.stringify({ adaPriceUSD: price }, null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [{ type: "text" as const, text: `Error fetching ADA price: ${error.message}` }],
          isError: true,
        };
      }
    }
  );
}
