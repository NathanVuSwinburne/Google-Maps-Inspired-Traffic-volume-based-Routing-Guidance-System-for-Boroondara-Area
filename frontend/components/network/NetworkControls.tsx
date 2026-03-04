"use client";

import { useState } from "react";
import type { Site } from "@/types";

export type DisplayMode = "all-sites" | "site-detail" | "all-connections";

interface NetworkControlsProps {
  sites: Site[];
  mode: DisplayMode;
  selectedSiteId: number | null;
  onModeChange: (mode: DisplayMode) => void;
  onSiteSelect: (id: number | null) => void;
}

export default function NetworkControls({
  sites,
  mode,
  selectedSiteId,
  onModeChange,
  onSiteSelect,
}: NetworkControlsProps) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? sites.filter(
        (s) =>
          String(s.site_id).includes(search) ||
          s.connected_roads.some((r) =>
            r.toLowerCase().includes(search.toLowerCase())
          )
      )
    : sites;

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Display Mode
        </legend>
        <div className="space-y-1">
          {(
            [
              ["all-sites", "All Sites"],
              ["all-connections", "All Connections"],
              ["site-detail", "Site Detail"],
            ] as [DisplayMode, string][]
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="display-mode"
                value={value}
                checked={mode === value}
                onChange={() => onModeChange(value)}
                className="accent-blue-600"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {mode === "site-detail" && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Search Site
          </label>
          <input
            type="text"
            placeholder="ID or road name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <ul className="mt-1 max-h-48 overflow-y-auto border border-gray-200 rounded bg-white text-sm">
            {filtered.slice(0, 30).map((s) => (
              <li
                key={s.site_id}
                onClick={() => onSiteSelect(s.site_id)}
                className={`px-3 py-1.5 cursor-pointer hover:bg-blue-50 ${
                  selectedSiteId === s.site_id ? "bg-blue-100 font-medium" : ""
                }`}
              >
                {s.site_id} — {s.connected_roads[0] ?? ""}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-gray-400">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
