"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/network", label: "Network Map" },
  { href: "/routes", label: "Route Finder" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="px-5 py-6 border-b border-gray-700">
        <h1 className="text-sm font-bold tracking-wide uppercase text-gray-300">
          TBRGS
        </h1>
        <p className="text-xs text-gray-500 mt-1">Boroondara Route Guidance</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${
              pathname.startsWith(item.href)
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
