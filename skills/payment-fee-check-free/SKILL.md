---
slug: payment-fee-check-free
displayName: 收款手续费核对（免费）
version: 1.0.0
summary: 收款手续费核对表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册。
tags: [收款手续费核对,收款手续费核对表,核算核对,对账,免费]
license: Proprietary
name: payment-fee-check-free
display_name: 收款手续费核对（免费）
display_name_en: Payment Fee Check (Free)
description: 收款手续费核对表逐项核对（逐行复算、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 手续费核对、收款对账、渠道费率、结算金额。
description_zh: 收款手续费核对表逐项核对（逐行复算、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 手续费核对、收款对账、渠道费率、结算金额。
description_en: A free deterministic check for payment fee check worksheets. Every finding cites the source line. No payment, no registration, no API key, no network.
category: business-ops
author: WorkBuddy 开放平台开发者
allowed-tools: Read, Bash
---

# 收款手续费核对（免费）

> **完全本地运行**：引擎已经打包在本技能里（`engine/` 目录）。
> 不联网、不需要 API Key、**没有调用次数上限**。

## 什么时候用

**谁会在什么时候用**：**只要收钱就有手续费**（微信/支付宝/银联/信用卡），财务每月对账时
要么逐笔核（几十上百行核不动），要么干脆不看（那就一直在漏）。
平台账单上的手续费与"金额 × 费率 + 固定费"经常对不上，几块钱的差额累积起来是真金白银。

**这张表会逐项核对什么**：
· 应收手续费 = 交易金额 × 费率 + 固定费
· 差异 = 账单手续费 − 应收手续费（**符号写反会把多收/少收完全颠倒**）
· 结算金额 = 交易金额 − 账单手续费；合计行逐列复核；重复渠道与空缺检测

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
