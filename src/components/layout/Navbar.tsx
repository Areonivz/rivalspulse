"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/meta", label: "Meta" },
  { href: "/recommendations", label: "Picks" },
  { href: "/patches", label: "Patches" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-lg shadow-red-900/40 group-hover:bg-red-500 transition-colors">
            <Zap size={18} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            Rivals<span className="text-red-500">Pulse</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Patch badge */}
        <div className="hidden md:flex items-center gap-3">
          <span className="rounded-full bg-red-950/70 px-3 py-1 text-xs font-semibold text-red-400 border border-red-900/50">
            Patch 1.5
          </span>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 pb-4 pt-2">
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <div className="mt-3 pt-3 border-t border-gray-800">
            <span className="rounded-full bg-red-950/70 px-3 py-1 text-xs font-semibold text-red-400 border border-red-900/50">
              Patch 1.5
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
