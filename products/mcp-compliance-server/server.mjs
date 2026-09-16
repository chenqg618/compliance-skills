#!/usr/bin/env node
/**
 * server.mjs —— 机械核对型 MCP server（stdio 传输）
 *
 * 这是什么：
 *   一个**完全离线**的 MCP（Model Context Protocol）server，把 13 个确定性文档核对能力
 *   暴露成 MCP 工具，让任何支持 MCP 的 Agent（Claude Desktop / Cursor / 各类 Harness 等）
 *   可以直接调用：报价算术、串通线索、合同一致性、票据一致性、外贸单证、三单匹配、
 *   报销合规、多家比价、银行对账、多份合同比对……
 *
 * 为什么做成"离线 + 确定性"：
 *   这些东西**能被算出来证明是错**（`1,000.00` 与 `1000.00`、金额大小写、模板占位符、
 *   跨单据字段）。交给模型"判读"既不可复算、又可能编造；做成确定性引擎，
 *   同一份输入谁来跑结论都一样，每条结论都带原文出处，**Agent 与人都能复核**。
 *
 * 两种模式：
 *   · **默认（离线）**：13 个免费工具，**不发任何网络请求**，材料不出本机；
 *   · **可选（付费）**：设置 `COMPLIANCE_MCP_ENABLE_API=1` 后，会多出一个 `run_full_check` 工具 ——
 *     它用**你已经购买过的调用凭证**（`sk_` 开头）去调完整版，把买来的次数用掉。
 *     这是唯一会联网的功能，**必须显式打开**，默认关着。
 *
 * 刻意不做的事（和仓库其它产品同一条纪律）：
 *   · 离线模式下**不发任何网络请求**；
 *   · **不编造**：材料不足时明确说缺什么，**绝不输出"未发现问题"**；
 *   · **不隐藏范围**：每个工具的结果里都如实列出"本次没有执行的检查项"。
 *
 * 用法（stdio）：
 *   node server.mjs
 * 配到 MCP 客户端里通常是这样：
 *   { "mcpServers": { "compliance": { "command": "node", "args": ["/绝对路径/server.mjs"] } } }
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const SERVER_NAME = 'compliance-mcp';
const SERVER_VERSION = '1.0.0';
/* 2024-11-05 是各客户端兼容性最好的协议版本；客户端若回传自己的版本，我们按它的来。 */
const DEFAULT_PROTOCOL = '2024-11-05';

const SCRIPTS = path.join(HERE, 'scripts');   // manifest 与 engines 都在 scripts/ 下
const manifest = JSON.parse(fs.readFileSync(path.join(SCRIPTS, 'manifest.json'), 'utf8'));

/* 第 263 轮加：`--list` —— **不开 MCP 客户端也能查这套 server 到底有哪些工具**。
   为什么要有：对外文案里写"154 个工具"，而人（或 Agent）想核实时不该被迫起一个 stdio 会话。
   纯读 manifest，不加载任何引擎，不联网。 */
if (process.argv.includes('--list')) {
  console.log(`${SERVER_NAME} v${SERVER_VERSION} —— ${manifest.length} 个工具（完全离线、确定性、每条结论带原文出处）`);
  for (const m of manifest) {
    console.log(`  ${m.tool.padEnd(46)} ${m.title}`);
    console.log(`  ${' '.repeat(46)} 会跑 ${m.given.length} 项 / 不跑 ${m.withheld.length} 项${m.hasSample ? ' / 带样例' : ''}`);
  }
  process.exit(0);
}

const ENGINES = new Map();
for (const m of manifest) {
  ENGINES.set(m.tool, require(path.join(SCRIPTS, 'engines', m.engine)));
}

/* ---------------------------------------------------------------- 工具定义 */

