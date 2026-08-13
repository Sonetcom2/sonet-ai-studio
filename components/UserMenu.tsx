"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface Props {
  user: User;
}

const frameStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  whiteSpace: "nowrap",
  padding: "10px 14px",
  border: "2px solid #475569",
  borderRadius: "12px",
  background: "#0f172a",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
  transition: "transform 150ms ease, border-color 150ms ease",
};

export default function UserMenu({ user }: Props) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const username =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "nowrap",
      }}
    >
      <Link
        href="/"
        style={frameStyle}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        🏠 Home
      </Link>

      <Link href="/dashboard" style={frameStyle}>
        📊 Dashboard
      </Link>

      <Link href="/ai-image" style={frameStyle}>
        🎨 AI Image
      </Link>

      <Link href="/ai-video" style={frameStyle}>
        🎬 AI Video
      </Link>

      <Link href="/my-images" style={frameStyle}>
        🖼️ My Images
      </Link>

      <Link href="/my-videos" style={frameStyle}>
        🎥 My Videos
      </Link>

      <Link href="/prompt-library" style={frameStyle}>
        📚 Prompt Library
      </Link>

      <Link href="/pricing" style={frameStyle}>
        💳 Pricing
      </Link>

      <Link href="/about" style={frameStyle}>
        ℹ️ About
      </Link>

      <Link href="/contact" style={frameStyle}>
        📩 Contact
      </Link>

      <Link
        href="/pricing"
        style={{
          ...frameStyle,
          border: "2px solid #06b6d4",
          color: "#67e8f9",
          background: "rgba(6,182,212,0.12)",
        }}
      >
        💎 Credits
      </Link>

      <span
        style={{
          ...frameStyle,
          border: "2px solid #a855f7",
          color: "#d8b4fe",
          background: "rgba(168,85,247,0.12)",
        }}
      >
        👤 {username}
      </span>

      <button
        type="button"
        onClick={handleLogout}
        style={{
          ...frameStyle,
          border: "2px solid #ef4444",
          color: "#fca5a5",
          background: "rgba(239,68,68,0.12)",
          cursor: "pointer",
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
}