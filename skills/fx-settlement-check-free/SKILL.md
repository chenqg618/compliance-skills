---
slug: fx-settlement-check-free
displayName: 外币结算与汇兑损益核对（免费）
version: 1.0.0
summary: 外币结算核对表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册。
tags: [外币结算与汇兑损益核对,外币结算核对表,核算核对,财务,免费]
license: Proprietary
name: fx-settlement-check-free
display_name: 外币结算与汇兑损益核对（免费）
display_name_en: FX Settlement Check (Free)
description: 外币结算核对表逐项核对（逐行复算、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 外币结算核对、汇兑损益算错、汇率折算、外币对账。
description_zh: 外币结算核对表逐项核对（逐行复算、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 外币结算核对、汇兑损益算错、汇率折算、外币对账。
description_en: A free deterministic check for fx settlement check worksheets. Every finding cites the source line. No payment, no registration, no API key, no network.
category: business-ops
author: WorkBuddy 开放平台开发者
allowed-tools: Read, Bash
---

# 外币结算与汇兑损益核对（免费）

> **完全本地运行**：引擎已经打包在本技能里（`engine/` 目录）。
> 不联网、不需要 API Key、**没有调用次数上限**。

## 什么时候用

**谁会在什么时候用**：有外币业务的企业，**每笔收付都要按两个汇率过一遍** ——
记账本位币 = 外币金额 × 记账汇率；结算本位币 = 外币金额 × 结算汇率；汇兑损益 = 二者之差。
汇率用错、日期串了、损益方向反了，都会进损益表；月结时几十上百笔，人眼核不动。

**这张表会逐项核对什么**：
· 记账本位币 = 外币金额 × 记账汇率；结算本位币 = 外币金额 × 结算汇率
· 汇兑损益 = 结算本位币 − 记账本位币（**方向最容易写反**）
· 已收本位币应与结算本位币一致；合计行逐列复核；重复单据与空缺检测

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
