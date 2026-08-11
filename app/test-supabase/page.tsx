"use client";

import { createClient } from "@/lib/supabase/client";

export default function TestSupabase() {
  async function testConnection() {
    const supabase = createClient();

    const { data, error } = await supabase.auth.getSession();

    console.log("DATA:", data);
    console.log("ERROR:", error);

    alert("Check your browser console.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <button
        onClick={testConnection}
        className="bg-blue-600 text-white px-8 py-4 rounded-xl"
      >
        Test Supabase
      </button>
    </main>
  );
}