"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Competitor = {
  id: string;
  name: string;
  baseUrl: string;
};

export default function ConfigurePage() {
  const [items, setItems] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/competitors");
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  async function save() {
    setLoading(true);
    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(items),
      });
      if (!res.ok) throw new Error("save failed");
      // show success briefly and refresh list from server
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      try {
        const r2 = await fetch('/api/competitors');
        if (r2.ok) setItems(await r2.json());
      } catch (e) {
        // ignore
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save competitors");
    } finally {
      setLoading(false);
    }
  }

  function add() {
    if (!newName || !newUrl) return;
    setItems((s) => [...s, { id: `comp-${Date.now()}`, name: newName, baseUrl: newUrl }]);
    setNewName("");
    setNewUrl("");
  }

  function remove(id: string) {
    setItems((s) => s.filter((it) => it.id !== id));
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg border">
          <div className="mb-2">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
          <div className="mb-4">
            <h1 className="text-xl font-semibold mb-0 text-slate-500">Configure Brands</h1>
          </div>
        <p className="text-sm text-slate-600 mb-4">Add brand base URLs here. Scraper backend will be wired later.</p>

        <div className="grid grid-cols-1 gap-3 mb-4">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-4 border rounded px-3 py-2">
              <div>
                <div className="font-medium">{it.name}</div>
                <div className="text-xs text-slate-500">{it.baseUrl}</div>
              </div>
              <div>
                <button className="text-sm text-rose-600" onClick={() => remove(it.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="Competitor name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
            aria-label="Competitor name"
          />
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="Base URL (e.g. https://competitor.com/product/)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
            aria-label="Base URL"
          />
          <button
            className={`px-3 py-2 rounded ${newName && newUrl ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
            onClick={add}
            disabled={!newName || !newUrl}
          >
            Add
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <button
            className={`px-3 py-2 rounded ${items.length ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            onClick={save}
            disabled={loading || items.length === 0}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <span className="text-sm text-slate-500">{items.length} competitors configured</span>
          {saved && <span className="ml-3 text-sm text-emerald-600">Saved</span>}
        </div>
      </div>
    </div>
  );
}
