#!/usr/bin/env node
/**
 * agent.mjs —— 机械核对型**本地智能体**（把一叠材料丢进来，自动分派检查、出一份整改清单）
 *
 * 与 MCP server 的区别：
 *   · MCP server 是"**单次调用**一个工具"，由外面的 Agent 决定调哪个；
 *   · 这个 agent 是"**把一个目录/一批文件交给它**"，它自己判断每份材料是什么、
 *     该跑哪些检查、然后再**合成一份跨材料的整改清单**。
 *   —— 也就是说，它做的是**分派与汇总**这件"需要判断"的事，
 *      而每一处结论仍然是**确定性引擎**算出来的，可复算。
 *
 * 诚实性的设计（与仓库同一条纪律）：
 *   · 每份材料都会**如实标注**识别出的类型与置信依据（命中了哪些关键词）；
 *   · 识别不出来就说"识别不出"，**不会硬套一个检查**；
 *   · 每个结论都带"本次执行 / 本次未执行"的检查项清单 —— **"没报问题"不等于"没有问题"**；
 *   · **不联网**，材料不出本机。
 *
 * 用法：
 *   node agent.mjs --dir ./materials
 *   node agent.mjs --file 报价.txt --file 合同A.txt --file 合同B.txt
 *   node agent.mjs --sample
 *   node agent.mjs --dir ./materials --json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
/* 引擎与 MCP server 共用同一份（同仓库、同一次发布一起出去），避免各存一份而漂移。 */
const ENGINES_DIR = path.join(HERE, '..', 'mcp-compliance-server', 'scripts', 'engines');

/* ------------------------------------------------------------------ 识别规则 */

/**
 * 每条规则 = 一组关键词 + 一个引擎。
 * `weight` 让"特征词"比"常见词"更算数（例如「信用证」远比「金额」有指向性）。
 * 评分而不是"第一个命中就赢"：一份材料常常同时含几类词，取分最高者并**把依据打印出来**。
 */
const RULES = [
  { engine: 'bank-reconciliation.js', label: '银行流水 / 企业账面',
    hints: [['银行流水', 6], ['账面', 6], ['未达账项', 6], ['开户行', 3], ['对方账户', 3], ['收支明细', 4]] },
  { engine: 'three-way-match.js', label: '采购订单 / 入库单 / 发票',
    hints: [['采购订单', 6], ['入库单', 6], ['收货单', 5], ['供应商', 3], ['物料', 3], ['采购订单号', 6]] },
  { engine: 'trade-doc-consistency.js', label: '外贸单证',
    hints: [['信用证', 7], ['提单', 6], ['装箱单', 6], ['商业发票', 5], ['装运港', 4], ['目的港', 4], ['唛头', 5]] },
  { engine: 'expense-compliance.js', label: '报销单 / 一沓发票',
    hints: [['报销单', 7], ['报销金额', 6], ['出差', 4], ['报销人', 6], ['报销日期', 5]] },
  { engine: 'invoice-consistency.js', label: '票据',
    hints: [['发票代码', 5], ['发票号码', 6], ['价税合计', 6], ['税率', 4], ['销方', 4], ['购方', 4], ['税额', 4]] },
  /* 单份合同先走「单文档一致性」；**只有出现 ≥2 份合同时**，main 里才额外跑横向比对。
     第 156 轮实测踩到：把单份合同交给「多份比对」引擎，它会按空行把一份合同切成几份，
     报出"合同1/合同2 缺条"这种**无意义结论** —— 分派错引擎比不查更糟。 */
  { engine: 'contract-consistency.js', label: '合同（单份一致性）', isContract: true,
    hints: [['甲方', 4], ['乙方', 4], ['本合同', 4], ['违约金', 4], ['第', 1]] },
  { engine: 'bid-comparison.js', label: '多家报价横向比价',
    hints: [['投标人', 4], ['报价', 3], ['## ', 2], ['土方开挖', 2], ['综合单价', 4]] },
  { engine: 'tender-compliance-audit.js', label: '招投标材料全案',
    hints: [['招标文件', 5], ['投标函', 6], ['商务标', 5], ['技术标', 5], ['评标', 4], ['招标代理', 4]] },
  { engine: 'quote-audit.js', label: '报价单',
    hints: [['序号', 3], ['合价', 5], ['单价', 4], ['数量', 3], ['工程量清单', 5]] },
  { engine: 'ad-compliance.js', label: '广告文案',
    hints: [['广告', 4], ['销量第一', 5], ['全国第一', 5], ['100%', 3], ['无效退款', 4], ['最', 1]] },
];

