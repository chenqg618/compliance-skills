'use strict';
/**
 * payroll-check.js —— 工资表发放前核对（**免费版引擎**）
 *
 * 只实现下面 CHECKS_GIVEN 里的四类检查；收费档的检查（应发=各加项之和、
 * 个税按累计预扣税率表校验、代发总额核对、负数异常）**没有实现**，
 * 因此不可能被伪造出来 —— 它们只会如实地列为"未执行"。
 *
 * 设计原则（与本仓库其它引擎一致）：
 *   · 自包含：只用 Node.js 标准库，**不发起任何网络请求**；
 *   · 每条结论都引用行号与原文，第三方可用同一份输入复算；
 *   · 表头认不出 / 没人任何人员行时返回 insufficient_input，**绝不输出"未发现问题"**；
 *   · 只做算术核对，**不判断某人的工资该发多少，也不给税务意见**。
 */

const CHECKS_GIVEN = [
  '逐人算术：实发工资 = 应发工资 − 各项扣款之和',
  '合计行复核：合计行的每一列是否等于该列各人之和',
  '重复人员检测：同一姓名出现两行以上（重复发薪线索）',
  '空白与占位符：实发工资空缺、仍留着【填写】/ TBD 之类',
];

const CHECKS_WITHHELD = [
  '应发工资 = 各项加项之和（基本工资 + 绩效 + 补贴…）',
  '个税校验：按累计预扣税率表复核「税额 = 累计应纳税所得额 × 税率 − 速算扣除数」',
  '实发合计与声明的银行代发总额是否一致',
  '扣款为负、实发为负等异常值提示',
];

/* ---------------------------------------------------------------- 工具 */

function finding(level, category, line, message, advice, evidence) {
  return { level, category, line, message, advice, evidence };
}

function normAmount(v) {
  if (v === null || v === undefined) return null;
  let t = String(v).trim().replace(/[,，\s\u00A0]/g, '');
  t = t.replace(/[¥￥$€£]/g, '').replace(/(元|人民币)$/, '');
  if (/^\(.*\)$/.test(t)) t = '-' + t.slice(1, -1);
  if (/^[零一二三四五六七八九十]+$/.test(t)) return null;
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  return Math.round(parseFloat(t) * 100) / 100;
}

/* ------------------------------------------------- 表头识别与逐行解析 */

const COLUMN_ROLES = [
  { role: 'name', kws: ['姓名', '员工', '职工', '人员', '名字'] },
  { role: 'gross', kws: ['应发', '应发工资', '应发合计', '税前'] },
  { role: 'net', kws: ['实发', '实发工资', '实发合计', '到手', '代发金额'] },
  { role: 'social', kws: ['社保', '养老', '医疗', '失业', '社会保险'] },
  { role: 'fund', kws: ['公积金', '住房公积'] },
  { role: 'tax', kws: ['个税', '个人所得税', '所得税'] },
  { role: 'other_deduct', kws: ['其他扣款', '其它扣款', '其他扣', '扣款合计', '考勤扣'] },
  { role: 'taxable_cum', kws: ['累计应纳税所得额', '应纳税所得额'] },
];

/* 明显不是金额的列，直接跳过（不能把它们加进任何求和） */
const NON_AMOUNT_KWS = ['序号', '编号', '部门', '岗位', '职级', '职位', '入职', '日期', '备注', '说明',
  '身份证', '银行卡', '账号', '状态', '单位', '工号', '性别', '考勤天数', '出勤'];

/**
 * 认列。返回：已知角色名 / 'skip'（明确不是金额）/ 'extra'（认不出但可能是金额）。
 * 认不出的列必须**保留**，否则「应发 = 各加项之和」这类检查永远判不出来。
 */
function roleOf(cell) {
  const t = String(cell || '').replace(/\s/g, '');
  if (!t) return null;
  for (const c of COLUMN_ROLES) {
    if (c.kws.some((k) => t.includes(k))) return c.role;
  }
  if (NON_AMOUNT_KWS.some((k) => t.includes(k))) return 'skip';
  return 'extra';
}

function splitRow(line) {
  if (line.includes('\t')) return line.split('\t').map((x) => x.trim());
  if (line.includes('|')) return line.split('|').map((x) => x.trim()).filter((x, i, a) => !(i === 0 && x === '') && !(i === a.length - 1 && x === ''));
  if (line.includes(',')) return line.split(',').map((x) => x.trim());
  return line.trim().split(/\s{2,}/).map((x) => x.trim());
}

function findHeader(lines) {
  for (let i = 0; i < lines.length; i++) {
    const cells = splitRow(lines[i]);
    const roles = cells.map(roleOf);
    if (roles.includes('name') && roles.filter(Boolean).length >= 3) {
      return { index: i, cells, roles };
    }
  }
  return null;
}

