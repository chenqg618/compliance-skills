---
slug: lesson-hour-check-free
displayName: 课时核销核对（免费）
version: 1.1.0
summary: 课时核销表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册。
tags: [课时核销核对,课时核销表,核对,对账,免费]
license: Proprietary
name: lesson-hour-check-free
display_name: 课时核销核对（免费）
display_name_en: Lesson Hour Check (Free)
description: 课时核销表逐项核对（逐行算术、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 课时核销表核对、课时核销表对不上。
description_zh: 课时核销表逐项核对（逐行算术、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 课时核销表核对、课时核销表对不上。
description_en: A free deterministic check for 课时核销表. Every finding cites the source line. No payment, no registration, no API key, no network.
category: business-ops
author: WorkBuddy 开放平台开发者
allowed-tools: Read, Bash
---

# 课时核销核对（免费）

> **完全本地运行**：引擎已经打包在本技能里（`engine/` 目录）。
> 不联网、不需要 API Key、**没有调用次数上限**。

## 什么时候用

**谁会在什么时候用**：财务、出纳等岗位在**每月结账 / 对账 / 盘点**这类固定节点上，
必须把这张表核一遍才能往下走。

**这张表会逐项核对什么**：课时核销表的逐行算术、合计勾稽、重复与空缺检测。

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
