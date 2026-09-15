---
slug: import-duty-check-free
displayName: 进口税费核算核对（免费）
version: 1.1.0
summary: 进口税费计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册。
tags: [进口税费核算核对,进口税费计算表,核算核对,对账,免费]
license: Proprietary
name: import-duty-check-free
display_name: 进口税费核算核对（免费）
display_name_en: Import Duty & Tax Check (Free)
description: 进口税费计算表逐项核对（逐行算术复算、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 进口税费核对、关税算错、增值税不对、完税价格。
description_zh: 进口税费计算表逐项核对（逐行算术复算、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 进口税费核对、关税算错、增值税不对、完税价格。
description_en: A free deterministic check for import duty & tax check worksheets. Every finding cites the source line. No payment, no registration, no API key, no network.
category: business-ops
author: WorkBuddy 开放平台开发者
allowed-tools: Read, Bash
---

# 进口税费核算核对（免费）

> **完全本地运行**：引擎已经打包在本技能里（`engine/` 目录）。
> 不联网、不需要 API Key、**没有调用次数上限**。

## 什么时候用

**谁会在什么时候用**：进口商 / 货代的关务与财务在**每票货付款前**必须核一遍税费 ——
关税、消费税、增值税三步**串行依赖**，第一步错一点后面全错，而且都是真金白银。

**这张表会逐项核对什么**：
· 关税 = 完税价格 × 关税率
· 消费税（从价）= (完税价格 + 关税) ÷ (1 − 消费税率) × 消费税率
· 增值税 = (完税价格 + 关税 + 消费税) × 增值税率
· 税费合计 = 三项之和；合计行逐列复核；重复商品行与空缺检测

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
