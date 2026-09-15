---
slug: franchise-royalty-check-free
displayName: 加盟抽成与最低保底核对（免费）
version: 1.0.0
summary: 加盟结算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册。
tags: [加盟抽成与最低保底核对,加盟结算表,核算核对,结算,免费]
license: Proprietary
name: franchise-royalty-check-free
display_name: 加盟抽成与最低保底核对（免费）
display_name_en: Franchise Royalty Check (Free)
description: 加盟结算表逐项核对（逐行复算、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 加盟抽成核对、最低保底、广告基金、连锁结算。
description_zh: 加盟结算表逐项核对（逐行复算、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 加盟抽成核对、最低保底、广告基金、连锁结算。
description_en: A free deterministic check for franchise royalty check worksheets. Every finding cites the source line. No payment, no registration, no API key, no network.
category: business-ops
author: WorkBuddy 开放平台开发者
allowed-tools: Read, Bash
---

# 加盟抽成与最低保底核对（免费）

> **完全本地运行**：引擎已经打包在本技能里（`engine/` 目录）。
> 不联网、不需要 API Key、**没有调用次数上限**。

## 什么时候用

**谁会在什么时候用**：做连锁/加盟的**每月要向每个加盟商出结算单**，规则里有一条最容易错：
抽成额 = 营业额 × 抽成率；广告基金 = 营业额 × 广告基金率；
**应缴合计 = max(抽成额, 最低保底) + 广告基金** —— 「取大」这一步写反就全错。

**这张表会逐项核对什么**：
· 抽成额 = 本月营业额 × 抽成率；广告基金 = 本月营业额 × 广告基金率
· **应缴合计 = max(抽成额, 最低保底) + 广告基金**（结论里会写明本期取的是哪一项）
· 合计行逐列复核（保底与比例列不参与求和）；重复加盟商与空缺检测

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
