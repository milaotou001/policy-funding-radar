import fs from "fs";
import https from "https";

const DATA_PATH = "data/industries.json";

// All unique ETF codes from industries.json
const ETF_CODES = [
  "159378", "159611", "159647", "159667", "159755", "159819", "159825",
  "159837", "159852", "159883", "159995",
  "512290", "512660", "513050", "515030", "515050", "515880", "516000",
  "516160", "516520", "516780", "516830", "516890",
  "560060", "560800", "561170", "562500",
];

function isSZ(code: string): boolean {
  return code.startsWith("159") || code.startsWith("560") || code.startsWith("561") || code.startsWith("562") || code.startsWith("563");
}

function tencentSymbol(code: string): string {
  return isSZ(code) ? `sz${code}` : `sh${code}`;
}

function fetch(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Referer: "https://finance.qq.com" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function parseTencentKline(raw: string): { date: string; close: number }[] {
  try {
    const json = JSON.parse(raw);
    const symbol = Object.keys(json.data)[0];
    const days = json.data[symbol]?.day || json.data[symbol]?.qfqday || [];
    return days.map((d: string[]) => ({
      date: d[0],
      close: parseFloat(d[2]),
    }));
  } catch {
    return [];
  }
}

function calcReturn(kline: { date: string; close: number }[], daysBack: number): number | null {
  if (kline.length < daysBack + 1) return null;
  const latest = kline[kline.length - 1].close;
  const target = kline[kline.length - 1 - daysBack];
  if (!target || target.close <= 0) return null;
  return ((latest - target.close) / target.close) * 100;
}

// Find the trading day N days back (approximate)
function findIndexNDaysBack(kline: { date: string }[], targetDaysBack: number): number {
  if (kline.length === 0) return -1;
  const lastDate = new Date(kline[kline.length - 1].date);
  const targetDate = new Date(lastDate);
  targetDate.setDate(targetDate.getDate() - targetDaysBack);
  const targetStr = targetDate.toISOString().slice(0, 10);

  // Find closest trading day on or before target
  let bestIdx = -1;
  for (let i = kline.length - 1; i >= 0; i--) {
    if (kline[i].date <= targetStr) {
      bestIdx = i;
      break;
    }
  }
  if (bestIdx === -1) return -1;
  return kline.length - 1 - bestIdx;
}

async function fetchETFData(code: string): Promise<{
  price: number;
  prevClose: number;
  returns: { d5: number | null; m1: number | null; m3: number | null; m6: number | null; y1: number | null };
  volume: number;
}> {
  const sym = tencentSymbol(code);
  const url = `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${sym},day,,,300,qfq`;
  const raw = await fetch(url);
  const kline = parseTencentKline(raw);

  if (kline.length === 0) {
    console.error(`  ${code}: no K-line data`);
    return { price: 0, prevClose: 0, returns: { d5: null, m1: null, m3: null, m6: null, y1: null }, volume: 0 };
  }

  const latest = kline[kline.length - 1];
  const price = latest.close;

  // Also get prevClose from the second-to-last day
  const prevClose = kline.length >= 2 ? kline[kline.length - 2].close : price;

  // Find index offsets for different periods
  const d5Idx = findIndexNDaysBack(kline, 7);   // ~5 trading days
  const m1Idx = findIndexNDaysBack(kline, 35);  // ~22 trading days
  const m3Idx = findIndexNDaysBack(kline, 95);  // ~66 trading days
  const m6Idx = findIndexNDaysBack(kline, 190); // ~132 trading days
  const y1Idx = findIndexNDaysBack(kline, 370); // ~252 trading days

  const calcRet = (idx: number): number | null => {
    if (idx <= 0) return null;
    const past = kline[kline.length - 1 - idx];
    if (!past || past.close <= 0) return null;
    return ((price - past.close) / past.close) * 100;
  };

  // Try to get volume from the K-line data
  let volume = 0;
  try {
    const json = JSON.parse(raw);
    const symbol = Object.keys(json.data)[0];
    const days = json.data[symbol]?.day || json.data[symbol]?.qfqday || [];
    const lastDay = days[days.length - 1];
    volume = parseInt(lastDay[5] || "0");
  } catch { /* ignore */ }

  return {
    price,
    prevClose,
    returns: {
      d5: calcRet(d5Idx),
      m1: calcRet(m1Idx),
      m3: calcRet(m3Idx),
      m6: calcRet(m6Idx),
      y1: calcRet(y1Idx),
    },
    volume,
  };
}

function assessVolumeTrend(volume: number, avgVolume: number): string {
  if (avgVolume === 0) return "持平";
  const ratio = volume / avgVolume;
  if (ratio > 1.5) return "放量";
  if (ratio > 1.1) return "温和放量";
  if (ratio < 0.7) return "缩量";
  return "持平";
}

function assessSignal(returns: { d5: number | null; m1: number | null; m3: number | null; m6: number | null; y1: number | null }): { signal: string; label: string } {
  const hasData = returns.m1 != null && returns.m3 != null && returns.m6 != null && returns.y1 != null;
  if (!hasData) return { signal: "数据不足", label: "数据不足，无法判定" };

  const m1 = returns.m1!;
  const m3 = returns.m3!;
  const m6 = returns.m6!;
  const y1 = returns.y1!;

  const positiveCount = [m1, m3, m6, y1].filter((r) => r > 0).length;
  const negativeCount = [m1, m3, m6, y1].filter((r) => r < 0).length;

  if (positiveCount >= 3 && y1 > 5 && m6 > 0) {
    return { signal: "双重验证", label: `全周期偏强：1年${y1 > 0 ? "+" : ""}${y1.toFixed(0)}%/6月${m6 > 0 ? "+" : ""}${m6.toFixed(0)}%/3月${m3 > 0 ? "+" : ""}${m3.toFixed(0)}%，政策与市场共振` };
  }
  if (positiveCount >= 2 && (m3 > 0 || m6 > 0)) {
    return { signal: "温和确认", label: `中期偏正面：6月${m6 > 0 ? "+" : ""}${m6.toFixed(0)}%/3月${m3 > 0 ? "+" : ""}${m3.toFixed(0)}%，但短期或有波动` };
  }
  if (positiveCount >= 2 && negativeCount >= 2) {
    return { signal: "市场分歧", label: `多空交织：短期资金与中长期趋势方向不一致，需继续观察` };
  }
  return { signal: "暂不确认", label: `信号不足：多周期数据偏弱，等待更多确认信号` };
}

async function main() {
  console.log("读取 industries.json...");
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

  console.log(`\n正在获取 ${ETF_CODES.length} 只 ETF 数据...\n`);

  const etfData: Record<string, Awaited<ReturnType<typeof fetchETFData>>> = {};
  for (let i = 0; i < ETF_CODES.length; i++) {
    const code = ETF_CODES[i];
    process.stdout.write(`  [${i + 1}/${ETF_CODES.length}] ${code}... `);
    try {
      etfData[code] = await fetchETFData(code);
      if (etfData[code].price > 0) {
        const r = etfData[code].returns;
        console.log(`¥${etfData[code].price.toFixed(3)} | 1M:${r.m1?.toFixed(1) ?? "?"}% 3M:${r.m3?.toFixed(1) ?? "?"}% 6M:${r.m6?.toFixed(1) ?? "?"}% 1Y:${r.y1?.toFixed(1) ?? "?"}%`);
      } else {
        console.log("无数据");
      }
    } catch (e: any) {
      console.log(`失败: ${e.message}`);
      etfData[code] = { price: 0, prevClose: 0, returns: { d5: null, m1: null, m3: null, m6: null, y1: null }, volume: 0 };
    }
    // Small delay to avoid rate limiting
    if (i % 5 === 4) await new Promise((r) => setTimeout(r, 500));
  }

  console.log("\n更新 industries.json...");
  let updatedCount = 0;

  for (const industry of data.industries) {
    const ms = industry.market_signal;
    if (!ms) continue;
    const code = ms.etf_code;
    if (!code || code === "-") continue;

    const etf = etfData[code];
    if (!etf || etf.price <= 0) continue;

    const r = etf.returns;
    const newSignal = assessSignal(r);

    // Update quantitative fields
    ms.price = etf.price;
    ms.return_5d_pct = r.d5 != null ? parseFloat(r.d5.toFixed(1)) : ms.return_5d_pct;
    ms.return_1m_pct = r.m1 != null ? parseFloat(r.m1.toFixed(1)) : ms.return_1m_pct;
    ms.return_3m_pct = r.m3 != null ? parseFloat(r.m3.toFixed(1)) : ms.return_3m_pct;
    ms.return_6m_pct = r.m6 != null ? parseFloat(r.m6.toFixed(1)) : ms.return_6m_pct;
    ms.return_1y_pct = r.y1 != null ? parseFloat(r.y1.toFixed(1)) : ms.return_1y_pct;
    ms.signal = newSignal.signal;
    ms.signal_label = newSignal.label;
    ms.updated = "2026-06-03";
    updatedCount++;
  }

  // Write back
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
  console.log(`\n完成！已更新 ${updatedCount} 条 market_signal 记录。`);
}

main().catch(console.error);
