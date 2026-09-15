---
slug: ota-commission-check-free
displayName: OTA佣金与净结算核对（免费）
version: 1.0.0
summary: 渠道结算核对表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册。
tags: [OTA佣金与净结算核对,渠道结算核对表,OTA,酒店,结算,免费]
license: Proprietary
name: ota-commission-check-free
display_name: OTA佣金与净结算核对（免费）
display_name_en: OTA Commission Check (Free)
description: 渠道结算核对表逐项核对（佣金与净结算复算、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 OTA佣金核对、携程美团结算、房费结算、佣金算错。
description_zh: 渠道结算核对表逐项核对（佣金与净结算复算、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 OTA佣金核对、携程美团结算、房费结算、佣金算错。
description_en: A free deterministic check for hotel OTA commission and settlement statements. Every finding cites the source line. No payment, no registration, no API key, no network.
category: business-ops
author: WorkBuddy 开放平台开发者
allowed-tools: Read, Bash
---

# OTA佣金与净结算核对（免费）

> **完全本地运行**：引擎已经打包在本技能里（`engine/` 目录）。
> 不联网、不需要 API Key、**没有调用次数上限**。

## 什么时候用

**谁会在什么时候用**：做酒店/民宿的**每月都要核携程、美团、飞猪等渠道的结算单** ——
佣金 = 房费收入 × 佣金率（常分档），净结算额 = 房费收入 − 佣金 − **其他扣费**（推广费、活动补贴、赔付…）。
佣金率用错档、漏一项扣费，都是实打实的少收钱；一个月几个渠道、几十上百个订单，人眼核不动。

**这张表会逐项核对什么**：
· 佣金 = 房费收入 × 佣金率
· 净结算额 = 房费收入 − 佣金 − 其他扣费
· 合计行逐列复核；重复渠道与空缺检测

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
