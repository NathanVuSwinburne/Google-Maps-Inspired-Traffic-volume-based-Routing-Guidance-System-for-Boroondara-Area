"use client";

import type { Connection } from "@/types";

interface ConnectionsTableProps {
  connections: Connection[];
  title?: string;
}

export default function ConnectionsTable({
  connections,
  title = "Connections",
}: ConnectionsTableProps) {
  if (connections.length === 0) {
    return <p className="text-gray-400 text-sm">No connections.</p>;
  }

  return (
    <div className="overflow-x-auto">
      {title && (
        <h3 className="text-sm font-semibold mb-2 text-gray-700">{title}</h3>
      )}
      <table className="min-w-full text-xs border border-gray-200 rounded">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-1 text-left text-gray-600 font-medium">From</th>
            <th className="px-2 py-1 text-left text-gray-600 font-medium">To</th>
            <th className="px-2 py-1 text-left text-gray-600 font-medium">Road</th>
            <th className="px-2 py-1 text-right text-gray-600 font-medium">Dist (km)</th>
          </tr>
        </thead>
        <tbody>
          {connections.map((c, i) => (
            <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-2 py-1">{c.from_id}</td>
              <td className="px-2 py-1">{c.to_id}</td>
              <td className="px-2 py-1">{c.shared_road}</td>
              <td className="px-2 py-1 text-right">{c.distance.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
