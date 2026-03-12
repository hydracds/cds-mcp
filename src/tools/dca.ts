import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, API_KEY } from "../api/client.js";

export function registerDcaTools(server: McpServer): void {
  server.tool(
    "create_dca_order",
    "Create a Dollar Cost Averaging (DCA) order for automated recurring swaps at specified intervals. Returns an unsigned transaction CBOR to be signed by the wallet.",
    {
      walletAddress: z
        .string()
        .describe("Cardano wallet address (bech32 format, starts with 'addr1')"),
      tokenIn: z
        .string()
        .default("lovelace")
        .describe(
          "Input token identifier. Use 'lovelace' for ADA, or token object with policyId/nameHex for native tokens"
        ),
      tokenOut: z
        .union([
          z.string(),
          z.object({
            policyId: z.string().describe("Policy ID of the output token"),
            nameHex: z.string().describe("Asset name hex of the output token"),
          }),
        ])
        .describe("Output token identifier (string or object with policyId and nameHex)"),
      perOrderAmount: z
        .number()
        .positive()
        .describe("Amount of input token per individual swap order (in smallest unit)"),
      numOrders: z
        .number()
        .int()
        .positive()
        .describe("Total number of recurring swap orders to execute"),
      intervalMs: z
        .number()
        .int()
        .positive()
        .optional()
        .default(3600000)
        .describe("Interval between orders in milliseconds (default: 3600000 = 1 hour)"),
      slippageBps: z
        .number()
        .int()
        .min(0)
        .optional()
        .default(50)
        .describe("Slippage tolerance in basis points (default: 50 = 0.5%)"),
      minPrice: z
        .object({
          numerator: z.number().int(),
          denominator: z.number().int(),
        })
        .optional()
        .describe("Minimum price threshold as rational number (optional)"),
      maxPrice: z
        .object({
          numerator: z.number().int(),
          denominator: z.number().int(),
        })
        .optional()
        .describe("Maximum price threshold as rational number (optional)"),
      keeperFee: z
        .number()
        .int()
        .optional()
        .default(500000)
        .describe("Fee for the keeper bot in lovelace (default: 500000 = 0.5 ADA)"),
      tokenInDecimals: z
        .number()
        .int()
        .optional()
        .default(6)
        .describe("Decimal places of the input token (default: 6 for ADA)"),
    },
    async ({
      walletAddress,
      tokenIn,
      tokenOut,
      perOrderAmount,
      numOrders,
      intervalMs,
      slippageBps,
      minPrice,
      maxPrice,
      keeperFee,
      tokenInDecimals,
    }) => {
      try {
        const body: Record<string, any> = {
          walletAddress,
          tokenIn,
          tokenOut,
          perOrderAmount,
          numOrders,
          intervalMs,
          slippageBps,
          keeperFee,
          tokenInDecimals,
        };
        if (minPrice) body.minPrice = minPrice;
        if (maxPrice) body.maxPrice = maxPrice;

        const response = await apiPost("/dca/orders/create", body, {
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
            { type: "text" as const, text: `Error creating DCA order: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "cancel_dca_order",
    "Cancel an active DCA order. Remaining assets are returned to the owner. Returns an unsigned transaction CBOR to be signed by the wallet.",
    {
      walletAddress: z
        .string()
        .describe("Cardano wallet address (bech32 format, starts with 'addr1')"),
      orderId: z
        .string()
        .describe("DCA order ID in format '{txHash}#{outputIndex}'"),
    },
    async ({ walletAddress, orderId }) => {
      try {
        const response = await apiPost(
          "/dca/orders/cancel",
          { walletAddress, orderId },
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
            { type: "text" as const, text: `Error cancelling DCA order: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_dca_orders",
    "Get all DCA orders for a specific Cardano wallet address. Returns order details including status, amounts, and execution progress.",
    {
      walletAddress: z
        .string()
        .describe("Cardano wallet address (bech32 format, starts with 'addr1')"),
    },
    async ({ walletAddress }) => {
      try {
        const response = await apiGet(
          "/dca/orders",
          { walletAddress },
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
            { type: "text" as const, text: `Error fetching DCA orders: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_all_dca_orders",
    "Get all active DCA orders system-wide across all wallets. Returns all currently active DCA orders on the platform.",
    {},
    async () => {
      try {
        const response = await apiGet("/dca/orders/all", undefined, {
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
            { type: "text" as const, text: `Error fetching all DCA orders: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );
}
