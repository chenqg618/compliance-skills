# compliance-mcp —— 机械核对型 MCP server（13 个工具，完全离线）

把 13 个**确定性**的文档核对能力暴露成 [MCP](https://modelcontextprotocol.io/) 工具，
任何支持 MCP 的 Agent（Claude Desktop / Cursor / 各类 Harness 等）都能直接调用：

| 工具 | 做什么 |
|---|---|
| `check_quote_arithmetic` | 投标报价单的行内算术与合价 |
| `screen_bid_collusion` | 多份标书之间的串通线索（联系方式 / 人员交叉） |
| `checkup_bid_packages` | 多份标书的批量合规体检（分家给结论） |
| `audit_tender_compliance` | 招投标全案合规审计 |
| `check_ad_copy_compliance` | 广告文案的绝对化用语与违禁表述 |
| `check_contract_consistency` | **单份合同自己跟自己打架**的地方 |
| `compare_contract_clauses` | **多份合同之间**哪一份的哪一条被改过 |
| `check_invoice_consistency` | 票据的行内算术、税额、价税合计、重复票、抬头 |
| `check_trade_documents` | 外贸单证（发票 / 装箱单 / 提单）单单一致 |
| `match_purchase_order_receipt_invoice` | 三单匹配（采购订单 / 入库单 / 发票） |
| `check_expense_claim` | 报销单与一沓发票：重复报销、要素、金额 |
| `compare_bid_quotations` | 多家报价横向比价（清标） |
| `reconcile_bank_statement` | 银行流水与企业账面的未达账项 |

## 为什么是"确定性"而不是"让模型判读"

这些东西**能被算出来证明是错**（`1,000.00` 与 `1000.00`、金额大小写、模板占位符、
跨单据字段、行内算术）。交给模型判读既不可复算、又可能编造；做成确定性引擎则：

- **可复算**：同一份输入，结论永远一样，不因模型 / 上下文而变；
- **有出处**：每条结论都引用原文与行号，Agent 与人都能复核；
- **不编造**：材料不足时明确说缺什么，**绝不输出"没有问题"**；
- **不隐藏范围**：每个工具的结果里都**如实列出"本次没有执行的检查项"** ——
  所以"没报问题"不等于"没有问题"。这一条是刻意的：**让 Agent 无法把"没查"说成"查过且干净"**。

## 安装（stdio）

```bash
git clone https://github.com/chenqg618/compliance-skills.git
cd compliance-skills/products/mcp-compliance-server
node server.mjs        # 直接跑，stdin/stdout 上讲 JSON-RPC
```

配到 MCP 客户端里：

```json
{
  "mcpServers": {
    "compliance": {
      "command": "node",
      "args": ["/绝对路径/compliance-skills/products/mcp-compliance-server/server.mjs"]
    }
  }
}
```

**没有依赖要装**：只用 Node 标准库（Node ≥ 18）。引擎文件已经打包在 `scripts/engines/` 里，
不需要联网、不需要 API Key、材料不出本机。

## 调用示例

工具入参统一是 `{ "text": "..." }` —— 把要核对的正文原样粘贴进去即可。
需要多份材料的能力（三单匹配 / 外贸单证 / 多份合同 / 多家比价 / 银行对账），
用**单独一行的分节标题**或空行分隔：

```
合同一
（第一份合同正文……）

合同二
（第二份合同正文……）
```

银行对账用两个分节标题：

```
银行
2026-05-08 -1240.00 酒店消费
2026-05-09 -260.00 餐饮

账面
2026-05-08 -1240.00 差旅住宿
2026-05-09 -261.50 餐费
```

## 可选：用已购额度跑完整版（付费）

默认是**完全离线**的 13 个免费工具。如果你**已经购买过调用次数**，可以显式打开付费工具：

```bash
COMPLIANCE_MCP_ENABLE_API=1 node server.mjs
```

打开后会多出一个 `run_full_check` 工具，入参 `{ capability, text, api_token }` ——
`api_token` 就是付款后拿到的凭证（形如 `sk_…`）。它会用掉**一次已购额度**并返回完整版结论。

- **只在你显式设置环境变量时才会出现**，也**只有它**会联网；13 个免费工具始终离线；
- **失败不扣额度**：材料不足、预检不过、业务出错都不会消耗你的次数（服务端负责退还）；
- 另有 `COMPLIANCE_API_BASE`（换端点）与 `COMPLIANCE_MCP_API_TIMEOUT_MS`（默认 30 秒超时）两个可选环境变量。

## 边界（**这个 server 不做的事**）

- 只做**机械核对**，不判断"这笔付款该不该发生""哪一份条款更有利""某个行业是否合规"；
- 不给法律、税务或审计意见；
- **不做 OCR**：需要先把扫描件/图片里的文字取出来；
- **不联网**：不会去查任何外部数据（企业信用、发票真伪都不查）；
- 材料不足时**不给结论**。

## 开发

```bash
# 重新生成 scripts/engines/ 与 scripts/manifest.json（改了引擎后必须跑）
python3 tools/build_mcp_server.py
python3 tools/build_mcp_server.py --check   # 只校验产物是否最新

# 端到端测试：真起子进程、真发 JSON-RPC、13 个工具逐个真调
node tools/mcp_server_test.mjs
```

## 许可

Proprietary。引擎源码另见 <https://github.com/chenqg618/compliance-skills>。
在线试用（不用注册）：<https://www.tokendidi.cn/check>
