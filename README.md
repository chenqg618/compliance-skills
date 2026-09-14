# 机械核对型 AI 技能（免费版源码）

[![skills.sh](https://skills.sh/b/chenqg618/compliance-skills)](https://skills.sh/chenqg618/compliance-skills)

**招投标、合同、票据、广告文案、外贸单证、三单匹配（采购订单／入库单／发票）、报销合规、银行流水对账与多份合同横向比对**场景的机械核对技能。特点：

- **完全离线**：引擎是纯 Node.js 标准库实现，**不联网、不外发材料、不调用外部模型**，
  服务器停不停都不影响使用；
- **可复算**：同一份材料无论谁来跑，结论完全一致，每条结论都带依据、可被第三方复核；
- **没有次数上限**：装到本机就一直在，不需要 API Key，也没有每日额度；
- **不编造结论**：材料不足时明确告诉你缺什么，**不会拿默认值编一个"没问题"出来**。

> **想先在线试一下？** 不用注册、不用付款、不用装任何东西：
> <https://www.tokendidi.cn/check> —— 把材料粘进去，立刻看到机械核对结果。
> （标书 / 合同 / 票据 / 广告文案 / 外贸单证 / 三单匹配 / 报销单 / 多家报价比价 / 银行流水对账 /
> 多份合同比对，都在同一个入口里选。）

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

| 技能 | 作用 |
|---|---|
| `bidguard-quote-audit-free` | 投标报价机械审查：逐行核对「合价 = 数量 × 单价」、缺漏项提示 |
| `collusionscreen-collusion-screening-free` | 串通投标线索筛查：联系方式一致、项目成员交叉（输出自动脱敏） |
| `bidcheckup-batch-compliance-free` | 多标书批量合规体检：逐家报价算术校验，给出逐家 verdict |
| `tenderaudit-full-compliance-free` | 招投标材料机械体检：逐家报价算术 + 模板占位符扫描 |
| `adcheckup-content-compliance-free` | 广告文案合规预检：绝对化用语检测 + 监管豁免判定 |
| `contract-consistency-check-free` | 合同一致性机械核对：当事方名称／日期／金额矛盾、占位符残留、条款交叉引用失效、定义词卫生（**中英双语**） |
| `invoice-consistency-check-free` | 票据一致性机械核对：行内算术、分项加总、税额计算、价税合计、大小写金额、抬头一致、日期逻辑、重复票检测、占位符残留（**中英双语**） |
| `trade-doc-consistency-free` | 外贸单证单单一致核对：发票号／合同号／信用证号、金额与币种、数量／件数／重量、港口／船名／唛头跨单据一致，占位符残留 |
| `three-way-match-free` | 三单匹配机械核对：采购订单／入库单／发票之间的订单号、供应商、物料、数量／单价／金额一致，重复发票号线索、占位符残留 |
| `expense-compliance-free` | 报销单合规预检：一沓发票 + 一张报销单之间的重复发票号（重复报销线索）、发票要素完整性、占位符残留 |
| `bid-comparison-free` | 多家报价横向比价：按项目名对齐各家的数量／单价／合价（含中位数）、缺项与多项、各家合计与排序 —— 评标清标那一步的机械部分 |

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
  免费版做的是**机械可判定**的部分，逐条列出自己**没有**执行的检查项
  （见每次输出的 `checks_withheld`），不会用默认值假装查过。
- 输出是**机械核对结果与客观线索**，不构成法律意见，
  也不替代评标委员会或市场监督管理部门的认定。

## 说明

- 输出是**机械核对结果与客观线索**，不构成法律意见，
  也不替代评标委员会或市场监督管理部门的认定；
- 本项目的在线版本与更多机械核对工具：**<https://www.tokendidi.cn>**
- 本项目由河南樵夫网络科技有限公司运营。
