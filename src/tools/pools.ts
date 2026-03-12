import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, decryptField } from "../api/client.js";

export function registerPoolTools(server: McpServer): void {
  server.tool(
    "get_token_pools",
    "Get available liquidity pools for a token pair across all Cardano DEXes. Returns pool data including liquidity, DEX names, and pricing for finding the best swap routes.",
    {
      tokenInAmount: z
        .number()
        .positive()
        .describe("Amount of input token to swap"),
      tokenIn: z
        .string()
        .describe(
          "Input token identifier. Use 'lovelace' for ADA, or 'policyId.assetNameHex' format for native tokens"
        ),
      tokenOut: z
        .string()
        .describe("Output token identifier in 'policyId.assetNameHex' format"),
      blacklisted_dexes: z
        .array(z.string())
        .optional()
        .default([])
        .describe(
          "List of DEX names to exclude from results (e.g., ['Minswap', 'SundaeSwap'])"
        ),
    },
    async ({ tokenInAmount, tokenIn, tokenOut, blacklisted_dexes }) => {
      try {
        const data = await apiPost("/token/pools/extra", {
          tokenInAmount,
          tokenIn,
          tokenOut,
          blacklisted_dexes,
        });
        const pools = decryptField(data, "data");

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(pools ?? [], null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [{ type: "text" as const, text: `Error fetching pools: ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_rug_score",
    "Get the rug-pull risk score for a Cardano native token. Returns a probability score indicating scam risk. Lower scores mean safer tokens.",
    {
      assetId: z
        .string()
        .describe(
          "Token asset identifier in 'policyId.assetNameHex' format"
        ),
    },
    async ({ assetId }) => {
      try {
        const data = await apiGet("/token/rugscore", { assetId });
        const decryptedData = decryptField(data, "data");
        const rugProbability = decryptedData?.rug_probability ?? null;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  assetId,
                  rugProbability,
                  riskLevel:
                    rugProbability !== null
                      ? rugProbability > 0.7
                        ? "HIGH"
                        : rugProbability > 0.3
                          ? "MEDIUM"
                          : "LOW"
                      : "UNKNOWN",
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [{ type: "text" as const, text: `Error fetching rug score: ${error.message}` }],
          isError: true,
        };
      }
    }
  );
}