function toolDescription(m) {
  return [
    `${m.title}`,
    '',
    '本次会执行的检查：' + m.given.join('、') + '。',
    m.withheld.length ? '**不会执行**的检查（材料够也不会跑）：' + m.withheld.join('、') + '。' : '',
    '',
    '完全离线、确定性：同一份输入结论永远一样，每条结论都带原文出处，可被复核。',
    '材料不足时会明确告诉你缺什么，**不会输出"未发现问题"**。',
  ].filter(Boolean).join('\n');
}

const API_ENABLED = process.env.COMPLIANCE_MCP_ENABLE_API === '1';
const API_BASE = (process.env.COMPLIANCE_API_BASE || 'https://www.tokendidi.cn').replace(/\/$/, '');
/* 超时是必须的：对端挂着不回时，**没有超时的 fetch 会把整个 MCP server 拖住**，
   Agent 那边只会看到"工具一直不返回"。默认 30 秒，可用环境变量改。 */
const API_TIMEOUT_MS = Number(process.env.COMPLIANCE_MCP_API_TIMEOUT_MS) || 30000;

/* 付费工具：把"已购额度"这条路接到 MCP 上。
 * 免费工具离线跑；这一个用买家自己的凭证去调完整版并核销一次。
 * **只有显式设置 COMPLIANCE_MCP_ENABLE_API=1 才会出现** —— 默认不联网、也不暴露它。 */
const API_TOOL = {
  name: 'run_full_check',
  description: [
    '用**已购买的调用凭证**跑一次完整版核对（会消耗一次已购额度）。',
    '',
    '这是本 server 里**唯一会联网**的工具，需要设置 COMPLIANCE_MCP_ENABLE_API=1 才会出现。',
    '免费工具（其它 13 个）完全离线、不消耗任何额度。',
    '',
    '凭证在付款后由平台发放，形如 sk_…。没有凭证时请改用对应的免费工具，或先到平台购买。',
    '额度只会在核对**成功**后扣减；材料不足等失败情况**不会扣你的次数**。',
  ].join('\n'),
  inputSchema: {
    type: 'object',
    properties: {
      capability: { type: 'string', description: '能力 id，例如 invoice-consistency / three-way-match / bank-reconciliation。' },
      text: { type: 'string', description: '要核对的正文（与对应免费工具同样的传法）。' },
      api_token: { type: 'string', description: '已购调用凭证，形如 sk_…。' },
    },
    required: ['capability', 'text', 'api_token'],
    additionalProperties: false,
  },
};

const TOOLS = manifest.map((m) => ({
  name: m.tool,
  description: toolDescription(m),
  inputSchema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: '要核对的正文（原样粘贴）。需要多份材料的能力，用单独一行分节标题或空行分隔，'
          + '例如「合同一」「合同二」。',
      },
    },
    required: ['text'],
    additionalProperties: false,
  },
}));
if (API_ENABLED) TOOLS.push(API_TOOL);

/* ---------------------------------------------------------------- 结果渲染 */

function renderOutcome(m, outcome) {
  if (!outcome || outcome.status !== 'success') {
    const missing = (outcome && outcome.missing) || ['入参无法解析成可核对的材料'];
    return [
      '⚠️ 材料不足，本次没有执行任何检查，因此不出结论：',
      ...missing.map((x) => '  - ' + x),
      '',
      '怎么补：' + ((outcome && outcome.advice) || '请提供更完整的材料后再调用。'),
      '',
      '（材料不足时既不做"一致"的认定，也不做"不一致"的认定，更不会给出"没有问题"的结论。）',
    ].join('\n');
  }
  const r = outcome.result || {};
  const s = r.summary || {};
  const lines = [
    `## ${m.title} — 检查完成`,
    `问题数 ${s.total != null ? s.total : '?'}　P0 ${s.p0 ?? 0}　P1 ${s.p1 ?? 0}　P2 ${s.p2 ?? 0}`,
    s.verdict ? `结论：${s.verdict}` : '',
    '',
  ];
  const findings = Array.isArray(r.findings) ? r.findings : [];
  if (!findings.length) {
    lines.push('本次未发现问题 —— **这是指上面列出的检查项范围内**，不代表没有问题。');
  } else {
    for (const f of findings.slice(0, 40)) {
      lines.push(`[${f.level || '-'}] ${f.category || '问题'}${f.line ? `（第 ${f.line} 行）` : ''}`);
      lines.push('  ' + String(f.message || '').replace(/\n/g, '\n  '));
      if (f.advice) lines.push('  建议：' + f.advice);
      lines.push('');
    }
    if (findings.length > 40) lines.push(`（仅显示前 40 条，共 ${findings.length} 条）`);
  }
  lines.push('---');
  lines.push('本次执行的检查：' + m.given.join('、'));
  if (m.withheld.length) {
    lines.push('**本次没有执行**（材料够也不会跑）：' + m.withheld.join('、')
      + ' —— 所以「没报问题」不等于「没有问题」。');
  }
  if (m.outOfScope.length) lines.push('不在范围内：' + m.outOfScope.join('；'));
  return lines.filter((x) => x !== '').join('\n');
}

