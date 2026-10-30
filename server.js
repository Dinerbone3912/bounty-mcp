#!/usr/bin/env node
/** Minimal stdio MCP server (JSON-RPC 2.0) exposing bounty tools. */
import { readFileSync } from 'node:fs';
import { filterBounties, summarize } from './lib.js';

const FEED = process.env.BOUNTY_FEED || new URL('./feed.json', import.meta.url);
function loadFeed() {
  try { return JSON.parse(readFileSync(FEED, 'utf8')).bounties || []; }
  catch { return []; }
}

const TOOLS = [
  { name: 'search_bounties', description: 'Search crypto-paying software bounties. Args: query, minReward, source, verifiedOnly, limit.',
    inputSchema: { type: 'object', properties: { query:{type:'string'}, minReward:{type:'number'}, source:{type:'string'}, verifiedOnly:{type:'boolean'}, limit:{type:'number'} } } },
  { name: 'bounty_stats', description: 'Summary stats of the current feed.', inputSchema: { type: 'object', properties: {} } },
];

function handle(req) {
  const { id, method, params } = req;
  const reply = (result) => ({ jsonrpc: '2.0', id, result });
  const error = (code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });
  if (method === 'initialize') return reply({ protocolVersion: '2024-11-05', capabilities:{ tools:{} }, serverInfo:{ name:'bounty-mcp', version:'1.0.0' } });
  if (method === 'tools/list') return reply({ tools: TOOLS });
  if (method === 'tools/call') {
    const { name, arguments: args = {} } = params;
    const items = loadFeed();
    if (name === 'search_bounties') {
      const res = filterBounties(items, args).slice(0, args.limit || 25);
      return reply({ content: [{ type:'text', text: JSON.stringify(res, null, 2) }] });
    }
    if (name === 'bounty_stats') return reply({ content: [{ type:'text', text: JSON.stringify(summarize(items), null, 2) }] });
    return error(-32601, 'unknown tool ' + name);
  }
  if (method && method.startsWith('notifications/')) return null;
  return error(-32601, 'method not found: ' + method);
}

let buf = '';
process.stdin.on('data', chunk => {
  buf += chunk;
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
    if (!line) continue;
    try { const r = handle(JSON.parse(line)); if (r) process.stdout.write(JSON.stringify(r) + '\n'); }
    catch (e) { process.stdout.write(JSON.stringify({ jsonrpc:'2.0', id:null, error:{ code:-32700, message:e.message } }) + '\n'); }
  }
});
