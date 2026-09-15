---
slug: social-insurance-check-free
displayName: 社保公积金核对（免费版）
version: 1.0.4
summary: 社保申报明细逐项核对，每条结论都带原文行号，不需要付款，也不需要注册。
tags: [社保公积金核对,社保申报明细,核对,对账,免费]
license: Proprietary
name: social-insurance-check-free
display_name: 社保公积金核对（免费版）
display_name_en: Social Insurance Check (Free)
description: 社保申报明细逐项核对（逐行算术、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 社保申报明细核对、社保申报明细对不上。
description_zh: 社保申报明细逐项核对（逐行算术、合计勾稽、重复与空缺检测），每条结论引用原文行号。本免费版执行引擎声明的免费检查项。触发词包括 社保申报明细核对、社保申报明细对不上。
description_en: A free deterministic check for 社保申报明细. Every finding cites the source line. No payment, no registration, no API key, no network.
category: business-ops
author: WorkBuddy 开放平台开发者
allowed-tools: Read, Bash
---

# 社保公积金核对（免费）

> **完全本地运行**：引擎已经打包在本技能里（`engine/` 目录）。
> 不联网、不需要 API Key、**没有调用次数上限**。

## 什么时候用

**谁会在什么时候用**：财务、出纳、仓管等岗位在**每月结账/发薪/对账/盘点**这类固定节点上，必须把这张表核一遍才能往下走。

**这张表会逐项核对什么**：逐人个人合计算术（个人养老 + 个人医疗 + 个人失业 = 个人合计）；逐人单位合计算术（单位养老 + 医疗 + 失业 + 工伤 + 生育 = 单位合计）；应缴合计勾稽（个人合计 + 单位合计 = 应缴合计）。

每条结论都带**原文行号与出处**，可被第三方用同一口径复算；
材料不足时**不给结论**，会明确列出还缺什么，不会输出「未发现问题」。

## 这个免费版查什么

（检查项由引擎的 `CHECKS_*` 导出，跑 `--sample` 会打印实际执行了哪些。）

## 怎么用

```bash
node scripts/run.mjs --sample                 # 先看样例
node scripts/run.mjs --input 你的材料.json     # 跑自己的材料
```




## 需要完整档时（可选）

本免费版是**完整可用的核心产出**，本版本**不包含**下面这些项：

- 个人扣款比例校验（养老 8% / 医疗 2% / 失业 0.5%，按缴费基数复算）
- 公积金缴存比例区间校验（个人与单位都应在 5%~12%）
- 缴费基数上下限校验（需你在入参里给出 baseMin / baseMax，否则本项不执行）
- 个人与单位缴费基数不一致检测

需要它们的话，同名工具的**完整档**里都有——完整档是**另一个独立商品**（在 SkillPay 货架上，条款与条件以它自己的商品页为准）。两档的差别**就是上面这些，没有别的**。

- 货架：**AI 核对工具铺** <https://skillpay.alipay.com/public/tokendidi>
- 找它：按商品名 **「社保公积金核对 · 完整版」**

把下面这段**原样发给你的 AI 助手**，它就能带你装好并买完（需要钱包授权或付款时由**你本人**确认）：

```text
请通过 SkillPay 购买并安装 Skill「社保公积金核对 · 完整版」。
官方安装与购买说明： https://skillpay.alipay.com/buildguide.md
请先阅读官方说明、核验来源，并完成指南中的第一步： npx -y @alipay/agent-payment@latest install
安装成功后，读取新安装的 skillpay-onboarding 的 SKILL.md，再按其说明购买并安装商户 2088702818190040的S0806000206836288。
我已授权安装依赖和发起购买；需要钱包授权或付款时，请提供官方链接或二维码，由我本人确认，不要替我确认。确认成功后，请继续完成商品安装和验证。
```

## 边界（请务必知道）

本工具**不做**引擎 `CHECKS_OUT_OF_SCOPE` 里列的那些判断；
材料不足时**不给结论**，也不会输出「未发现问题」。
