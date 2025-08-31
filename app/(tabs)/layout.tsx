"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, BookOpen, Plus, User } from "lucide-react";

const tabs = [
  { href: "/recipes", label: "Recettes", Icon: ChefHat },
  { href: "/library", label: "Mon Livre", Icon: BookOpen },
  { href: "/add", label: "Ajouter", Icon: Plus },
  { href: "/profile", label: "Profil", Icon: User },
];

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <ul className="mx-auto flex max-w-5xl items-center gap-2 p-3">
          {tabs.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                    active
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100",
                  ].join(" ")}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}
