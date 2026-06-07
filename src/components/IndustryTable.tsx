import type { Industry } from "../types";
import { computeSignals, SIGNAL_COLORS, CONVICTION_COLORS, TIERS, INDUSTRY_TIER, TIER_COLORS } from "../signals";
import type { IndustrySignals, TierDef, SignalLevel } from "../signals";

type SignalKey = "national" | "provincial" | "city" | "plan" | "market";

const HEADER_LABELS: {
  key: SignalKey;
  label: string;
  scope: string;
}[] = [
  { key: "national", label: "国家", scope: "全国规划纲要" },
  { key: "provincial", label: "省级", scope: "浙江1省" },
  { key: "city", label: "城市", scope: "9城" },
  { key: "plan", label: "规划", scope: "9城" },
  { key: "market", label: "市场", scope: "公开行情" },
];

function SignalDot({
  level,
  coverage,
}: {
  level: SignalLevel;
  coverage?: string;
}) {
  const isBlank = level === "⚪";
  return (
    <span
      className={`text-sm ${
        SIGNAL_COLORS[level as keyof typeof SIGNAL_COLORS] || "text-zinc-400"
      }`}
      title={
        isBlank && coverage
          ? `暂无此层数据（当前覆盖：${coverage}）`
          : level === "🟢"
          ? "强信号"
          : level === "🟡"
          ? "中等信号"
          : level === "🟠"
          ? "弱信号"
          : ""
      }
    >
      {level}
    </span>
  );
}

