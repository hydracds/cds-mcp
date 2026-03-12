import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, decryptField, API_KEY } from "../api/client.js";

export function registerTradeTools(server: McpServer): void {
  server.tool(
    "get_global_trades",
    "Get recent global trade data across all Cardano DEXes. Returns recent swaps with token names, amounts, prices, DEX names, and timestamps.",
    {
      timeframe: z
        .string()
        .default("1 day")
        .describe(
          "Time window for trades. Options: '15 mins', '30 mins', '1 hour', '4 hour', '12 hour', '1 day', '7 day'"
        ),
    },
    async ({ timeframe }) => {
      try {
        const data = await apiGet("/data", { timeframe });
        const trades = decryptField(data, "table");

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(trades ?? [], null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            { type: "text" as const, text: `Error fetching global trades: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "submit_swap",
    "Log a swap transaction submission to the Cardexscan backend for analytics and tracking.",
    {
      txHash: z
        .string()
        .describe("Transaction hash of the submitted swap"),
      status: z
        .number()
        .describe("Transaction status code (1 = success, -1 = error)"),
      error: z
        .string()
        .optional()
        .describe("Error message if the swap failed"),
      staker: z
        .string()
        .optional()
        .describe("Staking key hash of the wallet"),
      maker: z
        .string()
        .optional()
        .describe("Wallet address of the swap initiator"),
    },
    async ({ txHash, status, error, staker, maker }) => {
      try {
        const response = await apiPost("/swap/submit", {
          txHash,
          status,
          error,
          staker,
          maker,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: true, response }, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            { type: "text" as const, text: `Error submitting swap: ${err.message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_historical_trades",
    "Get all historical trades for a specific Cardano wallet address.",
    {
      address: z
        .string()
        .describe("Cardano wallet address (bech32 format, starts with 'addr1')"),
    },
    async ({ address }) => {
      try {
        const response = await apiGet(
          "/orders",
          { address },
          { "x-api-key": API_KEY }
        );

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(response, null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            { type: "text" as const, text: `Error fetching historical trades: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_token_trades",
    "Get all token trades across Cardano DEXes for a given timeframe. Returns trade data with configurable limit and sort order.",
    {
      timeframe: z
        .string()
        .default("15 mins")
        .describe(
          "Time window for trades. Options: '15 mins', '30 mins', '1 hour', '4 hour', '12 hour', '1 day', '7 day'"
        ),
      limit: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Maximum number of trades to return"),
      order: z
        .enum(["asc", "desc"])
        .optional()
        .default("desc")
        .describe("Sort order by time: 'asc' (oldest first) or 'desc' (newest first, default)"),
    },
    async ({ timeframe, limit, order }) => {
      try {
        const params: Record<string, any> = { timeframe, order };
        if (limit !== undefined) params.limit = limit;

        const response = await apiGet("/token/trades/all", params, {
          "x-api-key": API_KEY,
        });

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(response, null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            { type: "text" as const, text: `Error fetching token trades: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );
}