const isTotal = (name) => /^(合计|总计|小计|共计|汇总)/.test(String(name || '').replace(/\s/g, ''));
const isPlaceholder = (s) => /【[^】]*】|\bTBD\b|\bXXX+\b|_{3,}/.test(String(s || ''));

function parseTable(text) {
  const lines = String(text == null ? '' : text).split(/\r?\n/);
  const header = findHeader(lines);
  if (!header) return null;
  const cols = [];
  let extraN = 0;
  header.roles.forEach((r, i) => {
    if (!r || r === 'skip') return;
    const role = r === 'extra' ? `extra${++extraN}` : r;
    if (!cols.some((c) => c.role === role)) cols.push({ role, idx: i, header: header.cells[i] });
  });
  const byRole = {};
  cols.forEach((c) => { byRole[c.role] = c.idx; });

  const people = [];
  const totals = [];
  for (let i = header.index + 1; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw || !raw.trim()) continue;
    const cells = splitRow(raw);
    if (cells.length < 2) continue;
    const name = String(cells[byRole.name] == null ? '' : cells[byRole.name]).trim();
    if (!name) continue;
    const vals = {};
    for (const c of cols) {
      if (c.role === 'name') continue;
      vals[c.role] = normAmount(cells[c.idx]);
    }
    const rec = { line: i + 1, name, raw: raw.trim(), cells, vals };
    if (isTotal(name)) totals.push(rec); else people.push(rec);
  }
  return { byRole, cols, people, totals, headerLine: header.index + 1, headerRaw: lines[header.index] };
}

/* ------------------------------------------------------------ 四项检查 */

function checkNet(rows) {
  const out = [];
  for (const r of rows) {
    const v = r.vals;
    if (v.gross == null || v.net == null) continue;
    if (!['social', 'fund', 'tax', 'other_deduct'].some((k) => v[k] != null)) continue;
    const deduct = ['social', 'fund', 'tax', 'other_deduct']
      .map((k) => v[k]).filter((x) => x != null).reduce((a, b) => a + b, 0);
    const expect = Math.round((v.gross - deduct) * 100) / 100;
    if (Math.abs(expect - v.net) > 0.01) {
      out.push(finding('P0', '实发工资算错', r.line,
        `${r.name}：应发 ${v.gross} − 各项扣款合计 ${Math.round(deduct * 100) / 100} = ${expect}，但表里写的是 ${v.net}（差 ${Math.round((v.net - expect) * 100) / 100}）。`,
        '实发工资算错会直接发错钱；请核对该行的扣款项，或确认是否还有没列出来的扣款。',
        [r.raw]));
    }
  }
  return out;
}

function checkTotals(parsed) {
  const out = [];
  for (const t of parsed.totals) {
    for (const role of Object.keys(t.vals)) {
      const declared = t.vals[role];
      if (declared == null) continue;
      const sum = Math.round(parsed.people.reduce((a, r) => a + (r.vals[role] || 0), 0) * 100) / 100;
      if (Math.abs(sum - declared) > 0.01) {
        const label = (parsed.cols.find((c) => c.role === role) || {}).header || role;
        out.push(finding('P0', '合计行算错', t.line,
          `合计行的「${label}」写的是 ${declared}，但各人之和是 ${sum}（差 ${Math.round((declared - sum) * 100) / 100}）。`,
          '合计错会让银行代发总额跟着错；请重新求和（常见原因是漏掉某一行、或某行被求和公式排除在外）。',
          [t.raw, `人数 ${parsed.people.length}`]));
      }
    }
  }
  return out;
}

function checkDuplicates(rows) {
  const out = [];
  const seen = new Map();
  rows.forEach((r) => {
    const k = r.name.replace(/\s/g, '');
    if (!seen.has(k)) seen.set(k, []);
    seen.get(k).push(r);
  });
  seen.forEach((list) => {
    if (list.length < 2) return;
    out.push(finding('P1', '同一人出现多行', list[0].line,
      `「${list[0].name}」在这张表里出现了 ${list.length} 行（第 ${list.map((x) => x.line).join('、')} 行）。`,
      '可能是同一人分两笔发（如工资+补发），也可能是重复录入。请确认后再发 —— 重复发薪追回很麻烦。',
      list.map((x) => x.raw)));
  });
  return out;
}

function checkBlanks(rows) {
  const out = [];
  for (const r of rows) {
    if (isPlaceholder(r.name) || Object.values(r.vals).some(isPlaceholder)) {
      out.push(finding('P1', '模板占位符残留', r.line, `${r.name} 这一行里还有没替换的占位符。`,
        '占位符意味着这一行还没定稿，发薪前必须填实。', [r.raw]));
      continue;
    }
    if (r.vals.net == null) {
      out.push(finding('P1', '实发工资空缺', r.line, `${r.name} 这一行没有填「实发工资」。`,
        '实发为空的行不会被代发，但也不该留在发薪表里；请补齐或删掉。', [r.raw]));
    }
  }
  return out;
}

