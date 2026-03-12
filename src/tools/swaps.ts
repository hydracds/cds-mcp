import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiPost, API_KEY } from "../api/client.js";

export function registerSwapTools(server: McpServer): void {
  server.tool(
    "swap_aggregate",
    "Get aggregated swap data for a token pair across Cardano DEXes. Returns optimal split routes and estimated output amount.",
    {
      tokenInAmount: z
        .number()
        .positive()
        .describe("Amount of input token to swap (in smallest unit)"),
      slippage: z
        .number()
        .min(0)
        .max(100)
        .describe("Slippage tolerance percentage (e.g., 0.5 for 0.5%)"),
      tokenIn: z
        .string()
        .describe(
          "Input token identifier. Use 'lovelace' for ADA, or 'policyId.assetNameHex' format for native tokens"
        ),
      tokenOut: z
        .object({
          policyId: z.string().describe("Policy ID of the output token"),
          nameHex: z.string().describe("Asset name hex of the output token"),
          decimals: z.number().int().describe("Decimal places of the output token"),
          verified: z.boolean().describe("Whether the output token is verified"),
          ticker: z.string().describe("Ticker symbol of the output token"),
        })
        .describe("Output token details"),
      blacklisted_dexes: z
        .array(z.string())
        .optional()
        .default([])
        .describe(
          "List of DEX names to exclude from routing (e.g., ['Minswap', 'SundaeSwap'])"
        ),
    },
    async ({ tokenInAmount, slippage, tokenIn, tokenOut, blacklisted_dexes }) => {
      try {
        const response = await apiPost(
          "/cds/swap/aggregate",
          { tokenInAmount, slippage, tokenIn, tokenOut, blacklisted_dexes },
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
            { type: "text" as const, text: `Error fetching swap aggregation: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "swap_build_cbor",
    "Build an unsigned transaction CBOR for an aggregated swap. Returns the transaction CBOR that needs to be signed by the user's wallet.",
    {
      tokenInAmount: z
        .number()
        .positive()
        .describe("Amount of input token to swap (in smallest unit)"),
      slippage: z
        .number()
        .min(0)
        .max(100)
        .describe("Slippage tolerance percentage (e.g., 0.5 for 0.5%)"),
      tokenIn: z
        .string()
        .describe(
          "Input token identifier. Use 'lovelace' for ADA, or 'policyId.assetNameHex' format for native tokens"
        ),
      tokenOut: z
        .object({
          policyId: z.string().describe("Policy ID of the output token"),
          nameHex: z.string().describe("Asset name hex of the output token"),
          decimals: z.number().int().describe("Decimal places of the output token"),
          verified: z.boolean().describe("Whether the output token is verified"),
          ticker: z.string().describe("Ticker symbol of the output token"),
        })
        .describe("Output token details"),
      blacklisted_dexes: z
        .array(z.string())
        .optional()
        .default([])
        .describe(
          "List of DEX names to exclude from routing (e.g., ['Minswap', 'SundaeSwap'])"
        ),
      userAddress: z
        .string()
        .describe("Cardano wallet address (bech32 format, starts with 'addr1')"),
    },
    async ({ tokenInAmount, slippage, tokenIn, tokenOut, blacklisted_dexes, userAddress }) => {
      try {
        const response = await apiPost(
          "/cds/swap/cbor/build",
          { tokenInAmount, slippage, tokenIn, tokenOut, blacklisted_dexes, userAddress },
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
            { type: "text" as const, text: `Error building swap CBOR: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );
}
