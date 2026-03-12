import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, decryptField, API_KEY } from "../api/client.js";

export function registerWalletTools(server: McpServer): void {
  server.tool(
    "get_wallet_tokens",
    "Get token details for a list of policy IDs. Returns token metadata including price, decimals, and verification status. Useful for portfolio valuation.",
    {
      policyIdList: z
        .array(z.string())
        .min(1)
        .describe("Array of Cardano policy IDs to look up token information for"),
      hexList: z
        .array(z.string())
        .optional()
        .default([])
        .describe(
          "Optional array of asset name hex strings corresponding to the policy IDs"
        ),
    },
    async ({ policyIdList, hexList }) => {
      try {
        const data = await apiPost("/wallet/tokens/list", {
          policyIdList,
          hexList,
        });
        const tokenTable = decryptField(data, "table");

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(tokenTable ?? [], null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            { type: "text" as const, text: `Error fetching wallet tokens: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_pending_orders",
    "Get pending (open) swap orders for a Cardano wallet address. Shows orders waiting to be filled on various DEXes.",
    {
      address: z
        .string()
        .describe("Cardano wallet address (bech32 format, starts with 'addr1')"),
    },
    async ({ address }) => {
      try {
        const data = await apiGet(
          "/pending/orders",
          { address },
          { "x-api-key": API_KEY }
        );
        const orders = data.orders ?? [];
        const openOrders = orders.filter(
          (order: any) => order.status === "OPEN"
        );

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  totalOrders: orders.length,
                  openOrders: openOrders.length,
                  orders: openOrders,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            { type: "text" as const, text: `Error fetching pending orders: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_wallet_orders",
    "Get all swap orders (open and completed) for a Cardano wallet address. Returns order history including action type, tokens, amounts, DEX, and status.",
    {
      address: z
        .string()
        .describe("Cardano wallet address (bech32 format, starts with 'addr1')"),
    },
    async ({ address }) => {
      try {
        const data = await apiGet("/wallet/orders", { address });
        const orders = decryptField(data, "orders");

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(orders ?? [], null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            { type: "text" as const, text: `Error fetching wallet orders: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );
}
