# 机械核对型 AI 技能（免费版源码）

招投标与广告合规场景的**机械核对**技能。特点：

- **可复算**：同一份材料无论谁来跑，结论完全一致，每条结论都带依据、可被第三方复核；
- **零第三方依赖**：引擎是纯标准库实现，不调用外部模型；
- **免费版源码公开**：本仓库里的技能可直接安装使用。

## 技能清单（免费版）

| 技能 | 作用 |
|---|---|
| `bidguard-quote-audit-free` | 投标报价机械审查：逐行核对「合价 = 数量 × 单价」、缺漏项提示 |
| `collusionscreen-collusion-screening-free` | 串通投标线索筛查：联系方式一致、项目成员交叉 |
| `bidcheckup-batch-compliance-free` | 多标书批量合规体检：逐家报价算术校验 |
| `tenderaudit-full-compliance-free` | 招投标材料机械体检：逐家报价算术 + 模板占位符扫描 |
| `adcheckup-content-compliance-free` | 广告文案合规预检：绝对化用语检测 + 监管豁免判定 |

## 怎么用

每个技能目录里有 `SKILL.md`（说明与触发场景）和 `scripts/run.mjs`（调用脚本）。

```bash
cd skills/bidguard-quote-audit-free
node scripts/run.mjs --sample
```

免费版调用公开的免费接口，**不需要付款、不需要注册、不需要 API Key**。
每个新设备还可以领一次完整版试用。

## 说明

- 输出是**机械核对结果与客观线索**，不构成法律意见，
  也不替代评标委员会或市场监督管理部门的认定；
- 本项目由河南樵夫网络科技有限公司运营。
