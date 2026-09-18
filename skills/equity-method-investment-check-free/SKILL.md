---
slug: equity-method-investment-check-free
displayName: 长期股权投资权益法核对（免费）
version: 1.0.0
summary: 权益法核算表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册。
tags: [长期股权投资权益法核对,权益法核算表,核对,对账,免费]
license: Proprietary
name: equity-method-investment-check-free
display_name: 长期股权投资权益法核对（免费）
display_name_en: Equity Method Investment Check (Free)
description: 权益法核算表逐项核对（逐行复算、合计勾稽、重复与空缺检测），每条结论引用原文。本免费版执行引擎声明的免费检查项。触发词包括 长期股权投资权益法核对、权益法核算表对不上。
description_zh: 权益法核算表逐项核对（逐行复算、合计勾稽、重复与空缺检测），每条结论引用原文。本免费版执行引擎声明的免费检查项。触发词包括 长期股权投资权益法核对、权益法核算表对不上。
description_en: A free deterministic check for 权益法核算表. Every finding cites the source. No payment, no registration, no API key, no network.
category: business-ops
author: WorkBuddy 开放平台开发者
allowed-tools: Read, Bash
---

# 长期股权投资权益法核对（免费）

> **完全本地运行**：引擎已经打包在本技能里（`engine/` 目录）。
> 不联网、不需要 API Key、**没有调用次数上限**。

## 什么时候用

**谁会在什么时候用**：财务、出纳等岗位在**每月结账 / 对账 / 盘点**这类固定节点上，
必须把这张表核一遍才能往下走。

**这张表会逐项核对什么**：权益法核算表的逐行算术、合计勾稽、重复与空缺检测。

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
