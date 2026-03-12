# @cardexscan/mcp-server

MCP (Model Context Protocol) server for [Cardexscan](https://cardexscan.com) — a Cardano DEX scanner and aggregator. Gives AI assistants real-time access to Cardano DeFi data.

## Installation

```bash
npm install -g @cardexscan/mcp-server
```

Or run directly:

```bash
npx @cardexscan/mcp-server
```

## MCP Client Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cardexscan": {
      "command": "npx",
      "args": ["-y", "@cardexscan/mcp-server"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add cardexscan -- npx -y @cardexscan/mcp-server
```

## Available Tools (24)

### Tokens
| Tool | Description |
|------|-------------|
| `get_trending_tokens` | Get trending tokens ranked by trading activity |
| `search_tokens` | Search tokens by ticker or name |
| `get_ada_price` | Get current ADA price in USD |

### Pools
| Tool | Description |
|------|-------------|
| `get_token_pools` | Get liquidity pools for a token pair across DEXes |
| `get_rug_score` | Get rug-pull risk score for a token |

### Wallet
| Tool | Description |
|------|-------------|
| `get_wallet_tokens` | Get token details for a list of policy IDs |
| `get_pending_orders` | Get pending swap orders for a wallet |
| `get_wallet_orders` | Get all swap orders (open and completed) for a wallet |

### Swaps
| Tool | Description |
|------|-------------|
| `swap_aggregate` | Get aggregated swap routes across DEXes |
| `swap_build_cbor` | Build unsigned transaction CBOR for a swap |

### Trades
| Tool | Description |
|------|-------------|
| `get_global_trades` | Get recent trades across all DEXes |
| `get_historical_trades` | Get historical trades for a wallet |
| `get_token_trades` | Get all token trades for a timeframe |
| `submit_swap` | Log a swap transaction for analytics |

### OTC / P2P Marketplace
| Tool | Description |
|------|-------------|
| `get_otc_offers` | Get all OTC marketplace offers |
| `get_otc_offer_by_id` | Get details of a specific OTC offer |
| `create_otc_offer` | Create a new P2P trading offer |
| `fill_otc_offer` | Accept an existing OTC offer |
| `get_my_otc_offers` | Get offers created by a specific wallet |
| `cancel_otc_offer` | Cancel an existing OTC offer |

### DCA (Dollar Cost Averaging)
| Tool | Description |
|------|-------------|
| `create_dca_order` | Create automated recurring swap orders |
| `cancel_dca_order` | Cancel an active DCA order |
| `get_dca_orders` | Get DCA orders for a wallet |
| `get_all_dca_orders` | Get all active DCA orders system-wide |

## API Documentation

See the full [Cardexscan API docs](https://hydracds.github.io/api-docs/).

## License

MIT
