import { test } from 'node:test';
import assert from 'node:assert';
import { filterBounties, summarize } from './lib.js';
const feed = [
  { title:'Fix typo', reward_amount:'50', source:'github', verdict:'RELIABLE' },
  { title:'ZK verifier', reward_amount:'640', source:'github', verdict:'UNVERIFIED', tags:['zk'] },
  { title:'Bait points', reward_amount:'0', source:'algora', verdict:'REJECT' },
];
test('minReward filter', () => {
  assert.strictEqual(filterBounties(feed, { minReward: 100 }).length, 1);
});
test('verifiedOnly filter', () => {
  assert.strictEqual(filterBounties(feed, { verifiedOnly: true }).length, 1);
});
test('query + source', () => {
  assert.strictEqual(filterBounties(feed, { query: 'zk' }).length, 1);
  assert.strictEqual(filterBounties(feed, { source: 'algora' }).length, 1);
});
test('summarize', () => {
  const s = summarize(feed);
  assert.strictEqual(s.total, 3);
  assert.strictEqual(s.with_reward, 2);
  assert.strictEqual(s.total_reward_usd, 690);
});
