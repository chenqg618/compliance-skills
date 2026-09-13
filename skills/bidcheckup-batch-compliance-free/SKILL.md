---
slug: bidcheckup-batch-compliance-free
displayName: 多标书批量合规体检（免费）
version: 1.0.0
summary: 一次把多家投标文件的报价算术全部核一遍，不需要付款，也不需要注册。 免费、无需注册、无需 API Key。
tags: [招投标, 免费, 逐家报价算术校验, 标书检查, 投标自查]
license: Proprietary
name: bidcheckup-batch-compliance-free
display_name: 多标书批量合规体检（免费）
display_name_en: BidCheckup Batch Compliance (Free)
description: 一次把多家投标文件的报价算术全部核一遍，不需要付款，也不需要注册。 本免费版执行 逐家报价算术校验。触发词包括 多标书批量合规体检、逐家报价算术校验。
description_zh: 一次把多家投标文件的报价算术全部核一遍，不需要付款，也不需要注册。 本免费版执行 逐家报价算术校验。
description_en: A free mechanical pre-check for bidding documents. No payment, no registration, no API key.
category: office
author: WorkBuddy 开放平台开发者
allowed-tools: Read, Bash
---

# 多标书批量合规体检（免费）

> 一句话：一次把多家投标文件的报价算术全部核一遍，不需要付款，也不需要注册。

**完全免费**：不需要付款、不需要注册、不需要配置任何 API Key，直接调用即可。

## 什么时候用

- 一个项目有好几家投标人，想一次性把各家的报价算术都过一遍
- 评标前想先排除「报价算错」这类最容易被质疑的低级问题
- 想知道哪几家的报价明细里有对不上的行

## 这个免费版查什么

| # | 检查项 |
|---|---|
| 1 | 逐家报价算术校验 |

- 逐家报价算术：每家的每一行都核对「合价 = 数量 × 单价」，按投标人分别归集
- 输出逐家 verdict 与问题清单，一眼看出哪几家需要盯

## 这个免费版不包含

以下检查项**不在本版本范围内**，调用时也不会执行：

- 否决条款响应核对
- 模板占位符扫描
- 基本要件扫描
- 跨家串通线索
- 报价离散度分析
- 按风险排序的整改清单

## 怎么调用

### 方式一：命令行脚本（最省事）

```bash
node scripts/run.mjs --sample
node scripts/run.mjs --input my-input.json
```

### 方式二：直接 POST

```bash
curl -s -X POST https://www.tokendidi.cn/api/v1/batch-bid-checkup/free \
  -H 'Content-Type: application/json' \
  -d '{"bidders": [{"name": "河南甲建设有限公司", "price": 1000000, "items": [{"name": "钢筋制安", "qty": 10, "price": 100, "amount": 900}]}, {"name": "河南乙工程有限公司", "price": 1050000, "items": [{"name": "钢筋制安", "qty": 10, "price": 100, "amount": 1000}]}]}'
```

## 入参

给一个 bidders 数组（1 至 50 家），每家可带结构化报价明细 items。

```json
{
  "bidders": [
    {
      "name": "河南甲建设有限公司",
      "price": 1000000,
      "items": [
        {
          "name": "钢筋制安",
          "qty": 10,
          "price": 100,
          "amount": 900
        }
      ]
    },
    {
      "name": "河南乙工程有限公司",
      "price": 1050000,
      "items": [
        {
          "name": "钢筋制安",
          "qty": 10,
          "price": 100,
          "amount": 1000
        }
      ]
    }
  ]
}
```

## 返回

返回 `ok: true` 与 `result`，其中 `limited.checks_given` 会**原样列出本次实际执行了哪些检查项**，
`limited.checks_withheld` 列出本次没有执行的。**不会用默认值编造结论。**

## 使用限制

- 同一网络每天有调用次数上限，返回里会给 `free_remaining_today`；用完后返回 429 并附带说明。
- 输出的是**机械核对结果**，不是认定、不是评分。

## 反模式

- ❌ 把它的输出当作评标结论 —— 它只做机械核对，认定权在评标委员会。
- ❌ 拿它替代对招标文件的实质响应检查 —— 本版本不含该类检查。
- ❌ 输入残缺时怪结果不对 —— 检查项依赖你提供的字段，缺字段的检查项不会被伪造出来。

## 边界与免责

只做机械算术核对，不做资格审查、不做技术评审、不构成评标意见。

本技能的所有结论都可由第三方用同一份输入复算出来。
