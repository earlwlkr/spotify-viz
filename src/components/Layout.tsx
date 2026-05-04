"use client";

import Link from "next/link";
import SignOutButton from "./SignOutButton";

export default function Layout({ children }: { children: React.ReactNode }) {
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
        <nav style={{ display: "flex", gap: "1.5rem", fontSize: "0.9rem", alignItems: "center" }}>
          <Link href="/projects/vibe-check" style={{ color: "#888" }}>
            Vibe
          </Link>
          <Link href="/projects/mood-weather" style={{ color: "#888" }}>
            Mood
          </Link>
          <Link href="/projects/audio-scatter" style={{ color: "#888" }}>
            Scatter
          </Link>
          <Link href="/projects/listening-calendar" style={{ color: "#888" }}>
            Calendar
          </Link>
          <Link href="/projects/genre-galaxy" style={{ color: "#888" }}>
            Genres
          </Link>
          <SignOutButton />
        </nav>
      </header>
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
        {children}
      </main>
    </div>
  );
}
