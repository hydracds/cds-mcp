import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTokenTools } from "./tokens.js";
import { registerPoolTools } from "./pools.js";
import { registerWalletTools } from "./wallet.js";
import { registerOtcTools } from "./otc.js";
import { registerTradeTools } from "./trades.js";
import { registerSwapTools } from "./swaps.js";
import { registerDcaTools } from "./dca.js";

export function registerAllTools(server: McpServer): void {
  registerTokenTools(server);
  registerPoolTools(server);
  registerWalletTools(server);
  registerOtcTools(server);
  registerTradeTools(server);
  registerSwapTools(server);
  registerDcaTools(server);
}
