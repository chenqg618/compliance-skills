# AI核对型 AI 技能（免费版源码）

[![skills.sh](https://skills.sh/b/chenqg618/compliance-skills)](https://skills.sh/chenqg618/compliance-skills)

**招投标、合同、票据、广告文案、外贸单证、三单匹配（采购订单／入库单／发票）、报销合规、银行流水对账与多份合同横向比对**场景的AI核对技能。特点：

- **完全离线**：引擎是纯 Node.js 标准库实现，**不联网、不外发材料、不调用外部模型**，
  服务器停不停都不影响使用；
- **可复算**：同一份材料无论谁来跑，结论完全一致，每条结论都带依据、可被第三方复核；
- **没有次数上限**：装到本机就一直在，不需要 API Key，也没有每日额度；
- **不编造结论**：材料不足时明确告诉你缺什么，**不会拿默认值编一个"没问题"出来**。

> **想先在线试一下？** 不用注册、不用付款、不用装任何东西：
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

<!-- MCP_SECTION_START -->
## 也可以当 MCP server 用（170 个工具，完全离线）

同一个仓库里有一套 **MCP（Model Context Protocol）server** —— 任何支持 MCP 的 Agent
（Claude Desktop / Cursor / 各类 Harness）都能直接调用这 170 个确定性核对工具：

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
一条命令自查工具清单：`node compliance-skills/products/mcp-compliance-server/server.mjs --list`。
详见 [`products/mcp-compliance-server/README.md`](products/mcp-compliance-server/README.md)。
<!-- MCP_SECTION_END -->

## 直接下载（不想看源码的话）

每个免费技能包都打包好了，在 **Releases** 里下载即用：
<https://github.com/chenqg618/compliance-skills/releases/latest>
（每个 zip 顶层就是技能文件夹，解压即可用；里面只有 `SKILL.md` 与纯 Node 脚本，无依赖、无网络调用。）

## 完整版（买断，¥9.9）

免费版是**完整可用的核心产出**；需要**更深口径**时有两个付费形态：

| 形态 | 适合谁 | 在哪买/装 | 计费 |
|---|---|---|---|
| **完整档（离线引擎随包）** | 想在本机反复跑、材料敏感不能外发 | **SkillPay**：<https://skillpay.alipay.com/public/tokendidi> | **买断一次 ¥9.9**，跑多少次都不再收费（**不设免费试用**） |
| **按次档（调站点端点）** | 偶尔用一次 | **SkillHub**：<https://www.skillhub.cn/> 搜技能名 | 单次 ¥0.99 起 |

> 说明：免费版与完整版的**差别在检查项**（免费版会在输出里**如实列出哪些检查没有执行**）；
> 两者都是同一套确定性引擎，结论可复算。

## 安装

三条路，任选一条（都不用付款、不用注册、不用 API Key）：

**① 通用 agent skills（skills.sh / Claude Code / Codex / DSH / OpenClaw 等）**

```bash
npx skills add chenqg618/compliance-skills
```

> **非交互装全部 142 个技能**（第 256 轮**实测跑通**：克隆后报 `Found 142 skills`，
> 装出 `./.agents/skills/*` 与 `./.claude/skills/*`）：
> ```bash
> npx --yes skills@latest add chenqg618/compliance-skills --agent '*' -y
> ```
> 不带 `--agent`/`-y` 时会**弹出交互选择**（在脚本或 CI 里会直接卡住/取消）。

**② 作为 Claude Code 插件市场**

```bash
claude plugin marketplace add chenqg618/compliance-skills
```

**③ 在 DSH / SkillHub 的技能市场里按技能名安装**：
在技能市场里搜**技能名**（例如 `bank-reconciliation-free`、`vat-burden-check-free`），
<!-- MARKET_COUNT_START -->
或直接到 <https://www.skillhub.cn/> 搜同一批名字（**公开 API 回读**：已上架 **73 个免费技能** + **31 个完整档**）。
<!-- MARKET_COUNT_END -->
> 说明（第 255 轮核实后改写）：本仓库的 GitHub 话题是 `dsh-plugin` / `deepseek-harness` / `agent-skills` 等，
> **并不存在 `dsh-skill` 这个已生效的话题** —— 之前那行写法是错的，已改掉（不写没核实过的话）。

**④ ClawHub（免费包里下载量最大的渠道）** —— 按技能名单独安装：

```bash
npx clawhub install @chenqg618/<技能包名>      # 例：@chenqg618/bank-reconciliation-free
```

装完先在技能目录里跑一遍样例（**下面这两条是实测跑得通的**，样例文件就在包里）：

```bash
cp templates/sample.json my-material.json       # 打开它，把行换成你自己的数据（第一行是表头）
node scripts/run.mjs --input my-material.json   # 每条结论都带原文行号；材料不足会明说缺什么
```

> 买断完整档（多一类能力，如批量、跨期间勾稽）在 **SkillPay**：
> <https://skillpay.alipay.com/public/tokendidi>；
> 商品名 + 商品号 + 官方购买指令汇总在 <https://chenqg618.github.io/compliance-skills/buy.html>。

## 技能清单（免费版）

<!-- SKILL_LIST_START -->
（本仓库共 **176 个免费技能包**；完整档（买断）见上面的「完整版」一节。）

| 技能包 | 作用 |
|---|---|
| `accrual-expense-check-free` | 预提费用台账逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `ad-agency-rebate-check-free` | 广告代理返点与框架返点核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `ad-copy-rewrite-free` | 广告文案逐条体检、标出绝对化用语与医疗教育投资等违禁表述，每条结论带原文行号与法条依据 |
| `adcheckup-content-compliance-free` | 发布前扫一遍文案里的绝对化用语，并且按监管的执法指南判断该不该报，不需要付款，也不需要注册 |
| `advance-receipt-check-free` | 预收账款与收入确认台账逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `agri-purchase-invoice-deduction-check-free` | 农产品收购发票与进项抵扣核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `ap-aging-plan-check-free` | 应付账款账龄与付款计划表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `ap-factoring-check-free` | 应付账款保理与贴现表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `ap-provisional-check-free` | 应付暂估台账逐项核对，核暂估金额（数量乘单价）、冲回与暂估勾稽、暂估与发票差异、暂估余额滚动、合计逐列、重复单号与空缺负值，每条结论都带原文行号，不需要付款，也不需要注册 |
| `ap-reconciliation-free` | 供应商对账表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `ar-aging-check-free` | 应收对账表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `asset-disposal-check-free` | 固定资产处置表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `asset-impairment-check-free` | 资产减值测试表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `audit-adjustment-check-free` | 审计调整分录核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `award-contract-consistency-check-free` | 中标通知书与合同草案逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `bad-debt-provision-check-free` | 坏账准备计提表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `bank-acceptance-bill-check-free` | 银行承兑汇票台账逐票核对（到期日复算、余额勾稽、票号重复、状态空缺、金额与期限非正、已兑付仍计余额），每条结论都带原文行号，不需要注册 |
| `bank-loan-interest-check-free` | 银行贷款利息与还款计划核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `bank-reconciliation-free` | 把银行流水和企业账面记录贴成两段，逐笔配对、列出两侧未达账项和重复记录——每月对账最费时的那一步 |
| `bid-comparison-free` | 把多家投标人的报价明细逐项摆在一起对齐——谁缺项、各家合计多少、从低到高怎么排 |
| `bid-deposit-refund-check-free` | 保证金收退台账逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `bidcheckup-batch-compliance-free` | 一次把多家投标文件的报价算术全部核一遍，不需要付款，也不需要注册 |
| `bidguard-quote-audit-free` | 把一份投标报价单里能被算出来证明是错的问题找出来，不需要付款，也不需要注册 |
| `bonus-pool-check-free` | 年终奖分配表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `budget-variance-check-free` | 预算执行表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `cargo-insurance-claim-check-free` | 货运险投保与货损理赔台账逐票复算，每条结论都带原文行号，不需要付款，也不需要注册 |
| `cash-count-check-free` | 现金盘点表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `cash-flow-variance-check-free` | 现金流预测与实际差异表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `chain-store-settlement-check-free` | 连锁门店结算核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `cip-capitalization-check-free` | 在建工程台账逐项核对，工程成本归集（材料费 + 人工费 + 分包费 + 其他费用）、累计成本与上一行勾稽、在建工程账面余额勾稽、利息资本化复算、转固金额与明细勾稽、成本类别口径… |
| `cip-transfer-check-free` | 在建工程转固台账逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `cit-adjustment-check-free` | 企业所得税纳税调整表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `cit-prepay-check-free` | 季度预缴所得税计算表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `clinic-daily-cashier-check-free` | 门诊收费与退费日结核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `clinic-revenue-check-free` | 医疗收费与医保结算表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `collusionscreen-collusion-screening-free` | 把多家投标文件放在一起，找出客观可复算的雷同线索，不需要付款，也不需要注册 |
| `commission-check-free` | 提成计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `construction-monthly-selfcheck-free` | 建筑企业月度自查包（免费版）共 3 类核对，含 分包结算与产值核对、工程进度款与质保金核对、工程产值与进度确认核对 |
| `construction-output-value-check-free` | 工程产值与进度确认表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `construction-wage-special-account-check-free` | 建筑工人工资专户发放核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `contract-comparison-free` | 把同一模板下签的多份合同摆在一起逐条对齐——某一份少了哪一条、哪一条被改过、同一条有几个版本 |
| `contract-consistency-check-free` | 把合同里能被算出来、指出来证明是错的地方找出来，每条都带原文证据，不需要付款，也不需要注册 |
| `contract-performance-bond-check-free` | 履约保证金与保函台账逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `deferred-tax-check-free` | 递延所得税台账逐项核对（暂时性差异复算、递延余额复算、本期变动勾稽、方向与符号一致性、合计行复核、重复与空缺检测），每条结论都带原文行号，不需要付款，也不需要注册 |
| `department-budget-execution-check-free` | 部门费用预算执行表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `depreciation-check-free` | 固定资产台账逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `disability-fund-check-free` | 残保金申报表逐项复算，每条结论都带原文行号，不需要付款，也不需要注册 |
| `discount-interest-check-free` | 票据贴现计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `drg-settlement-check-free` | 医保结算清单与DRG入组核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `driver-freight-settlement-check-free` | 承运司机运费结算单逐项核对，逐单复算运费与应付运费、与对账单合计勾稽并定位差异单，每条结论都带原文行号与运单号，不需要付款，也不需要注册 |
| `ecommerce-monthly-selfcheck-free` | 电商财务月度自查包（免费版）共 3 类核对，含 电商平台结算核对、促销补贴与核销核对、直播佣金与坑位费结算核对 |
| `ecommerce-refund-settlement-check-free` | 电商退货退款与货款结算核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `equipment-maintenance-cost-check-free` | 设备维保台账与备件领用单逐项核对（工时费、备件金额、月度维保费用与预算对比、合计勾稽、重复与空缺负值），每条结论都带原文行号，不需要付款，也不需要注册 |
| `expense-compliance-free` | 把一沓发票和一张报销单放在一起核一遍——揪出重复报销的发票号、要素不齐的发票、以及没替换的占位符 |
| `export-fx-collection-check-free` | 出口报关与收汇核销表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `export-monthly-selfcheck-free` | 外贸月度自查包（免费版）共 3 类核对，含 出口退税核算核对、出口报关与收汇核销核对、外币结算与汇兑损益核对 |
| `export-rebate-check-free` | 出口退税（免抵退）计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `export-rebate-doc-consistency-check-free` | 出口退税申报单证一致性核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `finance-monthly-selfcheck-free` | 分段财务核对材料逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `fixed-asset-count-check-free` | 固定资产盘点表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `fleet-fuel-cost-check-free` | 车辆油耗与运费台账逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `franchise-royalty-check-free` | 加盟结算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `freight-reconciliation-free` | 运费月结单逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `fresh-loss-check-free` | 生鲜损耗与盘点表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `fx-settlement-check-free` | 外币结算核对表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `gov-subsidy-deferred-income-check-free` | 政府补助与递延收益核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `group-finance-monthly-selfcheck-free` | 集团财务月度自查包（免费版）共 3 类核对，含 集团内部往来对账与抵消核对、供应商应付对账、应收账款账龄核对 |
| `group-intercompany-reconciliation-check-free` | 集团内部往来对账与抵消核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `guarantee-letter-check-free` | 银行保函台账逐项核对，保函金额与保证金比例复算、到期日复算、保函号唯一性、注销与状态自洽、到期未注销仍占额度，每条结论都带原文行号，不需要付款，也不需要注册 |
| `hospital-supply-consumption-check-free` | 药品耗材进销存与科室领用核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `hotel-night-audit-check-free` | 酒店夜审与房费收入表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `housing-fund-check-free` | 住房公积金每月汇缴明细逐项核对，逐人复算单位与个人月缴存额、缴存合计勾稽、合计行与明细复核、重复人员与空缺负数、基数超出上下限，每条结论都带原文行号，不需要付款，也不需要注册 |
| `hr-monthly-selfcheck-free` | 人力资源月度自查包（免费版）共 3 类核对，含 工资表代扣与个税社保申报核对、工资个税累计预扣核对、社保公积金缴费基数核对 |
| `iit-withholding-check-free` | 个税累计预扣计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `import-duty-check-free` | 进口税费计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `input-vat-deduction-check-free` | 进项税额认证与抵扣对照表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `installment-rate-check-free` | 分期方案核对表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `insurance-agency-fee-check-free` | 保险代理手续费与佣金结算核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `inventory-check-free` | 库存盘点表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `inventory-cost-flow-check-free` | 存货出入库与成本表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `inventory-provision-check-free` | 存货跌价准备计提表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `inventory-scrap-approval-check-free` | 存货报废与审批台账逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `invoice-consistency-check-free` | 把票据里能被算出来、指出来证明是错的地方找出来，每条都带原文证据，不需要付款，也不需要注册 |
| `invoice-usage-stock-check-free` | 发票领用存台账逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `labor-cost-allocation-check-free` | 工时与人工成本分摊表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `late-fee-check-free` | 滞纳金计算表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `lease-liability-check-free` | 租赁负债摊销表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `lease-rent-check-free` | 租金账单/租赁结算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `lesson-hour-check-free` | 课时核销表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `live-commerce-commission-check-free` | 直播佣金与坑位费结算核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `logistics-storage-fee-check-free` | 物流仓储与操作费结算表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `long-term-amortization-check-free` | 长期待摊费用摊销台账逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `maintenance-fund-payment-check-free` | 维修资金与专项工程付款核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `mall-concession-check-free` | 商场联营抽成与保底核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `manufacturing-monthly-selfcheck-free` | 制造业月度自查包（免费版）共 3 类核对，含 生产投入产出与报废率核对、材料领用与定额损耗核对、存货出入库与加权平均成本核对 |
| `material-cost-variance-check-free` | 材料成本差异分摊核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `material-usage-loss-check-free` | 材料领用与损耗表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `medical-consumable-markup-check-free` | 医院/诊所每月结账与物价检查前的卫生耗材核对表，逐项复算结存数量、结存金额、加成率逐项复算，合计行勾稽、重复行与空缺检测，每条结论都带原文行号，不需要付款，也不需要注册 |
| `medical-insurance-denial-check-free` | 医保拒付与申诉核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `mold-amortization-check-free` | 模具与工装摊销台账逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `oem-rebate-policy-check-free` | 整车厂返利与商务政策核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `ota-commission-check-free` | 渠道结算核对表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `outsourced-processing-fee-check-free` | 委外加工结算核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `overdue-interest-check-free` | 逾期利息计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `overtime-pay-check-free` | 加班费计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `owner-supplied-material-check-free` | 甲供材台账与分包领用逐项核对，领用数量、领用金额、结算抵扣金额三条算式逐行复算，加上合计勾稽与重复/空缺/负值检测，每条结论都带台账原文行号，不需要付款，也不需要注册 |
| `payment-fee-check-free` | 收款手续费核对表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `payroll-check-free` | 发薪前把工资表算一遍——每个人的实发是不是等于应发减扣款、合计行是不是各列之和、有没有同一个人出现两行、有没有金额空缺或没替换的占位符 |
| `payroll-payable-check-free` | 应付职工薪酬台账逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `payroll-payment-bank-check-free` | 工资代发与银行回单核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `payroll-withholding-reconcile-free` | 工资表与个税社保申报对照表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `petty-cash-check-free` | 备用金与报销核销表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `piece-rate-wage-check-free` | 计件工资表逐项核对，计件工资（合格数量 × 工序单价）、应付计件工资（扣返工/报废、加保底/加班补差）、合格数与产量比对、合计勾稽、重复行与空缺负值检测，每条结论都带原文行号，… |
| `platform-settlement-aging-check-free` | 平台账期与在途资金核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `platform-settlement-check-free` | 平台结算单逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `prepaid-card-consumption-check-free` | 预付卡消费核销表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `prepayment-offset-check-free` | 预付账款核销台账逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `production-yield-scrap-check-free` | 生产投入产出与报废表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `progress-payment-check-free` | 工程进度款支付计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `project-billing-collection-check-free` | 项目开票与回款台账逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `project-evm-check-free` | 挣值分析表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `project-material-transfer-check-free` | 工程材料调拨与领用核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `promo-subsidy-check-free` | 促销补贴核销表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `property-fee-check-free` | 物业费计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `property-public-income-check-free` | 小区公共收益台账（电梯/道闸广告、场地租赁、快递柜、临时停车）逐项核对，应分成业主金额复算、季度小计与合计勾稽、重复登记、空缺与负值，每条结论都带原文行号，不需要付款，也不需要注册 |
| `property-tax-land-use-check-free` | 房产税与城镇土地使用税申报核对表逐处复算（从价/从租/土地使用税 + 分期与申报勾稽 + 差异定位），每条结论都带原文行号，不需要付款，也不需要注册 |
| `property-utility-apportionment-check-free` | 物业公共能耗分摊核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `purchase-rebate-check-free` | 采购返利核对表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `rd-expense-check-free` | 研发费用归集表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `receivable-collection-plan-check-free` | 应收账款催收计划与回款表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `rent-collection-check-free` | 租金收缴与欠租台账核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `restaurant-daily-sales-check-free` | 门店日营业款上报表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `restaurant-food-cost-check-free` | 餐饮菜品成本与出品率核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `retail-member-points-check-free` | 会员积分与储值卡核销核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `retention-money-check-free` | 质保金台账逐项核对，本期扣留金额、保修期届满日、退还金额三条算式逐行复算，加上合计勾稽与重复/空缺检测，每条结论都带台账原文行号，不需要付款，也不需要注册 |
| `royalty-settlement-check-free` | 版税与授权金结算核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `saas-revenue-recognition-check-free` | SaaS订阅收入确认表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `safety-production-fee-check-free` | 安全生产费用提取与使用核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `sales-commission-tier-check-free` | 销售提成与业绩核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `scrap-sale-check-free` | 废料边角料台账逐行复算与勾稽核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `sku-profit-check-free` | 按 SKU 复算真实毛利与毛利率（售价 − 成本 − 头程运费 − 平台佣金 − 广告费 − 退货损失，含汇率折算），逐行标出算错的与毛利率异常低的，不需要付款，也不需要注册 |
| `social-insurance-base-check-free` | 社保缴费基数核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `social-insurance-check-free` | 社保申报明细逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `software-license-check-free` | 软件许可与云资源台账逐项核对（年费用与月均复算、订阅起止与账期月数勾稽、装机或账号数超许可数、重复行与合计勾稽、空缺负值与日期倒挂检测），每条结论都带原文行号，不需要付款，也不… |
| `software-outsource-milestone-check-free` | 软件外包里程碑验收与付款核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `stamp-duty-base-check-free` | 印花税计税依据台账逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `store-sales-report-check-free` | 门店营收上报表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `store-transfer-check-free` | 门店调拨与库存核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `subcontract-settlement-check-free` | 分包结算与产值核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `surtax-check-free` | 附加税费计算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `takeout-commission-check-free` | 外卖平台（美团、饿了么、抖音外卖）月度账单逐行核对，佣金、配送费商家承担、活动补贴与商家实收算得对不对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `tax-incentive-eligibility-check-free` | 税收优惠适用条件自查表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `tax-invoice-void-check-free` | 发票作废与红冲台账逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `tax-monthly-selfcheck-free` | 税务月度自查包（免费版）共 3 类核对，含 增值税进销项与税负率核对、增值税附加税费核对、预缴企业所得税核对 |
| `tax-risk-indicator-check-free` | 税务风险指标自查表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `tenderaudit-full-compliance-free` | 把一个项目的投标材料先做一轮免费的AI体检，报价算术 + 模板占位符，不需要付款，也不需要注册 |
| `three-way-match-free` | 把采购订单、入库单、发票放在一起核一遍——订单号、供应商、物料、数量、单价、金额在各单据间对不对得上，另外揪出重复发票号与未替换的占位符 |
| `toll-processing-manual-check-free` | 加工贸易手册与保税料件核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `trade-doc-consistency-free` | 把外贸单据之间对不上的地方找出来（发票号 / 合同号 / 信用证号 / 金额 / 数量 / 重量 / 港口 / 船名），每条都带原文证据，不需要付款，也不需要注册 |
| `training-hour-consumption-check-free` | 教培课消与预收学费核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `travel-standard-check-free` | 差旅费报销与标准表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `trial-balance-check-free` | 科目余额表逐项核对（免费版） |
| `tuition-refund-check-free` | 退费核对表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `union-reserve-check-free` | 工会经费与残保金计提表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `utility-allocation-check-free` | 费用分摊表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `utility-meter-reading-check-free` | 水电抄表与账单核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `utility-tier-billing-check-free` | 电费账单核对表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `vat-burden-check-free` | 增值税进销项汇总表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `vat-filing-reconcile-free` | 增值税申报与账载开票对照表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `vat-input-transfer-out-check-free` | 进项税额转出计算表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `vehicle-insurance-amortization-check-free` | 车辆保险与保费摊销核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `viral-script-free` | 把一份口播逐字稿丢进来，10 秒内出体检报告——结构地图、开场钩子强度、留存节奏、口语度评分、CTA 强度，并列出问题清单 |
| `warehouse-fee-check-free` | 仓储费结算表逐项核对，每条结论都带原文行号，不需要付款，也不需要注册 |
| `warehouse-inventory-turnover-check-free` | 仓库周转与呆滞库存表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `waybill-pod-cod-check-free` | 运单回单与代收货款核对表逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
| `welfare-limit-check-free` | 职工福利费与教育经费台账逐项核对，每条结论都带原文依据，不需要付款，也不需要注册 |
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
- 全部免费工具与说明：**<https://chenqg618.github.io/compliance-skills/>**
- 本项目由河南樵夫网络科技有限公司运营。