function renderRows(
  rows: { ind: Industry; sig: IndustrySignals }[],
  selectedId: string,
  onSelect: (id: string) => void
) {
  return rows.map(({ ind, sig }) => {
    const isSelected = ind.id === selectedId;
    return (
      <tr
        key={ind.id}
        onClick={() => onSelect(ind.id)}
        className={`border-b border-zinc-100 dark:border-zinc-800 cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
          isSelected ? "bg-amber-50 dark:bg-amber-900/20 font-medium" : ""
        }`}
      >
        <td className="px-2 py-1 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap text-xs">
          {ind.name}
        </td>
        {HEADER_LABELS.map(({ key, scope }) => (
          <td key={key} className="px-1 py-1 text-center">
            <SignalDot level={sig[key]} coverage={scope} />
          </td>
        ))}
        <td className="px-2 py-1 whitespace-nowrap">
          {sig.etfCode === "-" || !sig.etfCode ? (
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">—</span>
          ) : (
            <span
              className="cursor-help"
              title={
                ind.investment_observation.etf?.index
                  ? `跟踪指数：${ind.investment_observation.etf.index}`
                  : ""
              }
            >
              <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 font-medium">
                {sig.etfCode}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 ml-1">
                {ind.investment_observation.etf?.name || ""}
              </span>
            </span>
          )}
        </td>
        <td className="px-1 py-1">
          <ConfidenceBadge level={sig.etfConfidence} />
        </td>
        <td className="px-2 py-1">
          <span
            className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium border ${
              CONVICTION_COLORS[sig.direction.conviction]
            }`}
            title={sig.direction.action}
          >
            {sig.direction.conviction}
          </span>
          {sig.direction.contradiction && (
            <span
              className="ml-1 text-amber-500 cursor-help"
              title={sig.direction.contradiction}
            >
              ⚠
            </span>
          )}
        </td>
        <td className="px-2 py-1 text-right text-[11px] font-mono whitespace-nowrap">
          <ReturnCell sig={sig} field="return1y" />
        </td>
        <td className="px-2 py-1 text-right text-[11px] font-mono whitespace-nowrap">
          <ReturnCell sig={sig} field="return6m" />
        </td>
        <td className="px-2 py-1 text-right text-[11px] font-mono whitespace-nowrap">
          <ReturnCell sig={sig} field="return3m" />
        </td>
      </tr>
    );
  });
}

export function IndustryTable({
  industries,
  selectedId,
  onSelect,
}: {
  industries: Industry[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const rows: { ind: Industry; sig: IndustrySignals }[] = industries.map(
    (ind) => ({ ind, sig: computeSignals(ind) })
  );

  // Group rows by document tier, preserving JSON order within each tier
  const tierGroups = TIERS.map((tier) => ({
    tier,
    rows: rows.filter((r) => INDUSTRY_TIER[r.ind.id] === tier.key),
  })).filter((g) => g.rows.length > 0);

  return (
    <section className="mb-12">
      <div className="mb-4">
        <div className="flex items-baseline gap-3 mb-1">
          <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            信号共识矩阵
          </h2>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {industries.length} 个产业 · 🟢强 🟡中 🟠弱 ⚪暂无此层数据
          </span>
        </div>
        <details className="mb-3">
          <summary className="text-xs text-zinc-400 dark:text-zinc-500 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300 select-none">
            数据说明与注释
          </summary>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              数据覆盖：全国规划纲要 + 浙江省 + 上海/深圳/杭州/南京/苏州/北京/广州/合肥/武汉 9 城（两会报告+十五五规划）。
              ⚪ 表示当前覆盖范围内未抓取到对应证据，不等于该产业无落地。
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              行情数据：静态快照，截止 2026-06-03。由于多数新兴产业尚无纯正ETF上市，本表将每个产业映射到市场上最接近的一只ETF，
              映射精度分三档：<span className="text-emerald-500 dark:text-emerald-400 font-medium">精准匹配</span>（有独立行业ETF，如芯片ETF→半导体）、
              <span className="text-amber-500 dark:text-amber-400 font-medium">相关匹配</span>（借用了相近行业ETF，如军工ETF→深海经济）、
              暂无对应（该产业处于早期或过于宽泛，无合适标的）。
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              <span className="text-amber-500 dark:text-amber-400">*</span> 标注的涨跌幅来自<span className="font-medium">代理ETF</span>——即这只ETF并非为该产业设计，其价格变动反映的是另一个行业板块的行情。
              例如：深海经济、商业航天、大飞机的涨跌幅均来自同一只军工ETF（512660），因此三者的6月/1年数据完全相同，实际上都是军工板块的涨幅，不能当作这三个产业各自的市场信号。
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              时间维度说明：1年涨跌幅主要反映国家级政策定调（十五五规划、政府工作报告、预算安排）的累积效果——
              即"方向对不对"。3月/6月涨跌幅反映的是中期市场价格变化，其驱动因素（项目开工落地、季度业绩兑现、机构资金调仓、
              行业催化事件）超出了本工具当前的政策文本覆盖范围。本表提供的是政策方向验证，而非短期交易信号。
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              分组：按十五五规划纲要中产业的文档优先级分层——攻坚战（集成电路/工业母机/先进材料/基础软件/生物制造/AI）→ 增长引擎（机器人/氢能/6G/量子/脑机）→ 能源与资源安全 → 战略产业 → 强化升级 → 制度民生 → 监管化。
              行内信念徽标表示该产业在五层信号交叉验证后的投资信念等级。⚠ 表示层面间存在矛盾（如政策强推但市场未认）。
            </p>
          </div>
        </details>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="min-w-[640px] w-full text-sm">
          <thead>
            <tr className="border-b-2 border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              <th className="px-2 py-1.5 text-left">产业</th>
              {HEADER_LABELS.map(({ key, label, scope }) => (
                <th key={key} className="px-1 py-1.5 text-center w-10" title={scope}>
                  {label}
                </th>
              ))}
              <th className="px-2 py-1.5 text-left">ETF</th>
              <th className="px-1 py-1.5 text-left">映射精度</th>
              <th className="px-2 py-1.5 text-left">信念</th>
              <th className="px-2 py-1.5 text-right">近1年</th>
              <th className="px-2 py-1.5 text-right">近6月</th>
              <th className="px-2 py-1.5 text-right">近3月</th>
            </tr>
          </thead>
          <tbody>
            {tierGroups.map(({ tier, rows: tierRows }) => (
              <TierSection
                key={tier.key}
                tier={tier}
                rows={tierRows}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </tbody>
        </table>
      </div>

      <StrategyLegend />
    </section>
  );
}

function ReturnCell({
  sig,
  field,
}: {
  sig: IndustrySignals;
  field: "return3m" | "return6m" | "return1y";
}) {
  const val = sig[field];
  const isProxy =
    sig.etfConfidence !== "精准匹配" && sig.etfConfidence !== "暂无对应";
  const colorClass = val.startsWith("+")
    ? "text-emerald-600 dark:text-emerald-400"
    : val.startsWith("-")
    ? "text-red-500 dark:text-red-400"
    : "text-zinc-400 dark:text-zinc-500";

  return (
    <span className={colorClass} title={isProxy ? `ETF映射：${sig.etfConfidence}（${sig.etfCode}）` : sig.etfCode}>
      {val}
      {isProxy && (
        <span className="text-amber-500 dark:text-amber-400 ml-0.5">*</span>
      )}
    </span>
  );
}

interface StrategyDef {
  name: string;
  tagline: string;
  operation: string;
  position: string;
  stopLoss: string;
  exit: string;
  cycle: string;
}

const STRATEGIES: StrategyDef[] = [
  {
    name: "高信念",
    tagline: "三重确认",
    operation: "回调15-20%分批建仓",
    position: "≤15%/只，合计≤60%",
    stopLoss: "省级降级或资金连续4周流出",
    exit: "省级降级或资金连续4周流出→减仓",
    cycle: "中长期",
  },
  {
    name: "中等信念",
    tagline: "两层面确认",
    operation: "已有仓位持有，新仓等回调或催化剂",
    position: "试仓3-5%，确认后5-8%",
    stopLoss: "6个月无新信号→减半",
    exit: "省级降级或下期报告不再提及",
    cycle: "中期",
  },
  {
    name: "低信念",
    tagline: "单层面信号",
    operation: "列入观察，不主动建仓",
    position: "≤5%，仅技术面入场",
    stopLoss: "严格技术止损",
    exit: "信号恶化或下期不再提及",
    cycle: "短线/观察",
  },
  {
    name: "观望",
    tagline: "尚无信号",
    operation: "等待任何一层出现信号",
    position: "—",
    stopLoss: "—",
    exit: "—",
    cycle: "—",
  },
  {
    name: "回避",
    tagline: "政策退潮",
    operation: "不做，等政策信号反转",
    position: "—",
    stopLoss: "—",
    exit: "—",
    cycle: "—",
  },
];

function TierSection({
  tier,
  rows,
  selectedId,
  onSelect,
}: {
  tier: TierDef;
  rows: { ind: Industry; sig: IndustrySignals }[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const colorClass = TIER_COLORS[tier.key];

  return (
    <>
      <tr className={`border-b border-zinc-200 dark:border-zinc-700 ${colorClass.split(" ")[0]} ${colorClass.split(" ")[1]}`}>
        <td colSpan={13} className="px-3 py-0.5">
          <span className={`text-[11px] font-bold ${colorClass.split(" ").slice(2).join(" ")}`}>
            {tier.label}
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-1.5">
            {rows.length}个
          </span>
        </td>
      </tr>
      {renderRows(rows, selectedId, onSelect)}
    </>
  );
}

function StrategyLegend() {
  return (
    <details className="mt-6 group">
      <summary className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors select-none">
        方向判断框架说明
      </summary>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
        三维交叉：政策动量 × 执行证据 × 市场认知 → 信念等级。⚠ 标记表示层面间存在矛盾。
      </p>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {STRATEGIES.map((s) => (
          <div
            key={s.name}
            className={`rounded-lg border p-3 text-sm ${
              CONVICTION_COLORS[s.name as keyof typeof CONVICTION_COLORS] || CONVICTION_COLORS["观望"]
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-base">{s.name}</span>
              <span className="text-xs opacity-70">· {s.tagline}</span>
            </div>
            <dl className="space-y-1 text-xs">
              <Row label="操作" value={s.operation} />
              <Row label="仓位" value={s.position} />
              <Row label="止损" value={s.stopLoss} />
              <Row label="退出" value={s.exit} />
              <Row label="周期" value={s.cycle} />
            </dl>
          </div>
        ))}
      </div>
    </details>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <dt className="font-medium opacity-60 shrink-0">{label}</dt>
      <dd className="opacity-80">{value}</dd>
    </div>
  );
}

const CONFIDENCE_STYLES: Record<string, string> = {
  "精准匹配":
    "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
  "相关匹配":
    "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700",
  "暂无对应":
    "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
};

const CONFIDENCE_EXPLAIN: Record<string, string> = {
  "精准匹配": "有独立行业ETF",
  "相关匹配": "借用相近行业ETF代理",
  "暂无对应": "产业早期或过于宽泛，无合适标的",
};

function ConfidenceBadge({ level }: { level: string }) {
  const style = CONFIDENCE_STYLES[level] || CONFIDENCE_STYLES["暂无对应"];
  const explain = CONFIDENCE_EXPLAIN[level] || "";
  return (
    <span
      className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium border ${style}`}
      title={explain}
    >
      {level}
    </span>
  );
}