/**
 * 调用平台的完整版端点。**异步**，所以这里返回 Promise，由主循环 await 后再回。
 * 额度的扣减与退还全部由服务端负责（预检不过、业务失败都不会扣）。
 */
async function callFullCheck(id, args) {
  const cap = typeof args.capability === 'string' ? args.capability.trim() : '';
  const text = typeof args.text === 'string' ? args.text : '';
  const token = typeof args.token === 'string' ? args.token : (typeof args.api_token === 'string' ? args.api_token : '');
  if (!cap || !text.trim() || !token.trim()) {
    return { jsonrpc: '2.0', id, result: { content: [{ type: 'text',
      text: '⚠️ 缺少参数：capability、text、api_token 三者都要给。' }], isError: false } };
  }
  let res;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), API_TIMEOUT_MS);
  try {
    res = await fetch(API_BASE + '/api/v1/try', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'X-API-Token': token },
      body: JSON.stringify({ capability: cap, text }),
      signal: ac.signal,
    });
  } catch (e) {
    const why = (e && e.name === 'AbortError') ? `超过 ${API_TIMEOUT_MS}ms 未响应` : `网络不可达：${e && e.message ? e.message : e}`;
    return { jsonrpc: '2.0', id, result: { content: [{ type: 'text',
      text: `⚠️ 调用失败（${why}）。没有产生任何扣费。` }], isError: true } };
  } finally {
    clearTimeout(timer);
  }
  let body;
  try { body = await res.json(); } catch { body = null; }
  if (!body) {
    return { jsonrpc: '2.0', id, result: { content: [{ type: 'text',
      text: `⚠️ 服务端返回 HTTP ${res.status} 且不是合法 JSON。没有产生任何扣费。` }], isError: true } };
  }
  if (body.ok === false) {
    return { jsonrpc: '2.0', id, result: { content: [{ type: 'text',
      text: `⚠️ 没有执行检查：${body.message || '请求被拒绝'}${body.advice ? '\n怎么补：' + body.advice : ''}\n（失败不扣额度。）` }],
      isError: false } };
  }
  const isCredit = body.tier === 'credit' || body.tier === 'full';
  const tier = isCredit ? '完整版 · 已用一次已购额度' : '免费档 · 未消耗额度';
  const r = body.result || {};
  const found = (r.findings || []).slice(0, 40).map((f) => `[${f.level || '-'}] ${f.category || ''} ${f.message || ''}`.trim()).join('\n');
  const remain = body.quota && typeof body.quota.remaining === 'number' ? `\n剩余次数：${body.quota.remaining}` : '';
  return { jsonrpc: '2.0', id, result: { content: [{ type: 'text',
    text: `## ${isCredit ? '完整版核对完成' : '免费档核对完成（这个凭证没有可用次数，本次没有扣任何额度）'}（${tier}）${remain}\n\n`
      + `${found || '本次未发现问题（仅限该能力的检查范围内）。'}` }],
    isError: false } };
}

/* ---------------------------------------------------------------- 协议处理 */

