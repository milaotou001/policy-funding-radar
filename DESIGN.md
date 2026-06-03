# DESIGN.md — 政策资金流向雷达

三风格融合：Dashboard（数据驾驶舱）+ Clean（克制留白）+ Editorial（文本阅读）

---

## §1 Visual Theme & Atmosphere

专业、冷静、可信。金融研究工具的气质——不是营销页面，不是社交产品。用户带着钱在看，每一处视觉都必须传递"认真、克制、不煽动"的信号。

- 数据区（矩阵表格）：深色底，高对比，扫读优先
- 文本区（落地证据）：浅色底，舒适行距，阅读优先
- 整体色调：冷灰为骨架，蓝为链接/强调，琥珀为选中/高亮，无大面积纯色块

---

## §2 Color Palette & Roles

### 深色主题（Dashboard 默认 — 矩阵、图表、卡片）

| Token | Hex | Role |
|---|---|---|
| `surface-primary` | `#09090b` | 页面底色 |
| `surface-secondary` | `#18181b` | 卡片/面板底色 |
| `surface-tertiary` | `#27272a` | 悬停/次级面板 |
| `border-primary` | `#3f3f46` | 卡片/表格边框 |
| `border-subtle` | `#27272a` | 内部分割线 |
| `text-primary` | `#fafafa` | 标题/重要数据 |
| `text-secondary` | `#a1a1aa` | 正文/标签 |
| `text-tertiary` | `#71717a` | 辅助信息/注释 |
| `accent-blue` | `#3b82f6` | 链接/ETF代码 |
| `accent-amber` | `#f59e0b` | 选中态/高亮/信号⚪ |
| `accent-emerald` | `#10b981` | 正向数据/强信号🟢 |
| `accent-red` | `#ef4444` | 负向数据/风险 |

### 浅色主题（落地证据 Tab — 阅读舒适区）

| Token | Hex | Role |
|---|---|---|
| `light-surface` | `#ffffff` | 文本卡片底色 |
| `light-bg` | `#fafafa` | 区域底色 |
| `light-border` | `#e5e7eb` | 卡片边框 |
| `light-text` | `#111827` | 正文 |
| `light-text-secondary` | `#6b7280` | 辅助文本 |

### 信号色（矩阵表格专用，深/浅通用）

| 信号 | 浅色背景 | 深色背景 |
|---|---|---|
| 🟢 强信号 | `bg-emerald-50 text-emerald-800` | `bg-emerald-900/30 text-emerald-300` |
| 🟡 中信号 | `bg-amber-50 text-amber-800` | `bg-amber-900/30 text-amber-300` |
| 🟠 弱信号 | `bg-orange-50 text-orange-800` | `bg-orange-900/30 text-orange-300` |
| ⚪ 无数据 | `text-zinc-400` | `text-zinc-600` |

---

## §3 Typography

