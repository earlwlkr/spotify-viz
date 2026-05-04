"use client";

import { useEffect, useState } from "react";

export default function SignOutButton() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsAuthed(document.cookie.includes("spotify_access_token"));
  }, []);

  if (!isAuthed) return null;

  return (
    <a
      href="/api/auth/signout"
      style={{
        fontSize: "0.85rem",
        color: "#888",
        textDecoration: "none",
        transition: "color 0.2s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "#e5e5e5"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "#888"; }}
    >
      Sign out
    </a>
  );
}
