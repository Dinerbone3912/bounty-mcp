/** Pure logic for the bounty MCP server — testable without transport. */

export function filterBounties(items, { minReward = 0, source, query, verifiedOnly = false } = {}) {
  const q = query ? query.toLowerCase() : null;
  return items.filter(b => {
    if (verifiedOnly && b.verdict && b.verdict !== 'RELIABLE') return false;
    if (minReward && (Number(b.reward_amount) || 0) < minReward) return false;
    if (source && b.source !== source) return false;
    if (q) {
      const hay = `${b.title} ${b.repo || ''} ${(b.tags || []).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function summarize(items) {
  const withReward = items.filter(b => Number(b.reward_amount) > 0);
  const bySource = {};
  for (const b of items) bySource[b.source] = (bySource[b.source] || 0) + 1;
  return {
    total: items.length,
    with_reward: withReward.length,
    total_reward_usd: withReward.reduce((s, b) => s + Number(b.reward_amount), 0),
    by_source: bySource,
  };
}
