"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e5e5" }}>
      <header
        style={{
          borderBottom: "1px solid #1f1f1f",
          padding: isMobile ? "0.75rem 1rem" : "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
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

        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              color: "#e5e5e5",
              fontSize: "1.25rem",
              cursor: "pointer",
              padding: "0.25rem 0.5rem",
              lineHeight: 1,
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? "\u2715" : "\u2630"}
          </button>
        )}

        <nav
          style={{
            display: isMobile ? (menuOpen ? "flex" : "none") : "flex",
            gap: isMobile ? "0.75rem" : "1.25rem",
            fontSize: "0.85rem",
            alignItems: isMobile ? "flex-start" : "center",
            flexDirection: isMobile ? "column" : "row",
            width: isMobile ? "100%" : "auto",
            paddingTop: isMobile ? "0.5rem" : 0,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setMenuOpen(false)}
              style={{
                color: "#888",
                transition: "color 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </Link>
          ))}
          <SignOutButton />
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