- 系统字体优先：`"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- 等宽：`"IBM Plex Mono", "JetBrains Mono", "Consolas", monospace`
- 中文字体栈：系统默认（PingFang SC / Microsoft YaHei），不加载 webfont
- 权重限制：Regular(400)、Medium(500)、Semibold(600)、Bold(700)。不用 Thin/Light/Black

| 元素 | 大小 | 权重 | 行距 |
|---|---|---|---|
| 页面标题 | 24-32px | 700 | 1.2 |
| 区块标题 | 18-20px | 600 | 1.3 |
| 表格表头 | 11px | 600 | 1.4 |
| 表格正文 | 11-12px | 400-500 | 1.4 |
| 卡片正文 | 13-14px | 400 | 1.6 |
| 证据文本 | 13-14px | 400 | 1.8（阅读区加宽行距） |
| ETF 代码 | 11px | 500 | monospace |
| 数值数据 | 11px | 500 | monospace |
| 注释/脚注 | 10-11px | 400 | 1.5 |

---

## §4 Spacing Scale

8pt 基准网格。所有间距必须是 4 或 8 的倍数。

| Token | Value | 用途 |
|---|---|---|
| `space-1` | 4px | 微小间距（icon-label gap） |
| `space-2` | 8px | 行内间距 |
| `space-3` | 12px | 紧凑区块间距 |
| `space-4` | 16px | 卡片内 padding |
| `space-5` | 20px | 标准区块间距 |
| `space-6` | 24px | 大区块间距 / section gap |
| `space-8` | 32px | 页面级间距 |
| `space-12` | 48px | 首尾留白 |

---

## §5 Component Stylings

### 表格（信号共识矩阵）
- 底色 `surface-secondary`，表头 `surface-tertiary`
- 行高紧凑：`py-1`（4px），字体 `text-[11px]`
- 分组标题行：彩色左边框 + 加粗标签
- 选中行：琥珀色左边框 + 背景微提亮
- 悬停行：`surface-tertiary` 背景
- 数值列右对齐，monospace
- 列间距：文字列 `px-2`，数值列 `px-2`

### 卡片（投资观察）
- 圆角 `8px`
- 边框 `border-primary`，背景 `surface-secondary`
- 内 padding `p-4 sm:p-6`
- 无阴影（仪表盘风格不要浮动感）

### Tab 导航
- 下划线式，选中态使用 `accent-amber`
- 字体 `text-sm`，间距 `px-4 py-2`
- 非选中态 `text-tertiary`，悬停变亮

### 标签/徽章
- 圆角 `4px`
- 内 padding `px-1.5 py-0.5`
- 字体 `text-[10px]` 或 `text-xs`
- 颜色跟随语义（绿=正/强，黄=中/注意，灰=中性/无关）
- 必须有边框 + 半透明底色，不要实心色块

### 折叠详情 details/summary
- summary 字体 `text-xs`，颜色 `text-tertiary`
- 悬停变 `text-secondary`
- 展开内容与 summary 间留 8px 间距

### 搜索框
- 圆角 `6px`，背景 `surface-tertiary`，边框 `border-primary`
- focus 时边框变 `accent-blue`

---

## §6 Layout Principles

1. **自上而下，不分栏**。单一内容列，最大宽度 960px，居中。不做侧边栏——数据表格已经够宽。
2. **折叠优先**。二级信息（注释、说明、图例、分类明细）默认折叠，只露 summary 标签。
3. **信息左对齐，数据右对齐**。文字标签/名称左对齐，数值/百分比右对齐。
4. **读扫分离**。表格区追求紧凑（扫读），证据区追求舒适行距（阅读）。
5. **Tab 切分关注域**。一个 Tab 聚焦一个任务，不堆砌。

---

## §7 Depth & Elevation

- 不用阴影。区分层级靠背景色差和边框，不靠投影。
- 表格卡片 1px 实色边框，无 shadow
- Tab 按钮依靠 `-mb-px` 与内容区无缝连接

---

## §8 Responsive Behavior

- 基准宽度 960px，表格溢出时水平滚动（`overflow-x-auto`）
- 移动端（<640px）：表格字体缩小至 10px，卡片 padding 减至 `p-3`
- Tab 不换行，溢出时水平滚动
- 不隐藏列——宁可滚动也不砍信息

---

## §9 Do's and Don'ts

### Do
- 保持行间距在 1.4-1.8 之间，不松不紧
- 用颜色区分信号强度，但必须有文字标签作为冗余
- 所有数值列用 monospace，等宽保证对齐
- 代理 ETF 数据必须标注 `*`
- 无数据的单元格显示 `—` 而非留空

### Don't
- 不用渐变色、毛玻璃、霓虹效果
- 不用 box-shadow 做卡片悬浮
- 不用 emoji 做装饰
- 不在数据区用衬线字体
- 不隐藏核心列来适配移动端
- 不做动画/过渡效果，这是研究工具不是消费产品

---

## §10 Agent Prompt Guide

当生成此项目 UI 代码时：
1. 先从本文读取对应 Section 的约束
2. Tailwind 类名优先，避免 inline style
3. 色值使用本文定义的 hex token，不使用 Tailwind 默认色板（如 zinc-900 可接受，但 accent 色必须用本文值）
4. 间距必须是 4 或 8 的倍数
5. 每次生成后自检：是否违反 §9 Don't 列表
