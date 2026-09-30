import type { Role } from "@/lib/types/hero";

const ROLE_STYLES: Record<Role, string> = {
  Vanguard: "bg-blue-950/60 text-blue-400 border border-blue-800/50",
  Duelist: "bg-red-950/60 text-red-400 border border-red-800/50",
  Strategist: "bg-green-950/60 text-green-400 border border-green-800/50",
};

interface RoleBadgeProps {
  role: Role;
  size?: "sm" | "md";
}

export function RoleBadge({ role, size = "sm" }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      } ${ROLE_STYLES[role]}`}
    >
      {role}
    </span>
  );
}