// ⚠️ 第 241 轮：MCP 的引擎改成**按包名分目录**存放（`engines/<包名>/<文件>`）以避免同名覆盖，
//    所以这里不能再假设引擎文件平铺在 ENGINES_DIR 下 —— 先在平铺位置找，找不到再在子目录里搜。
const fsx = require('fs');
function resolveEngine(f) {
  const flat = path.join(ENGINES_DIR, f);
  if (fsx.existsSync(flat)) return flat;
  for (const d of fsx.readdirSync(ENGINES_DIR)) {
    const cand = path.join(ENGINES_DIR, d, f);
    if (fsx.existsSync(cand)) return cand;
  }
  throw new Error('找不到引擎：' + f);
}
const loadEngine = (f) => require(resolveEngine(f));

function detect(text) {
  const scores = RULES.map((r) => {
    let score = 0; const hits = [];
    for (const [kw, w] of r.hints) {
      if (text.includes(kw)) { score += w; hits.push(kw); }
    }
    return { rule: r, score, hits };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  if (!scores.length) return { rule: null, hits: [] };
  return { rule: scores[0].rule, score: scores[0].score, hits: scores[0].hits,
    runnerUp: scores[1] ? scores[1].rule.label : null };
}

/* ------------------------------------------------------------------ 单个材料 */

function runOne(name, text) {
  const d = detect(text);
  if (!d.rule) {
    return { name, kind: '未识别', engine: null, note: '没能识别出这是什么材料，因此**没有执行任何检查**（不会硬套一个）。',
      given: [], withheld: [], findings: [], summary: null };
  }
  const eng = loadEngine(d.rule.engine);
  const outcome = eng.run({ text });
  const base = { name, kind: d.rule.label, engine: d.rule.engine,
    why: '命中的关键词：' + d.hits.join('、') + (d.runnerUp ? `（次相近的是「${d.runnerUp}」）` : ''),
    given: eng.CHECKS_GIVEN || [], withheld: eng.CHECKS_WITHHELD || [] };
  if (!outcome || outcome.status !== 'success') {
    return { ...base, findings: [], summary: null,
      note: '材料不足，本次没有执行任何检查：' + ((outcome && outcome.missing) || []).join(' ') };
  }
  const r = outcome.result || {};
  return { ...base, findings: Array.isArray(r.findings) ? r.findings : [], summary: r.summary || null };
}

/* ------------------------------------------------------------------ 汇总 */

function renderReport(items, files) {
  const L = [];
  const withFindings = items.filter((x) => x.engine && x.findings.length);
  const unrecognised = items.filter((x) => !x.engine);
  const bySeverity = { P0: 0, P1: 0, P2: 0 };
  items.forEach((x) => x.findings.forEach((f) => { if (bySeverity[f.level] != null) bySeverity[f.level]++; }));

  L.push('# 机械核对报告');
  L.push('');
  L.push(`材料 ${items.length} 份：识别并检查了 ${items.length - unrecognised.length} 份，未识别 ${unrecognised.length} 份。`);
  L.push(`合计问题 **${bySeverity.P0 + bySeverity.P1 + bySeverity.P2}** 处：`
    + `P0（硬错误）**${bySeverity.P0}**、P1（需人工确认）**${bySeverity.P1}**、P2（提示）**${bySeverity.P2}**。`);
  L.push('');
  L.push('> 本报告由**确定性引擎**算出：同一份材料谁来跑结论都一样，每条结论都附原文出处、可复算。');
  L.push('> **不判断**该不该付款、哪份文件更有利、是否违法 —— 那些是人/法务的判断。');
  L.push('> 每份材料下面都列了"**本次没有执行**"的检查项：没报问题 ≠ 没有问题。');
  L.push('');

  if (unrecognised.length) {
    L.push('## ⚠️ 未识别的材料（没有执行任何检查）');
    for (const x of unrecognised) L.push(`- \`${x.name}\` —— ${x.note}`);
    L.push('');
  }

  L.push('## 逐份结果');
  for (const x of items) {
    L.push('');
    L.push(`### ${x.name}`);
    if (!x.engine) { L.push(x.note); continue; }
    L.push(`- 识别为：**${x.kind}**（${x.why}）`);
    if (x.note) { L.push(`- ${x.note}`); continue; }
    const s = x.summary || {};
    L.push(`- 问题：${s.total != null ? s.total : '?'} 处（P0 ${s.p0 ?? 0} / P1 ${s.p1 ?? 0} / P2 ${s.p2 ?? 0}）`);
    if (!x.findings.length) {
      L.push('- 本次未发现问题 —— **仅限下面列出的检查项范围内**。');
    } else {
      for (const f of x.findings.slice(0, 30)) {
        L.push(`- **[${f.level || '-'}] ${f.category || ''}** ${String(f.message || '').replace(/\n/g, ' ')}`);
        if (f.advice) L.push(`  - 建议：${f.advice}`);
      }
      if (x.findings.length > 30) L.push(`- （仅列前 30 条，共 ${x.findings.length} 条）`);
    }
    L.push(`- 本次执行：${x.given.join('、') || '(无)'}`);
    if (x.withheld.length) L.push(`- **本次没有执行**：${x.withheld.join('、')}`);
  }

  L.push('');
  L.push('## 建议的下一步');
  if (bySeverity.P0) {
    L.push(`1. **先处理 ${bySeverity.P0} 处 P0** —— 这些是能被算出来证明是错的（算术不符、大小写不一致、期限颠倒一类），递交/付款前必须改。`);
    L.push('2. 再逐条看 P1：这些需要人确认（例如同一条款出现了不同版本，可能是被改过，也可能是有意为之）。');
  } else if (withFindings.length) {
    L.push('1. 没有 P0，但有需要人确认的 P1/P2 —— 逐条核对上面标出的位置即可。');
  } else {
    L.push('1. 本次没有发现问题 —— 但请把上面每份材料"**本次没有执行**"的检查项也看一遍，那些范围没查。');
  }
  const nextNo = bySeverity.P0 ? 3 : 2;
  L.push(`${nextNo}. 原文件共 ${files.length} 份；想逐份复算，可用同一份输入重跑本命令，结论必然相同。`);
  return L.join('\n');
}

/* ------------------------------------------------------------------ 主流程 */

const SAMPLE = {
  '报价单.txt': '序号\t项目名称\t单位\t数量\t单价\t合价\n1\t钢筋制安\tt\t145.6\t5850\t841580\n2\t模板工程\tm2\t1200\t65\t78000',
  '合同一.txt': '技术服务合同\n甲方：北京星河科技有限公司\n乙方：上海云帆信息技术有限公司\n\n第五条 合同金额\n合同总金额：人民币壹拾万元整（小写 100,000.00）。\n\n第八条 违约责任\n任何一方违约，应向对方支付合同总金额 5% 的违约金。',
  '合同二.txt': '技术服务合同\n甲方：北京星河科技有限公司\n乙方：上海云帆信息技术有限公司\n\n第五条 合同金额\n合同总金额：人民币壹拾万元整（小写 100,000.00）。\n\n第八条 违约责任\n任何一方违约，应向对方支付合同总金额 2% 的违约金。',
  '发票.txt': '增值税电子普通发票\n发票号码：12345678\n开票日期：2026-03-15\n购方名称：北京星河科技有限公司\n销方名称：上海云帆信息技术有限公司\n合计金额：13,000.00\n税率：6%\n税额：710.00\n价税合计：14,100.00',
};

function readInputs(args) {
  const files = [];
  if (args.sample) {
    for (const [name, text] of Object.entries(SAMPLE)) files.push({ name, text });
    return files;
  }
  for (const f of args.file) {
    try { files.push({ name: path.basename(f), text: fs.readFileSync(f, 'utf8') }); }
    catch (e) { files.push({ name: path.basename(f), text: '', error: `读不到：${e.code || e.message}` }); }
  }
  for (const d of args.dir) {
    let names = [];
    try { names = fs.readdirSync(d); } catch (e) { files.push({ name: d, text: '', error: `读不到目录：${e.code}` }); continue; }
    for (const n of names.sort()) {
      const p = path.join(d, n);
      let st; try { st = fs.statSync(p); } catch { continue; }
      if (!st.isFile()) continue;
      if (!/\.(txt|md|csv|json)$/i.test(n)) continue;   // 只吃纯文本；扫描件要你先转文字
      if (st.size > 2 * 1024 * 1024) { files.push({ name: n, text: '', error: '文件超过 2MB，跳过' }); continue; }
      try { files.push({ name: n, text: fs.readFileSync(p, 'utf8') }); }
      catch (e) { files.push({ name: n, text: '', error: `读不到：${e.code}` }); }
    }
  }
  return files;
}

function main() {
  const argv = process.argv.slice(2);
  const args = { file: [], dir: [], json: false, sample: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--file' || argv[i] === '-f') args.file.push(argv[++i] || '');
    else if (argv[i] === '--dir' || argv[i] === '-d') args.dir.push(argv[++i] || '');
    else if (argv[i] === '--json') args.json = true;
    else if (argv[i] === '--sample') args.sample = true;
    else if (argv[i] === '--help' || argv[i] === '-h') {
      console.log('用法：node agent.mjs --dir 材料目录 | --file a.txt --file b.txt | --sample [--json]');
      return 0;
    }
  }
  if (!args.sample && !args.file.length && !args.dir.length) {
    console.error('缺少入参：用 --dir 给一个目录，或 --file 给若干文件，或 --sample 看示例。');
    return 1;
  }
  const files = readInputs(args);
  if (!files.length) { console.error('没有可读的纯文本材料（支持 .txt/.md/.csv/.json）。'); return 1; }

  /* 一份都没读到就别假装出了报告 —— 非零退出、把原因说清楚（与技能包的退出码纪律一致）。 */
  if (files.every((f) => f.error)) {
    console.error('没有可读的材料：');
    for (const f of files) console.error(`  - ${f.name}：${f.error}`);
    return 1;
  }

  const items = files.map((f) => (f.error
    ? { name: f.name, kind: '读不到', engine: null, note: f.error, given: [], withheld: [], findings: [], summary: null }
    : runOne(f.name, f.text)));

  /* 多份合同交给横向比对引擎（单份合同用一致性引擎更合适）。 */
  const contracts = items.filter((x) => x.engine === 'contract-consistency.js');
  if (contracts.length >= 2) {
    const eng = loadEngine('contract-comparison.js');
    const contracts2 = contracts.map((x, i) => ({ name: x.name, text: files.find((f) => f.name === x.name).text }));
    const outcome = eng.run({ contracts: contracts2 });
    const agg = { name: `【自动合并】${contracts.length} 份合同的横向比对`, kind: '合同（多份横向比对）',
      engine: 'contract-comparison.js', why: '把上面识别为合同的材料放在一起比对',
      given: eng.CHECKS_GIVEN || [], withheld: eng.CHECKS_WITHHELD || [],
      findings: (outcome && outcome.result && outcome.result.findings) || [],
      summary: (outcome && outcome.result && outcome.result.summary) || null };
    items.push(agg);
  }

  if (args.json) {
    console.log(JSON.stringify({ ok: true, count: items.length, items }, null, 2));
    return 0;
  }
  console.log(renderReport(items, files));
  return 0;
}

process.exit(main());
