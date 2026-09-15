---
slug: surtax-check-free
displayName: 增值税附加税费核对（免费）
version: 1.0.0
summary: 附加税费计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册。
tags: [增值税附加税费核对,附加税费计算表,核算核对,财务,免费]
license: Proprietary
name: surtax-check-free
display_name: 增值税附加税费核对（免费）
display_name_en: VAT Surtax Check (Free)
description: 附加税费计算表逐项核对（逐行复算、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 附加税核对、城建税、教育费附加、地方教育附加。
description_zh: 附加税费计算表逐项核对（逐行复算、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 附加税核对、城建税、教育费附加、地方教育附加。
description_en: A free deterministic check for vat surtax check worksheets. Every finding cites the source line. No payment, no registration, no API key, no network.
category: business-ops
author: WorkBuddy 开放平台开发者
allowed-tools: Read, Bash
---

# 增值税附加税费核对（免费）

> **完全本地运行**：引擎已经打包在本技能里（`engine/` 目录）。
> 不联网、不需要 API Key、**没有调用次数上限**。

## 什么时候用

**谁会在什么时候用**：**每个一般纳税人每月都要按增值税税额再算三项附加** ——
城建税（市区 7%/县镇 5%/其他 1%）、教育费附加 3%、地方教育附加 2%，合计 = 三项之和。
算式极简，但**税率档次用错、留抵月份把 0 当没填、三项漏一项**，是每月都在发生的错。

**这张表会逐项核对什么**：
· 城建税 = 增值税税额 × 城建税率；教育费附加 = 增值税税额 × 3%；地方教育附加 = 增值税税额 × 2%
· 附加合计 = 三项之和；合计行逐列复核；重复期间与空缺检测

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
