import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white">
                <Zap size={15} strokeWidth={2.5} />
              </span>
              <span className="text-base font-bold text-white">
                Rivals<span className="text-red-500">Pulse</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm text-gray-500">
              Aggregate meta analytics for Marvel Rivals. Data reflects the current patch across all rank bands.
            </p>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Analytics</p>
              <ul className="space-y-2">
                <li><Link href="/meta" className="text-sm text-gray-400 hover:text-white transition-colors">Hero Meta</Link></li>
                <li><Link href="/recommendations" className="text-sm text-gray-400 hover:text-white transition-colors">Recommended Picks</Link></li>
                <li><Link href="/patches" className="text-sm text-gray-400 hover:text-white transition-colors">Patch History</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Project</p>
              <ul className="space-y-2">
                <li><span className="text-sm text-gray-600 cursor-default">About</span></li>
                <li><span className="text-sm text-gray-600 cursor-default">Changelog</span></li>
                <li><span className="text-sm text-gray-600 cursor-default">API Docs</span></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Data</p>
              <ul className="space-y-2">
                <li><span className="text-sm text-gray-600 cursor-default">Privacy Policy</span></li>
                <li><span className="text-sm text-gray-600 cursor-default">Data Sources</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-gray-800 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-600">
            © 2024 RivalsPulse. All aggregate data sourced from MarvelRivalsAPI.com. No individual player data is stored or displayed.
          </p>
          <p className="text-xs text-gray-700">
            Marvel Rivals is a trademark of NetEase Games. RivalsPulse is an unofficial fan project.
          </p>
        </div>
      </div>
    </footer>
  );
}