function handle(msg) {
  const { id, method, params } = msg || {};

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0', id,
      result: {
        protocolVersion: (params && params.protocolVersion) || DEFAULT_PROTOCOL,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
        instructions: '机械核对型工具集：确定性、完全离线、结论可复算。'
          + '每个工具都会如实列出"本次没有执行的检查项"，请一并转述给用户。',
      },
    };
  }

  if (method === 'tools/list') {
    return { jsonrpc: '2.0', id, result: { tools: TOOLS } };
  }

  if (method === 'tools/call') {
    const name = params && params.name;
    if (name === API_TOOL.name) {
      if (!API_ENABLED) {
        return { jsonrpc: '2.0', id, error: { code: -32602, message: '该工具未启用（需设置 COMPLIANCE_MCP_ENABLE_API=1）' } };
      }
      return callFullCheck(id, (params && params.arguments) || {});
    }
    const m = manifest.find((x) => x.tool === name);
    if (!m) {
      return { jsonrpc: '2.0', id, error: { code: -32602, message: `未知工具：${name}` } };
    }
    const args = (params && params.arguments) || {};
    const text = typeof args.text === 'string' ? args.text : '';
    if (!text.trim()) {
      return {
        jsonrpc: '2.0', id,
        result: {
          content: [{ type: 'text', text: '⚠️ 缺少 text 参数：请把要核对的正文原样传进来。' }],
          isError: false,
        },
      };
    }
    let outcome;
    try {
      outcome = ENGINES.get(name).run({ text });
    } catch (e) {
      return {
        jsonrpc: '2.0', id,
        result: { content: [{ type: 'text', text: `⚠️ 引擎执行出错：${e && e.message ? e.message : e}` }], isError: true },
      };
    }
    return {
      jsonrpc: '2.0', id,
      result: { content: [{ type: 'text', text: renderOutcome(m, outcome) }], isError: false },
    };
  }

  if (method === 'ping') return { jsonrpc: '2.0', id, result: {} };

  /* 通知（无 id）不需要回复；未知方法按协议回 -32601。 */
  if (id === undefined || id === null) return null;
  return { jsonrpc: '2.0', id, error: { code: -32601, message: `不支持的方法：${method}` } };
}

/* ---------------------------------------------------------------- stdio 主循环 */

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

let buf = '';
/**
 * 未完成的异步请求数。
 * 第 153 轮实测踩到：`run_full_check` 要联网，是**异步**的 ——
 * 而 stdin 一结束进程就退出，**异步响应根本来不及发出去**（客户端以为服务器没回）。
 * 所以退出前必须等这些请求收尾。
 */
let pending = 0;
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buf += chunk;
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'JSON 解析失败' } });
      continue;
    }
    const reply = handle(msg);
    if (reply && typeof reply.then === 'function') {
      pending++;
      reply.then((r) => { if (r) send(r); }).catch(() => {}).finally(() => { pending--; maybeExit(); });
    } else if (reply) {
      send(reply);
    }
  }
});
/**
 * stdin 结束后退出 —— 但**必须等 stdout 排空**。
 *
 * 第 151 轮实测踩到：直接 `process.exit(0)` 会**截断尚未 flush 的输出**。
 * 单跑一个小请求看不出问题；一旦一次性收到很多请求、响应体又大
 * （例如测试里 13 个工具连发），**最后几条响应会凭空消失** —— 客户端只会以为"服务器没回"。
 * 这类"静默丢响应"最难查，所以这里显式等 drain。
 */
let stdinEnded = false;
/** 只有在"输入结束 + 没有未完成的异步请求 + stdout 排空"三件事都满足时才退出。 */
function maybeExit() {
  if (!stdinEnded || pending > 0) return;
  const done = () => process.exit(0);
  if (process.stdout.writableLength === 0) setTimeout(done, 0);
  else process.stdout.once('drain', () => setTimeout(done, 0));
}
process.stdin.on('end', () => { stdinEnded = true; maybeExit(); });
