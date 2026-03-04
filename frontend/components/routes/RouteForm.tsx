"use client";

import { useState } from "react";
import type { RouteRequest } from "@/types";

const ALGORITHMS = ["A*", "DFS", "BFS", "GBFS", "UCS", "Fringe", "All"];
const MODELS = ["LSTM", "GRU", "Bi_LSTM"];
const MINUTES = [0, 15, 30, 45];

interface RouteFormProps {
  sites: { site_id: number; connected_roads: string[] }[];
  onSubmit: (req: RouteRequest) => void;
  isLoading: boolean;
}

function defaultDate() {
  return "2006-10-15";
}

export default function RouteForm({ sites, onSubmit, isLoading }: RouteFormProps) {
  const [originId, setOriginId] = useState<string>("");
  const [destId, setDestId] = useState<string>("");
  const [algorithms, setAlgorithms] = useState<string[]>(["A*"]);
  const [model, setModel] = useState("LSTM");
  const [date, setDate] = useState(defaultDate());
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function toggleAlgorithm(alg: string) {
    if (alg === "All") {
      setAlgorithms(["All"]);
      return;
    }
    setAlgorithms((prev) => {
      const without = prev.filter((a) => a !== "All");
      return without.includes(alg)
        ? without.filter((a) => a !== alg)
        : [...without, alg];
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const oid = parseInt(originId, 10);
    const did = parseInt(destId, 10);

    if (isNaN(oid) || isNaN(did)) {
      setError("Please select a valid origin and destination.");
      return;
    }
    if (oid === did) {
      setError("Origin and destination must be different.");
      return;
    }
    if (algorithms.length === 0) {
      setError("Select at least one algorithm.");
      return;
    }

    onSubmit({ origin_id: oid, destination_id: did, algorithms, model, date, hour, minute });
  }

  const siteOptions = sites.map((s) => (
    <option key={s.site_id} value={s.site_id}>
      {s.site_id} — {s.connected_roads[0] ?? ""}
    </option>
  ));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      {/* Origin */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
          Origin
        </label>
        <select
          value={originId}
          onChange={(e) => setOriginId(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select origin…</option>
          {siteOptions}
        </select>
      </div>

      {/* Destination */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
          Destination
        </label>
        <select
          value={destId}
          onChange={(e) => setDestId(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select destination…</option>
          {siteOptions}
        </select>
      </div>

      {/* Algorithms */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
          Algorithms
        </label>
        <div className="flex flex-wrap gap-2">
          {ALGORITHMS.map((alg) => (
            <button
              key={alg}
              type="button"
              onClick={() => toggleAlgorithm(alg)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                algorithms.includes(alg)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {alg}
            </button>
          ))}
        </div>
      </div>

      {/* Model */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
          Traffic Model
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
          Date (Oct–Nov 2006)
        </label>
        <input
          type="date"
          value={date}
          min="2006-10-01"
          max="2006-11-30"
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Time */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Hour
          </label>
          <select
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {String(i).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Minute
          </label>
          <select
            value={minute}
            onChange={(e) => setMinute(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MINUTES.map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Finding routes…" : "Find Routes"}
      </button>
    </form>
  );
}
