import { useState } from "react";

export function Methodology() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-12">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex items-center justify-between py-3 border-b-2 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors cursor-pointer"
      >
        <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          判断依据与方法说明
        </h2>
        <span className="text-zinc-400 dark:text-zinc-500 text-xl transition-transform duration-200" style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
          +
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">一、产业方向筛选依据</h3>
            <p className="mb-2">从十四五和十五五两份纲要的产业相关篇章中，提取符合以下标准的产业方向：</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li><strong>有明确政策表述</strong>：在两份规划纲要正文中有专章或专节提及，而非仅在附属文件中出现。</li>
              <li><strong>有产业边界可识别</strong>：对应到可辨识的产业链（上游/中游/下游），而非泛泛的宏观方向。</li>
              <li><strong>有可对比的语义锚点</strong>：两份规划中均能用同一产业标签进行语义对齐（新増方向除外），AI 能找到十四五一侧和十五五一侧的对应段落。</li>
              <li><strong>投资研究相关性</strong>：方向有映射的行业、ETF 或可跟踪的落地证据，服务投资前置研究而非纯学术分析。</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">二、变化类型判断标准</h3>
            <table className="w-full text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700 text-left">
                  <th className="py-1.5 pr-2 font-semibold">标记类型</th>
                  <th className="py-1.5 pr-2 font-semibold">判断依据</th>
                  <th className="py-1.5 font-semibold">典型信号词</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-1.5 pr-2 font-medium text-amber-700 dark:text-amber-300">新增</td>
                  <td className="py-1.5 pr-2">十四五正文未提及或基本未出现，十五五首次写入纲要正文且列为独立方向</td>
                  <td className="py-1.5 text-zinc-500 dark:text-zinc-400">低空经济、具身智能、脑机接口在十四五中无对应段落</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-1.5 pr-2 font-medium text-amber-700 dark:text-amber-300">强化</td>
                  <td className="py-1.5 pr-2">十四五已提及，十五五中位置更靠前、措辞更强、覆盖范围扩大或优先级提升</td>
                  <td className="py-1.5 text-zinc-500 dark:text-zinc-400">数字经济从"建设数字中国"升级为"深入推进+提升数智化水平"</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-1.5 pr-2 font-medium text-gray-500 dark:text-gray-400">弱化</td>
                  <td className="py-1.5 pr-2">十四五重点提及，十五五中降温、措辞减弱或从独立方向降级为附属提及</td>
                  <td className="py-1.5 text-zinc-500 dark:text-zinc-400">传统基建、房地产开发从独立章节降为附属内容</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-1.5 pr-2 font-medium text-blue-700 dark:text-blue-300">工程化</td>
                  <td className="py-1.5 pr-2">从"培育""发展""鼓励"等软性措辞，变为"实施工程""建设平台""示范应用""规模化"等硬性项目化表述</td>
                  <td className="py-1.5 text-zinc-500 dark:text-zinc-400">新能源从"提升规模"变为"十年倍增行动+清洁能源基地"</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-2 font-medium text-orange-700 dark:text-orange-300">监管化</td>
                  <td className="py-1.5 pr-2">从支持发展或激励为主，转向规范治理、算法监管、整治过度竞争等约束性政策</td>
                  <td className="py-1.5 text-zinc-500 dark:text-zinc-400">平台经济增加"算法备案""透明度管理""内卷式竞争整治"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">三、语义对齐方法</h3>
            <p className="mb-2">不走"按章节序号硬对齐"，而是按产业标签做语义检索：</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>为每个产业方向定义核心关键词集合（如"新能源"→ 风电、光伏、储能、非化石能源、电力系统）。</li>
              <li>在十四五全文和十五五全文中分别检索关键词，定位相关段落。</li>
              <li>AI 对比同产业标签下的十四五段落和十五五段落，判断变化方向和程度。</li>
              <li>每个变化判断必须附带原文证据（evidence_14 / evidence_15），不可空口断言。</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">四、投资观察要点方法论</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>政策变化</strong>：基于十四五一侧和十五五一侧的具体表述差异，总结政策逻辑的质变。</li>
              <li><strong>资源倾斜强度</strong>：综合判断——写入纲要独立篇章/列入攻坚战为"高"，写入培育方向为"中"，仅附属提及为"低"。综合考量是否有量化目标、专项资金、立法计划等佐证。</li>
              <li><strong>落地证据</strong>：查阅是否有重大项目清单、专项基金、产业园、政府采购政策、立法计划等实际落地信号。</li>
              <li><strong>对应产业链</strong>：按上游（材料/设备）、中游（制造/平台）、下游（应用/服务）三段拆解，确保产业链可追踪。</li>
              <li><strong>风险提示</strong>：梳理产能过剩、技术不确定性、政策 price-in、估值泡沫等已识别的投资风险。</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">五、局限性声明</h3>
            <ul className="list-disc pl-5 space-y-1 text-zinc-500 dark:text-zinc-400">
              <li>产业标签由人工筛选，可能有遗漏。重要方向如军工、基建、文化等因数据受限暂未纳入。</li>
              <li>变化判断为 AI 语义分析结果，可能因措辞解读偏差而产生误判。</li>
              <li>投资观察仅为政策变化的前置研究参考，不构成投资建议，不推荐具体股票或 ETF 产品。</li>
              <li>数据仅覆盖全国层面规划纲要，未包含各省规划、部委专项规划或具体实施方案。</li>
              <li>本文档版本：v2.7.0-mvp0，数据来源为 2021 年和 2026 年官方公开发布的规划纲要原文。ETF数据基于公开市场信息整理，投资优先级为AI分析结果，不构成投资建议。</li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
