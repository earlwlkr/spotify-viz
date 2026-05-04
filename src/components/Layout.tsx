"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./SignOutButton";

const NAV_ITEMS = [
  { href: "/projects/vibe-check", label: "Vibe" },
  { href: "/projects/mood-weather", label: "Mood" },
  { href: "/projects/audio-scatter", label: "Scatter" },
  { href: "/projects/listening-calendar", label: "Calendar" },
  { href: "/projects/genre-galaxy", label: "Genres" },
  { href: "/projects/sonic-signature", label: "Radar" },
  { href: "/projects/temporal-patterns", label: "Patterns" },
  { href: "/projects/hipster-score", label: "Hipster" },
  { href: "/projects/mood-journey", label: "Journey" },
  { href: "/projects/genre-evolution", label: "Evolution" },
  { href: "/projects/discovery-roulette", label: "Discover" },
  { href: "/projects/listening-efficiency", label: "Efficiency" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e5e5" }}>
      <header
        style={{
          borderBottom: "1px solid #1f1f1f",
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#e5e5e5",
          }}
        >
          Spotify Viz
        </Link>
        <nav style={{ display: "flex", gap: "1.25rem", fontSize: "0.85rem", alignItems: "center" }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  color: active ? "#1db954" : "#888",
                  fontWeight: active ? 600 : 400,
                  transition: "color 0.15s",
                }}
              >
                {item.label}
              </Link>
            );
          })}
          <SignOutButton />
        </nav>
      </header>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
        {children}
      </main>
    </div>
  );
}
