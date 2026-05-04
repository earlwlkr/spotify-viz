"use client";

import Link from "next/link";

interface ProjectCardProps {
  href: string;
  name: string;
  desc: string;
  disabled: boolean;
}

export default function ProjectCard({ href, name, desc, disabled }: ProjectCardProps) {
  return (
    <Link
      href={href}
      className="project-card"
      style={{
        display: "block",
        padding: "1.5rem",
        borderRadius: 12,
        background: "#141414",
        border: "1px solid #1f1f1f",
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? "none" : "auto",
        transition: "border-color 0.2s, transform 0.15s",
        textDecoration: "none",
        color: "inherit",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#333";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#1f1f1f";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <h3 style={{ marginBottom: "0.4rem", fontWeight: 600 }}>{name}</h3>
      <p style={{ color: "#888", fontSize: "0.85rem", lineHeight: 1.5 }}>{desc}</p>
    </Link>
  );
}
