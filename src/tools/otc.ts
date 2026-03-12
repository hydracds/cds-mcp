import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, API_KEY } from "../api/client.js";
import { decrypt } from "../utils/crypto.js";

export function registerOtcTools(server: McpServer): void {
  server.tool(
    "get_otc_offers",
    "Get OTC (Over-The-Counter) marketplace offers on Cardano. Returns peer-to-peer trading offers with token details, prices, and status.",
    {
      page: z
        .number()
        .int()
        .min(1)
        .default(1)
        .describe("Page number for pagination (default 1)"),
      pageSize: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10)
        .describe("Number of offers per page (default 10, max 100)"),
      walletAddress: z
        .string()
        .optional()
        .describe("Filter by seller wallet address"),
      priceToken: z
        .string()
        .optional()
        .describe("Filter by price token"),
      status: z
        .string()
        .optional()
        .describe(
          "Filter by status: 'Active', 'Completed', 'Cancelled', 'Expired'"
        ),
    },
    async ({ page, pageSize, walletAddress, priceToken, status }) => {
      try {
        const params: Record<string, any> = {
          page: page.toString(),
          pageSize: pageSize.toString(),
        };
        if (walletAddress) params.walletAddress = walletAddress;
        if (priceToken) params.priceToken = priceToken;
        if (status) params.status = status;

        const data = await apiGet("/otc/offers", params);
        const offers = data.data ?? [];

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  offers,
                  total: data.total ?? offers.length,
                  page: data.page ?? page,
                  pageSize: data.pageSize ?? pageSize,
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
            { type: "text" as const, text: `Error fetching OTC offers: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_otc_offer_by_id",
    "Get details of a specific OTC offer by its ID.",
    {
      offerId: z
        .string()
        .describe("The unique identifier of the OTC offer"),
    },
    async ({ offerId }) => {
      try {
        const data = await apiGet(`/otc/offers/${offerId}`);
        const offer = data.offer ? decrypt(data.offer) : data;

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(offer, null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            { type: "text" as const, text: `Error fetching OTC offer: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "create_otc_offer",
    "Create a new peer-to-peer OTC trading offer on the Cardexscan marketplace. Returns an unsigned transaction CBOR and offer ID.",
    {
      walletAddress: z
        .string()
        .describe("Cardano wallet address (bech32 format, starts with 'addr1')"),
      offerAsset: z
        .object({
          policyId: z.string().describe("Policy ID of the token being offered"),
          nameHex: z.string().describe("Asset name hex of the token being offered"),
          decimals: z.number().int().describe("Decimal places of the offered token"),
          ticker: z.string().describe("Ticker symbol of the offered token"),
        })
        .describe("Details of the token being offered for sale"),
      offerAmount: z
        .number()
        .positive()
        .describe("Amount of the offered token (in smallest unit)"),
      requestAsset: z
        .union([
          z.literal("lovelace"),
          z.object({
            policyId: z.string().describe("Policy ID of the requested token"),
            nameHex: z.string().describe("Asset name hex of the requested token"),
            decimals: z.number().int().describe("Decimal places of the requested token"),
            ticker: z.string().describe("Ticker symbol of the requested token"),
          }),
        ])
        .describe("Token requested in exchange. Use 'lovelace' for ADA or a token object"),
      requestAmount: z
        .number()
        .positive()
        .describe("Amount of the requested token (in smallest unit)"),
      allowPartial: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether partial fills are allowed (default: false)"),
      minTakeAmount: z
        .number()
        .positive()
        .optional()
        .describe("Minimum amount for partial fills (required if allowPartial is true)"),
      expirationHours: z
        .number()
        .positive()
        .optional()
        .describe("Number of hours until the offer expires (optional)"),
    },
    async ({
      walletAddress,
      offerAsset,
      offerAmount,
      requestAsset,
      requestAmount,
      allowPartial,
      minTakeAmount,
      expirationHours,
    }) => {
      try {
        const body: Record<string, any> = {
          walletAddress,
          offerAsset,
          offerAmount,
          requestAsset,
          requestAmount,
          allowPartial,
        };
        if (minTakeAmount !== undefined) body.minTakeAmount = minTakeAmount;
        if (expirationHours !== undefined) body.expirationHours = expirationHours;

        const response = await apiPost("/otc/offers/create", body, {
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
            { type: "text" as const, text: `Error creating OTC offer: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "fill_otc_offer",
    "Accept and fill an existing OTC offer. Returns an unsigned transaction CBOR to be signed by the buyer's wallet.",
    {
      walletAddress: z
        .string()
        .describe("Buyer's Cardano wallet address (bech32 format, starts with 'addr1')"),
      offerId: z
        .string()
        .describe("The unique identifier of the OTC offer to fill"),
    },
    async ({ walletAddress, offerId }) => {
      try {
        const response = await apiPost(
          "/otc/offers/fill",
          { walletAddress, offerId },
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
            { type: "text" as const, text: `Error filling OTC offer: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_my_otc_offers",
    "Get all OTC offers created by a specific wallet address.",
    {
      walletAddress: z
        .string()
        .describe("Cardano wallet address (bech32 format, starts with 'addr1')"),
    },
    async ({ walletAddress }) => {
      try {
        const response = await apiGet(
          "/otc/offers/my",
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
            { type: "text" as const, text: `Error fetching my OTC offers: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "cancel_otc_offer",
    "Cancel an existing OTC offer. Returns an unsigned transaction CBOR to be signed by the seller's wallet.",
    {
      walletAddress: z
        .string()
        .describe("Seller's Cardano wallet address (bech32 format, starts with 'addr1')"),
      offerId: z
        .string()
        .describe("The unique identifier of the OTC offer to cancel"),
    },
    async ({ walletAddress, offerId }) => {
      try {
        const response = await apiPost(
          "/otc/offers/cancel",
          { walletAddress, offerId },
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
            { type: "text" as const, text: `Error cancelling OTC offer: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );
}
