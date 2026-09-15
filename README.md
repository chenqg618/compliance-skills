# AI核对型 AI 技能（免费版源码）

[![skills.sh](https://skills.sh/b/chenqg618/compliance-skills)](https://skills.sh/chenqg618/compliance-skills)

**招投标、合同、票据、广告文案、外贸单证、三单匹配（采购订单／入库单／发票）、报销合规、银行流水对账与多份合同横向比对**场景的AI核对技能。特点：

- **完全离线**：引擎是纯 Node.js 标准库实现，**不联网、不外发材料、不调用外部模型**，
  服务器停不停都不影响使用；
- **可复算**：同一份材料无论谁来跑，结论完全一致，每条结论都带依据、可被第三方复核；
- **没有次数上限**：装到本机就一直在，不需要 API Key，也没有每日额度；
- **不编造结论**：材料不足时明确告诉你缺什么，**不会拿默认值编一个"没问题"出来**。

> **想先在线试一下？** 不用注册、不用付款、不用装任何东西：
> <https://www.tokendidi.cn/check> —— 把材料粘进去，立刻看到AI核对结果。
> （标书 / 合同 / 票据 / 广告文案 / 外贸单证 / 三单匹配 / 报销单 / 多家报价比价 / 银行流水对账 /
> 多份合同比对 / 工资表核对，都在同一个入口里选。）

## 三种用法，任选（都是同一套确定性引擎）

| 形态 | 适合 | 入口 |
|---|---|---|
| **技能包** | 已经用 Claude Code / SkillHub / ClawHub 等 | 下面的「直接下载」或 `skills/` |
| **MCP server** | 已经用 Claude Desktop / Cursor 等 MCP 客户端 | 见下一节 |
| **本地智能体** | 手里有**一叠材料**，想一次过一遍 | `node products/compliance-agent/agent.mjs --dir ./materials` |

**本地智能体**值得单独说一句：你**不用告诉它哪份文件该查什么** ——
它自己判断每份材料是什么、该跑哪些检查，两份以上合同还会**自动额外做一次横向比对**，
最后合成一份跨材料的整改清单。识别不出来它会**直说识别不出，不会硬套一个检查**。

```bash
node products/compliance-agent/agent.mjs --sample        # 先看一份示例报告
node products/compliance-agent/agent.mjs --dir ./材料目录
```

## 想把它接进别的平台？有现成的 OpenAPI 规格

`products/agentpay-openapi/openapi.json` 是 **标准 OpenAPI 3.0.3 规格**，覆盖 **14 个能力**
（Coze 的 API 插件、多数智能体平台导入的都是这个格式 —— 一次导入即可，不用照着文档手填）。

关键一点：**每个能力端点都接受纯文本 `text`**（文本进、文本出，不用拼结构化 JSON）：

```json
POST /api/v1/three-way-match
{ "text": "采购订单\n采购订单号: PO-1\n…\n\n入库单\n…\n\n发票\n…" }
```

**这是实测过的**：14 个端点逐个用官方示例调用，全部通过入参预检。
详见 [`products/agentpay-openapi/README.md`](products/agentpay-openapi/README.md)。

## 也可以当 MCP server 用（13 个工具，完全离线）

同一个仓库里有一套 **MCP（Model Context Protocol）server** —— 任何支持 MCP 的 Agent
（Claude Desktop / Cursor / 各类 Harness）都能直接调用这 13 个确定性核对工具：

```bash
git clone https://github.com/chenqg618/compliance-skills.git
node compliance-skills/products/mcp-compliance-server/server.mjs   # stdio 上讲 JSON-RPC
```

```json
{ "mcpServers": { "compliance": {
    "command": "node",
    "args": ["/绝对路径/compliance-skills/products/mcp-compliance-server/server.mjs"] } } }
```

**零依赖**（只用 Node 标准库）、**不联网**、不需要 API Key。每个工具的结果里都会
**如实列出"本次没有执行的检查项"** —— 这样 Agent 就**没法把"没查"说成"查过且干净"**。
详见 [`products/mcp-compliance-server/README.md`](products/mcp-compliance-server/README.md)。

## 直接下载（不想看源码的话）

每个免费技能包都打包好了，在 **Releases** 里下载即用：
<https://github.com/chenqg618/compliance-skills/releases/latest>
（每个 zip 顶层就是技能文件夹，解压即可用；里面只有 `SKILL.md` 与纯 Node 脚本，无依赖、无网络调用。）

## 完整版（买断，¥9.9）

免费版是**完整可用的核心产出**；需要**更深口径**时有两个付费形态：

| 形态 | 适合谁 | 在哪买/装 | 计费 |
|---|---|---|---|
| **完整档（离线引擎随包）** | 想在本机反复跑、材料敏感不能外发 | **SkillPay**：<https://skillpay.alipay.com/shelf> | **买断一次 ¥9.9**，跑多少次都不再收费（**不设免费试用**） |
| **按次档（调站点端点）** | 偶尔用一次 | **SkillHub**：<https://www.skillhub.cn/> 搜技能名 | 单次 ¥0.99 起 |

> 说明：免费版与完整版的**差别在检查项**（免费版会在输出里**如实列出哪些检查没有执行**）；
> 两者都是同一套确定性引擎，结论可复算。

## 安装

三条路，任选一条（都不用付款、不用注册、不用 API Key）：

**① 通用 agent skills（skills.sh / Claude Code / Codex / DSH / OpenClaw 等）**

```bash
npx skills add chenqg618/compliance-skills
```

**② 作为 Claude Code 插件市场**

```bash
claude plugin marketplace add chenqg618/compliance-skills
```

**③ 使用 DSH 技能市场**：本仓库带 `dsh-skill` 话题 ——
在 DeepSeek Harness 的「设置 → 技能市场」里搜索 `compliance-skills` 即可一键安装。

## 技能清单（免费版）

<!-- SKILL_LIST_START -->
（本仓库共 **38 个免费技能包**；完整档（买断）见上面的「完整版」一节。）

| 技能包 | 作用 |
|---|---|
| `adcheckup-content-compliance-free` | 发布前扫一遍文案里的绝对化用语，并且按监管的执法指南判断该不该报，不需要付款，也不需要注册 |
| `ap-reconciliation-free` | 供应商对账表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `ar-aging-check-free` | 应收对账表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `bank-reconciliation-free` | 把银行流水和企业账面记录贴成两段，逐笔配对、列出两侧未达账项和重复记录——每月对账最费时的那一步 |
| `bid-comparison-free` | 把多家投标人的报价明细逐项摆在一起对齐——谁缺项、各家合计多少、从低到高怎么排 |
| `bidcheckup-batch-compliance-free` | 一次把多家投标文件的报价算术全部核一遍，不需要付款，也不需要注册 |
| `bidguard-quote-audit-free` | 把一份投标报价单里能被算出来证明是错的问题找出来，不需要付款，也不需要注册 |
| `bonus-pool-check-free` | 年终奖分配表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `collusionscreen-collusion-screening-free` | 把多家投标文件放在一起，找出客观可复算的雷同线索，不需要付款，也不需要注册 |
| `commission-check-free` | 提成计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `contract-comparison-free` | 把同一模板下签的多份合同摆在一起逐条对齐——某一份少了哪一条、哪一条被改过、同一条有几个版本 |
| `contract-consistency-check-free` | 把合同里能被算出来、指出来证明是错的地方找出来，每条都带原文证据，不需要付款，也不需要注册 |
| `depreciation-check-free` | 固定资产台账逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `discount-interest-check-free` | 票据贴现计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `expense-compliance-free` | 把一沓发票和一张报销单放在一起核一遍——揪出重复报销的发票号、要素不齐的发票、以及没替换的占位符 |
| `export-rebate-check-free` | 出口退税（免抵退）计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `freight-reconciliation-free` | 运费月结单逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `fx-settlement-check-free` | 外币结算核对表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `iit-withholding-check-free` | 个税累计预扣计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `import-duty-check-free` | 进口税费计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `inventory-check-free` | 库存盘点表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `invoice-consistency-check-free` | 把票据里能被算出来、指出来证明是错的地方找出来，每条都带原文证据，不需要付款，也不需要注册 |
| `lease-rent-check-free` | 租金账单/租赁结算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `lesson-hour-check-free` | 课时核销表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `ota-commission-check-free` | 渠道结算核对表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `overdue-interest-check-free` | 逾期利息计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `overtime-pay-check-free` | 加班费计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `payment-fee-check-free` | 收款手续费核对表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `payroll-check-free` | 发薪前把工资表算一遍——每个人的实发是不是等于应发减扣款、合计行是不是各列之和、有没有同一个人出现两行、有没有金额空缺或没替换的占位符 |
| `platform-settlement-check-free` | 平台结算单逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `progress-payment-check-free` | 工程进度款支付计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `rd-expense-check-free` | 研发费用归集表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `social-insurance-check-free` | 社保申报明细逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `tenderaudit-full-compliance-free` | 把一个项目的投标材料先做一轮免费的AI体检，报价算术 + 模板占位符，不需要付款，也不需要注册 |
| `three-way-match-free` | 把采购订单、入库单、发票放在一起核一遍——订单号、供应商、物料、数量、单价、金额在各单据间对不对得上，另外揪出重复发票号与未替换的占位符 |
| `trade-doc-consistency-free` | 把外贸单据之间对不上的地方找出来（发票号 / 合同号 / 信用证号 / 金额 / 数量 / 重量 / 港口 / 船名），每条都带原文证据，不需要付款，也不需要注册 |
| `utility-allocation-check-free` | 费用分摊表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `vat-burden-check-free` | 增值税进销项汇总表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
<!-- SKILL_LIST_END -->

## 怎么用

每个技能目录里有：

```
SKILL.md              说明、触发场景与检查项边界
scripts/engine/*.js   本地引擎（纯标准库，可离线跑）
scripts/run.mjs       调用脚本
templates/sample.json 样例输入
```

```bash
cd skills/bidguard-quote-audit-free
node scripts/run.mjs --sample              # 用内置样例跑一遍
node scripts/run.mjs --input my-input.json # 跑自己的材料
node scripts/run.mjs --input in.json --json # JSON 输出
```

免费版**不需要付款、不需要注册、不需要 API Key，也不需要联网**。

### 退出码

| 码 | 含义 |
|---|---|
| 0 | 执行完成 |
| 3 | **材料不足**，没有执行检查，因此不出结论（会列出缺什么） |

## 实操指南（对着真实问题写的方法论）

> 也有网页版，读起来更舒服：**<https://chenqg618.github.io/compliance-skills/>**


工具之外，我们把这几件事的**判断口径**整理成了可以直接照抄的指南 ——
不装工具也能用，装了工具就少一步手工：

- [未达账项怎么找：一份可照着做的对账流程](guides/未达账项怎么找.md)
  —— 逐笔配对的四个口径、未达账项的四类成因、以及一个能自证的对账恒等式。
- [三单匹配怎么做：付款前那一步的完整口径](guides/三单匹配怎么做.md)
  —— 三张单据各自证明什么、容差必须显式给、以及最容易犯的三个错。
- [同一模板签的一叠合同，怎么快速看出哪一份被改过](guides/多份合同快速比对.md)
  —— 为什么必须按条款标题而不是编号对齐、要看的四类差异、以及为什么不该做"语义等价"判断。

## 设计取舍

- **免费版与完整版是两套检查项**，不是"完整版砍一半"：
  免费版做的是**客观可判定**的部分，逐条列出自己**没有**执行的检查项
  （见每次输出的 `checks_withheld`），不会用默认值假装查过。
- 输出是**AI核对结果与客观线索**，不构成法律意见，
  也不替代评标委员会或市场监督管理部门的认定。

## 说明

- 输出是**AI核对结果与客观线索**，不构成法律意见，
  也不替代评标委员会或市场监督管理部门的认定；
- 本项目的在线版本与更多AI核对工具：**<https://www.tokendidi.cn>**
- 本项目由河南樵夫网络科技有限公司运营。
