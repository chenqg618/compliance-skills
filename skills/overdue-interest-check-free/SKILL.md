---
slug: overdue-interest-check-free
displayName: 逾期利息核算核对（免费）
version: 1.0.1
summary: 逾期利息计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册。
tags: [逾期利息核算核对,逾期利息计算表,利息复算,对账,免费]
license: Proprietary
name: overdue-interest-check-free
display_name: 逾期利息核算核对（免费）
display_name_en: Overdue Interest Check (Free)
description: 逾期利息计算表逐项核对（利息复算、天数勾稽、合计复核、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 逾期利息核算、利息算错、计息天数不对。
description_zh: 逾期利息计算表逐项核对（利息复算、天数勾稽、合计复核、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 逾期利息核算、利息算错、计息天数不对。
description_en: A free deterministic check for overdue-interest worksheets. Every finding cites the source line. No payment, no registration, no API key, no network.
category: business-ops
author: WorkBuddy 开放平台开发者
allowed-tools: Read, Bash
---

# 逾期利息核算核对（免费）

> **完全本地运行**：引擎已经打包在本技能里（`engine/` 目录）。
> 不联网、不需要 API Key、**没有调用次数上限**。

## 什么时候用

**谁会在什么时候用**：财务、法务、催收岗在**月结、发催款函、起诉前**必须把逾期利息算准 ——
收多了对方不认、收少了公司自己亏；而"本金 × 利率 × 天数"里每一步都能填错。

**这张表会逐项核对什么**：逾期利息计算表的**逐笔利息复算**（本金 × 年利率 ÷ 365 × 计息天数）、
**计息天数与起止日是否吻合**（同时给出算头不算尾 / 算头算尾两种口径）、合计行逐列复核、重复与空缺检测。

每条结论都带**原文行号与出处**，可被第三方用同一口径复算；
材料不足时**不给结论**，会明确列出还缺什么。

## 这个免费版查什么

（检查项由引擎的 `CHECKS_*` 导出，跑 `--sample` 会打印实际执行了哪些。）

## 怎么用

```bash
node scripts/run.mjs --sample                 # 先看样例
node scripts/run.mjs --input 你的材料.json     # 跑自己的材料
```

## 边界（请务必知道）

本工具**不做**引擎 `CHECKS_OUT_OF_SCOPE` 里列的那些判断；
材料不足时**不给结论**，也不会输出「未发现问题」。
