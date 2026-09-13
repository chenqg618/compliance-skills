#!/usr/bin/env node
/**
 * run.mjs —— 投标报价机械审查（免费）
 *
 * 免费版脚本只有一件事：把入参 POST 到免费端点，把结果打印出来。
 * **不需要付款、不需要注册、不需要 API Key。**
 *
 * 刻意不做的事：
 *   · 不读取、不打印服务端返回里的任何价格字段 —— 免费技能里不出现价格信息；
 *   · 不实现付款、不实现签名、不接触任何密钥。
 *
 * 用法：
 *   node scripts/run.mjs --sample
 *   node scripts/run.mjs --input my-input.json
 *   node scripts/run.mjs --input my-input.json --json
 */

import fs from 'node:fs';
import path from 'node:path';

const ENDPOINT =
  process.env.QUOTE_AUDIT_FREE_URL || 'https://www.tokendidi.cn/api/v1/quote-audit/free';

const TIMEOUT_MS = 60_000;

function parseArgs(argv) {
  const out = { input: '', sample: false, json: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--input' || a === '-i') out.input = argv[++i] || '';
    else if (a === '--sample') out.sample = true;
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') out.help = true;
  }
  return out;
}

const SAMPLE = {
  "text": "序号\t项目名称\t数量\t单价\t合价\n1\t土方开挖\t100\t25\t2500\n2\t混凝土浇筑\t50\t400\t19000\n3\t钢筋制安\t\t3800\t76000"
};

const USAGE = `投标报价机械审查（免费） —— 免费机械核对

  端点：${ENDPOINT}
  **完全免费**：不需要付款、不需要注册、不需要 API Key。

用法：
  node scripts/run.mjs --sample
  node scripts/run.mjs --input my-input.json

参数：
  -i, --input    入参 JSON 文件路径
      --sample   使用内置样例（验证链路是否连通）
      --json     以 JSON 输出（默认给人看）
  -h, --help     显示本帮助
`;

/** 只挑免费版真正产出的字段，避免把服务端的任何价格信息带出来 */
function freeView(body) {
  const limited = body.limited || {};
  return {
    ok: body.ok,
    tier: body.tier,
    capability: (body.capability || {}).name || '',
    checks_given: limited.checks_given || [],
    checks_withheld: limited.checks_withheld || [],
    omitted_findings: limited.omitted_findings,
    note: limited.note,
    free_remaining_today: body.free_remaining_today,
    result: body.result,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { console.log(USAGE); return 0; }

  let payload = null;
  if (args.input) {
    payload = JSON.parse(fs.readFileSync(args.input, 'utf8'));
  } else if (args.sample) {
    payload = SAMPLE;
  } else {
    console.error('缺少入参。用 --input 指定 JSON 文件，或用 --sample 自检。');
    console.error('');
    console.error(USAGE);
    return 1;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  let body;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const text = await res.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = { ok: false, raw: text };
    }
  } catch (e) {
    console.error(`请求失败：${e.message}`);
    console.error(`端点：${ENDPOINT}`);
    console.error('网络或超时问题可重试一次；若仍失败，说明服务端不可达，不要伪造结果。');
    return 2;
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 429) {
    console.log('今日免费额度已用完。');
    console.log(body && body.message ? body.message : '请明天再试。');
    return 3;
  }

  if (!res.ok || !body || body.ok === false) {
    console.log(`HTTP 状态 : ${res.status}`);
    if (body && body.message) console.log(body.message);
    if (body && body.error) console.log(`错误码    : ${body.error}`);
    return 4;
  }

  const view = freeView(body);
  if (args.json) {
    console.log(JSON.stringify(view, null, 2));
    return 0;
  }

  console.log('免费机械核对完成');
  console.log(`本次执行的检查项：${view.checks_given.join('、') || '(无)'}`);
  if (view.checks_withheld.length) {
    console.log(`本版本不包含：${view.checks_withheld.join('、')}`);
  }
  if (typeof view.free_remaining_today === 'number') {
    console.log(`今日剩余免费次数：${view.free_remaining_today}`);
  }
  console.log('');
  console.log(JSON.stringify(view.result, null, 2));
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(`未预期的错误：${e.message}`);
    process.exit(9);
  });
