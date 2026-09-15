---
slug: warehouse-fee-check-free
displayName: 仓储费与超期费核对（免费）
version: 1.0.0
summary: 仓储费结算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册。
tags: [仓储费与超期费核对,仓储费结算表,核算核对,结算,免费]
license: Proprietary
name: warehouse-fee-check-free
display_name: 仓储费与超期费核对（免费）
display_name_en: Warehouse Fee Check (Free)
description: 仓储费结算表逐项核对（逐行复算、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 仓储费核对、超期费算错、仓储账单、WMS对账。
description_zh: 仓储费结算表逐项核对（逐行复算、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 仓储费核对、超期费算错、仓储账单、WMS对账。
description_en: A free deterministic check for warehouse fee check worksheets. Every finding cites the source line. No payment, no registration, no API key, no network.
category: business-ops
author: WorkBuddy 开放平台开发者
allowed-tools: Read, Bash
---

# 仓储费与超期费核对（免费）

> **完全本地运行**：引擎已经打包在本技能里（`engine/` 目录）。
> 不联网、不需要 API Key、**没有调用次数上限**。

## 什么时候用

**谁会在什么时候用**：用第三方仓（或自有仓对外收费）的企业**每月都要核仓储费账单** ——
仓储费 = 计费数量 × 单价 × 计费天数；超期费 = 计费数量 × 超期费率 × 超期天数；应结合计 = 两者之和。
天数口径（自然日/工作日）、免费仓储期有没有扣干净、超期费率分档，都能差出几千块。

**这张表会逐项核对什么**：
· 仓储费 = 计费数量 × 单价 × 计费天数
· 超期费 = 计费数量 × 超期费率 × 超期天数
· 应结合计 = 仓储费 + 超期费；合计行逐列复核；重复批次与空缺检测

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
