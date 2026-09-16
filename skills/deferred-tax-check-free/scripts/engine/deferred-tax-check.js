'use strict';
/**
 * deferred-tax-check.js —— 递延所得税与暂时性差异核对（免费档 / 完整档共用源码）
 *
 * 自包含：只用 Node.js 标准库，不 require 本技能包以外的任何文件，
 * **不发起任何网络请求**（没有 fetch / http / https / net / dns / tls）。
 *
 * 待填：解析 + 每条检查 + SAMPLE_TEXT。
 *
 * ⚠️ 付费项用**形态 B**：先声明常量 paid（值为 Boolean(payload && (payload.full || payload.credit || payload.token))），
 *    再把付费检查包进 `if (paid) { ... }`（**不要**留「完整档才执行的检查」那类 MARKER——
 *    两个形态同时存在时 `strip_free_engine` 会走形态 A 把免费检查也整块删掉，第 236 轮踩过）。
 */

const CHECKS_GIVEN = ['TODO：免费档检查项'];
const CHECKS_WITHHELD = ['TODO：完整档追加项'];

const SAMPLE_TEXT = ['表头1\t表头2', '值1\t值2'].join('\n');

// 付费档专用检查函数放这里（免费包会被整块摘掉）
function checkPaidPlaceholder(it) { return null; }

function run(payload) {
  return { status: 'insufficient_input', missing: ['引擎骨架尚未实现'], advice: '待填' };
}

module.exports = { run, CHECKS_GIVEN, CHECKS_WITHHELD, SAMPLE_TEXT };
