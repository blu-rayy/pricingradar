"use client";

import React, { useMemo, useState } from "react";

type Competitor = {
  id: string;
  name: string;
  mappings: { sku: string }[];
};

type ProductPoint = { sku: string; price: number; discount?: number };

type Snapshot = {
  timestamp: string;
  data: { competitorId: string; products: ProductPoint[] }[];
};

export default function WarRoomClient({ comps, snapshots }: { comps: Competitor[]; snapshots: Snapshot[] }) {
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const [appliedPrices, setAppliedPrices] = useState<Record<string, number>>({});
  const [drawerSku, setDrawerSku] = useState<string | null>(null);

  const latest = snapshots[snapshots.length - 1];

  const skus = useMemo(() => Array.from(new Set(comps.flatMap((c: any) => c.mappings.map((m: any) => m.sku)))), [comps]);

  const marketAvgMap: Record<string, number[]> = {};
  for (const sku of skus) {
    marketAvgMap[sku] = snapshots.map((s) => {
      const prices: number[] = [];
      for (const compData of s.data) {
        const p = compData.products.find((pr) => pr.sku === sku);
        if (p) prices.push(p.price);
      }
      return prices.length ? Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100 : 0;
    });
  }

  // Our base prices (simulated): a small premium over market average unless overridden via Apply
  const baseOurPrices: Record<string, number> = {};
  for (const sku of skus) {
    const arr = marketAvgMap[sku];
    const last = arr[arr.length - 1] || 0;
    baseOurPrices[sku] = Math.round((last * 1.035 + 0.001) * 100) / 100;
  }

  const ourPrices = { ...baseOurPrices, ...appliedPrices };

  // Alerts detection
  const alerts: { id: string; text: string; compId: string; sku: string; oldPrice?: number; newPrice?: number; suggested?: number }[] = [];
  if (latest) {
    const prev = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null;
    for (const compData of latest.data) {
      for (const p of compData.products) {
        const avg = marketAvgMap[p.sku][marketAvgMap[p.sku].length - 1] || p.price;
        if (avg && p.price / avg <= 0.92) {
          const id = `${compData.competitorId}-${p.sku}-cheap`;
          alerts.push({ id, text: `${compData.competitorId} is cheaper for ${p.sku} ($${p.price}) vs market avg $${avg}`, compId: compData.competitorId, sku: p.sku, newPrice: p.price, suggested: Math.round((p.price * 1.04) * 100) / 100 });
        }
        if (prev) {
          const prevComp = prev.data.find((d) => d.competitorId === compData.competitorId);
          const prevProd = prevComp?.products.find((pp) => pp.sku === p.sku);
          if (prevProd) {
            const change = ((p.price - prevProd.price) / prevProd.price) * 100;
            if (change <= -10) {
              const id = `${compData.competitorId}-${p.sku}-drop`;
              alerts.push({ id, text: `${compData.competitorId} ${p.sku} dropped ${Math.round(-change)}% to $${p.price}`, compId: compData.competitorId, sku: p.sku, oldPrice: prevProd.price, newPrice: p.price, suggested: Math.round((p.price * 1.06) * 100) / 100 });
            }
          }
        }
      }
    }
  }

  const activeAlerts = alerts.filter((a) => !dismissed[a.id]);

  // KPIs
  const marketPositionPercent = (() => {
    const diffs: number[] = [];
    for (const sku of skus) {
      const avg = marketAvgMap[sku][marketAvgMap[sku].length - 1] || 0;
      const our = ourPrices[sku] || 0;
      if (avg) diffs.push(((our - avg) / avg) * 100);
    }
    const mean = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0;
    return Math.round(mean * 10) / 10; // one decimal
  })();

  const dataFreshness = (() => {
    if (!latest?.timestamp) return "unknown";
    const mins = Math.round((Date.now() - new Date(latest.timestamp).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.round(mins / 60);
    return `${hrs} hrs ago`;
  })();

  function applyPrice(sku: string, price: number) {
    setAppliedPrices((p) => ({ ...p, [sku]: price }));
  }

  function dismissAlert(id: string) {
    setDismissed((d) => ({ ...d, [id]: true }));
  }

  function renderSparklineFrom(arr: number[]) {
    const w = 240, h = 48;
    if (!arr || arr.length === 0) return null;
    const min = Math.min(...arr), max = Math.max(...arr), range = max - min || 1;
    const step = w / Math.max(1, arr.length - 1);
    const pts = arr.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(" ");
    return (<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}><polyline fill="none" stroke="#0ea5e9" strokeWidth={2} points={pts} /></svg>);
  }

  return (
    <div>
      {/* KPI Ticker */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 rounded-md p-4 bg-orange-50 border border-orange-200">
          <div className="text-sm text-orange-700">Market Position</div>
          <div className="text-xl font-semibold">{marketPositionPercent >= 0 ? `+${marketPositionPercent}%` : `${marketPositionPercent}%`} <span className="text-sm text-orange-600">vs market avg</span></div>
        </div>
        <div className="rounded-md p-4 bg-red-50 border border-red-200">
          <div className="text-sm text-red-700">Active Alerts</div>
          <div className="text-xl font-semibold">{activeAlerts.length} Critical Price Drops</div>
        </div>
        <div className="rounded-md p-4 bg-zinc-50 border border-zinc-200">
          <div className="text-sm text-zinc-600">Data Freshness</div>
          <div className="text-xl font-semibold">Last Scrape: {dataFreshness}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Action Feed (priority) */}
        <div className="col-span-1 bg-white border rounded-md p-4">
          <h3 className="font-semibold mb-3">Action Feed</h3>
          <div className="space-y-3">
            {activeAlerts.length === 0 && <div className="text-sm text-zinc-500">No active actions</div>}
            {activeAlerts.map((a) => (
              <div key={a.id} className="border rounded p-3 bg-zinc-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm">📉 <strong>{a.compId}</strong> Alert</div>
                    <div className="mt-1 font-medium">{a.text}</div>
                    <div className="text-sm text-zinc-600 mt-1">Our Price: ${ourPrices[a.sku]?.toFixed(2)}</div>
                    <div className="text-sm text-zinc-700 mt-2">AI Suggestion: "Drop to ${a.suggested?.toFixed(2)} to stay within 5% variance."</div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <button className="px-3 py-1 rounded bg-emerald-600 text-white text-sm" onClick={() => applyPrice(a.sku, a.suggested ?? ourPrices[a.sku])}>Apply Price Change</button>
                    <button className="px-3 py-1 rounded border text-sm" onClick={() => dismissAlert(a.id)}>Dismiss</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Battleground Table */}
        <div className="col-span-2 bg-white border rounded-md p-4">
          <h3 className="font-semibold mb-3">Battleground</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-zinc-600">
                  <th>Product</th>
                  <th>GoRocky</th>
                  {comps.map((c: any) => <th key={c.id}>{c.name}</th>)}
                  <th>Variance</th>
                </tr>
              </thead>
              <tbody>
                {skus.map((sku) => {
                  const trend = marketAvgMap[sku];
                  const marketAvg = trend[trend.length - 1] || 0;
                  const our = ourPrices[sku] || 0;
                  return (
                    <tr key={sku} className="border-t">
                      <td className="py-3 font-medium">{sku}</td>
                      <td className="py-3">${our.toFixed(2)}</td>
                      {comps.map((c: any) => {
                        const compLatest = latest?.data.find((d) => d.competitorId === c.id);
                        const prod = compLatest?.products.find((p) => p.sku === sku);
                        const price = prod?.price ?? null;
                        const cheaper = price !== null && price < our;
                        const expensive = price !== null && price > our;
                        return (
                          <td key={c.id} className={`py-3 ${cheaper ? "bg-red-50 text-red-700" : expensive ? "bg-emerald-50 text-emerald-700" : ""}`}>
                            {price ? `$${price}` : "-"}
                          </td>
                        );
                      })}
                      <td className="py-3">
                        <div className={`inline-block px-3 py-1 rounded-full text-sm ${our - marketAvg < 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {marketAvg ? `${Math.round(((our - marketAvg) / marketAvg) * 100)}%` : "-"}
                        </div>
                        <button className="ml-3 text-sm text-zinc-500" onClick={() => setDrawerSku(sku)}>Deep Dive</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Drawer / Modal for Deep Dive */}
      {drawerSku && (
        <div className="fixed inset-0 bg-black/40 flex items-stretch z-40">
          <div className="ml-auto w-[720px] bg-white h-full overflow-auto p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Deep Dive — {drawerSku}</h3>
              <button className="text-sm text-zinc-600" onClick={() => setDrawerSku(null)}>Close</button>
            </div>
            <div className="mt-4">
              <div className="text-sm text-zinc-600">30-day Price Chart</div>
              <div className="mt-2">
                {/* Chart: our (blue), market avg (grey), aggressive competitor (red) */}
                <div className="p-2 bg-zinc-50 rounded">
                  {renderSparklineFrom(marketAvgMap[drawerSku].map((v) => v || 0))}
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium">History Log</h4>
                <ul className="mt-2 list-disc pl-6 text-sm text-zinc-700">
                  {snapshots.slice().reverse().map((s) => {
                    const compEntries = s.data.map(d => `${d.competitorId}: ${d.products.find(p=>p.sku===drawerSku)?.price ?? '-'} `).join(' | ');
                    return <li key={s.timestamp}>{new Date(s.timestamp).toLocaleString()} — {`Market Avg: ${marketAvgMap[drawerSku][snapshots.indexOf(s)] ?? '-'} — ${compEntries}`}</li>;
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
