# @glider/bounty-mcp

An **MCP server** that exposes a searchable feed of crypto-paying software bounties to any AI agent. Runs over stdio, zero dependencies.

## Use
```bash
BOUNTY_FEED=/path/to/bounties.json npx @glider/bounty-mcp
```
Or in an MCP client config:
```json
{ "mcpServers": { "bounty": { "command": "node", "args": ["/path/to/proj4-bounty-mcp/server.js"] } } }
```

## Tools
- `search_bounties` — args: `query`, `minReward`, `source`, `verifiedOnly`, `limit`
- `bounty_stats` — totals, reward sum, per-source counts

## Feed format
```json
{ "bounties": [ { "title": "...", "reward_amount": "50", "source": "github", "verdict": "RELIABLE", "url": "..." } ] }
```

## Tests
`node --test` — 4 tests covering filtering, verification, query, and stats.

MIT.
