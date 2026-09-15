---
slug: installment-rate-check-free
displayName: 分期实际年化核对（免费）
version: 1.0.0
summary: 分期方案核对表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册。
tags: [分期实际年化核对,分期方案核对表,核算核对,财务,免费]
license: Proprietary
name: installment-rate-check-free
display_name: 分期实际年化核对（免费）
display_name_en: Installment Rate Check (Free)
description: 分期方案核对表逐项核对（逐行复算、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 分期实际年化、IRR、月费率陷阱、分期成本。
description_zh: 分期方案核对表逐项核对（逐行复算、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 分期实际年化、IRR、月费率陷阱、分期成本。
description_en: A free deterministic check for installment rate check worksheets. Every finding cites the source line. No payment, no registration, no API key, no network.
category: business-ops
author: WorkBuddy 开放平台开发者
allowed-tools: Read, Bash
---

# 分期实际年化核对（免费）

> **完全本地运行**：引擎已经打包在本技能里（`engine/` 目录）。
> 不联网、不需要 API Key、**没有调用次数上限**。

## 什么时候用

**谁会在什么时候用**：做分期促销、或采购设备做分期时 —— **"月费率 0.6%"听起来很便宜，实际年化接近 14%**：
手续费按**初始本金**收，但本金是**逐月在还**的，真实占用资金只有一半左右。
只看名义费率，很容易把年化 14% 的资金当成 7.2% 用。

**这张表会逐项核对什么**：
· 名义口径：总手续费 = 本金 × 月费率 × 期数；每期还款 = (本金 + 总手续费) ÷ 期数；名义年化 = 月费率 × 12
· **实际口径（IRR）**：求月利率 r 使 −本金 + Σ 每期还款÷(1+r)^i = 0，再换算 (1+r)^12 − 1
  （二分法固定迭代 200 次：同输入结果唯一、第三方可用同口径复算）
· 合计行逐列复核（比率列不参与求和）；重复与空缺检测

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
