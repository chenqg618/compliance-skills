---
slug: commission-check-free
displayName: 销售提成核对（免费）
version: 1.0.0
summary: 提成计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册。
tags: [销售提成核对,提成计算表,核对,对账,免费]
license: Proprietary
name: commission-check-free
display_name: 销售提成核对（免费）
display_name_en: Sales Commission Check (Free)
description: 提成计算表逐项核对（逐行算术、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 提成计算表核对、提成计算表对不上。
description_zh: 提成计算表逐项核对（逐行算术、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 提成计算表核对、提成计算表对不上。
description_en: A free deterministic check for 提成计算表. Every finding cites the source line. No payment, no registration, no API key, no network.
category: business-ops
author: WorkBuddy 开放平台开发者
allowed-tools: Read, Bash
---

# 销售提成核对（免费）

> **完全本地运行**：引擎已经打包在本技能里（`engine/` 目录）。
> 不联网、不需要 API Key、**没有调用次数上限**。

## 什么时候用

TODO：写清「**谁、在什么时候、因为什么必须做这件事**」（主人产品标准第 1 条）。
材料：提成计算表。

## 这个免费版查什么（TODO 补齐）

（检查项由引擎的 `CHECKS_*` 导出，跑 `--sample` 会打印实际执行了哪些。）

## 怎么用

```bash
node scripts/run.mjs --sample                 # 先看样例
node scripts/run.mjs --input 你的材料.json     # 跑自己的材料
```

## 边界（请务必知道）

本工具**不做**引擎 `CHECKS_OUT_OF_SCOPE` 里列的那些判断；
材料不足时**不给结论**，也不会输出「未发现问题」。
