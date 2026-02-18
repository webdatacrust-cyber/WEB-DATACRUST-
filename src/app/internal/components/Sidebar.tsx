"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

type NavItem = {
  name: string;
  href: string;
  requiredRole?: Session["user"]["role"];
};

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/internal/dashboard" },
  { name: "Projects", href: "/internal/projects" },
  { name: "Tasks", href: "/internal/tasks" },
  { name: "Activity", href: "/internal/activity", requiredRole: "ADMIN" },
  { name: "Clients", href: "/internal/clients" },
  { name: "Contacts", href: "/internal/contacts", requiredRole: "ADMIN" },
  { name: "Content", href: "/internal/content", requiredRole: "ADMIN" },
  { name: "Services", href: "/internal/services", requiredRole: "ADMIN" },
  { name: "SEO", href: "/internal/seo", requiredRole: "ADMIN" },
  { name: "Users", href: "/internal/users", requiredRole: "ADMIN" },
  { name: "Settings", href: "/internal/settings" },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const role = session?.user?.role;
  const visibleItems = navItems.filter(
    (item) => !item.requiredRole || item.requiredRole === role,
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-white shadow-sm transition-transform duration-200 lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Startup platform
            </p>
            <p className="text-lg font-semibold text-gray-900">Control Center</p>
          </div>
          <button
            type="button"
            className="rounded-md border px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            Close
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 pb-6">
          <p className="px-3 text-xs uppercase tracking-wide text-gray-400">
            Navigation
          </p>
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
                onClick={onClose}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {role ? (
          <div className="border-t px-4 py-4 text-sm text-gray-500">
            Signed in as
            <span className="ml-1 font-semibold text-gray-900">{role}</span>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