/* -------------------------------------------------------------- 主流程 */

function analyze(parsed) {
  const findings = [
    ...checkNet(parsed.people),
    ...checkTotals(parsed),
    ...checkDuplicates(parsed.people),
    ...checkBlanks(parsed.people),
  ];
  const summary = { p0: 0, p1: 0, p2: 0 };
  const byCategory = {};
  findings.forEach((f) => {
    const k = f.level === 'P0' ? 'p0' : (f.level === 'P1' ? 'p1' : 'p2');
    summary[k]++;
    byCategory[f.category] = (byCategory[f.category] || 0) + 1;
  });
  summary.total = findings.length;
  summary.by_category = byCategory;
  summary.verdict = summary.p0 > 0
    ? '发现必须处理的硬错误（P0）'
    : (summary.p1 > 0 ? '没有 P0，但有需要人工确认的项（P1）'
      : (summary.p2 > 0 ? '只有提示性预警（P2），没有硬错误'
        : '在上述检查项范围内没有发现问题 —— 这不等于没有问题'));

  const missing = [];
  if (parsed.byRole.social == null && parsed.byRole.fund == null
      && parsed.byRole.tax == null && parsed.byRole.other_deduct == null) {
    missing.push('表里没有任何扣款列（社保/公积金/个税/其他扣款），因此「实发 = 应发 − 扣款」无法核对');
  }
  if (!parsed.totals.length) missing.push('表里没有合计行，因此合计复核未执行');

  return {
    findings, summary, missing_columns: missing,
    people: parsed.people.length,
    header_line: parsed.headerLine,
    columns: parsed.cols.map((c) => c.header || c.role),
  };
}

function insufficient(missing, advice) {
  return { status: 'insufficient_input', missing: [].concat(missing), advice };
}

function run(payload) {
  const p = payload && typeof payload === 'object' ? payload : {};
  const text = typeof p.text === 'string' ? p.text : '';
  if (!text.trim()) {
    return insufficient(['没有收到工资表内容'],
      '请把工资表**连表头一起**贴进来（从 Excel 直接复制即可，Tab 分隔最稳）。'
      + '表头里要有「姓名」和「实发」；其余列有就核、没有就如实列为"未执行"。');
  }
  const parsed = parseTable(text);
  if (!parsed) {
    return insufficient(['没能从这份材料里认出工资表的表头'],
      '本工具靠表头认列（不靠列的位置，因为各家列序不同）。请确认贴进来的内容**包含表头行**，'
      + '且表头里有「姓名」和「实发工资」这类字样。**认不出来就不会硬猜列的含义。**');
  }
  if (!parsed.people.length) {
    return insufficient(['认出了表头，但表头下面没有任何人员行'],
      '请确认数据行也一起贴进来了（每行至少要有姓名）。');
  }
  const result = analyze(parsed);
  result.scope = { given: CHECKS_GIVEN.slice(), withheld: CHECKS_WITHHELD.slice() };
  return { status: 'success', result };
}

module.exports = {
  run, analyze, parseTable, splitRow, roleOf, normAmount,
  CHECKS_GIVEN, CHECKS_WITHHELD,
  CHECKS_EXECUTED: CHECKS_GIVEN,
  CHECKS_OUT_OF_SCOPE: [
    '判断某个人的工资该发多少（那是劳动合同与公司制度的事）',
    '判断该不该享受某项个税专项附加扣除（那是税务口径的事）',
    '核对社保/公积金基数是否符合当地政策',
    '给出税务、劳动法或审计意见',
    '读取 .xlsx 文件（需要你先从 Excel 复制成文本贴进来）',
  ],
  SAMPLE_TEXT: [
    '姓名\t基本工资\t绩效\t应发工资\t社保\t公积金\t个税\t其他扣款\t实发工资',
    '张三\t8000.00\t2000.00\t10000.00\t1050.00\t1200.00\t90.00\t0.00\t7660.00',
    '李四\t9000.00\t1500.00\t10500.00\t1102.50\t1260.00\t103.50\t0.00\t8034.00',
    '王五\t7000.00\t1000.00\t8000.00\t840.00\t960.00\t0.00\t0.00\t6200.00',
    '王五\t7000.00\t1000.00\t8000.00\t840.00\t960.00\t0.00\t0.00\t6180.00',
    '合计\t31000.00\t5500.00\t36500.00\t3832.50\t4380.00\t193.50\t0.00\t28064.00',
  ].join('\n'),
};
