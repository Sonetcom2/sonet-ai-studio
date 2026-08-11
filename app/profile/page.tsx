"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Toast from "@/components/Toast";

type Profile = {
  full_name: string;
  email: string;
  avatar_url: string;
  bio: string;
  credits: number;
  plan: string;
  images: number;
  storage: string;
  created_at: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    email: "",
    avatar_url: "",
    bio: "",
    credits: 0,
    plan: "FREE",
    images: 0,
    storage: "0 MB",
    created_at: "",
  });

  const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [uploading, setUploading] =
  useState(false);

  const [toast, setToast] = useState("");

  const [toastType, setToastType] = useState<
    "success" | "error" | "info"
  >("info");

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);
  // ==============================
// Load Profile
// ==============================

useEffect(() => {
  async function loadProfile() {
    try {
      const response = await fetch("/api/profile");

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setProfile(data.profile);

    } catch (error: any) {
      console.error(error);

      setToastType("error");

      setToast(
        error.message || "Failed to load profile."
      );

    } finally {
      setLoading(false);
    }
  }

  loadProfile();

}, []);
 if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black flex items-center justify-center text-white">

      <div className="text-center">

        <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

        <h2 className="text-3xl font-bold mt-8">

          Loading Profile...

        </h2>

      </div>

    </main>
  );
}// ==============================
// Save Profile
// ==============================

async function saveProfile() {
  try {
    setSaving(true);

    const response = await fetch(
      "/api/profile/update",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          full_name: profile.full_name,
          bio: profile.bio,
        }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    setToastType("success");

    setToast("Profile updated successfully!");

  } catch (error: any) {
    console.error(error);

    setToastType("error");

    setToast(
      error.message || "Failed to update profile."
    );

  } finally {
    setSaving(false);
  }
}
// ==============================
// Upload Avatar
// ==============================

async function uploadAvatar(
  file: File
) {
  try {
    setUploading(true);

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      "/api/profile/avatar",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    setProfile((prev) => ({
      ...prev,
      avatar_url: data.avatar,
    }));

    setToastType("success");

    setToast(
      "Profile picture updated!"
    );

  } catch (error: any) {
    console.error(error);

    setToastType("error");

    setToast(
      error.message ||
        "Upload failed."
    );

  } finally {
    setUploading(false);
  }
}  
return (

  
    <>
      {toast && (
        <Toast
          message={toast}
          type={toastType}
        />
      )}

      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-white px-8 py-10">

        <div className="max-w-6xl mx-auto">

          <h1 className="text-5xl font-black mb-10">

            👤 Profile Settings

          </h1>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* LEFT */}

            <div className="rounded-3xl bg-slate-900 border border-slate-700 p-8">

              <div className="flex flex-col items-center">

                {profile.avatar_url ? (

                  <Image
                    src={profile.avatar_url}
                    alt="Avatar"
                    width={160}
                    height={160}
                    className="rounded-full object-cover"
                  />

                ) : (

                  <div className="w-40 h-40 rounded-full bg-slate-800 flex items-center justify-center text-6xl">

                    👤

                  </div>

                )}

                <label
                  className={`mt-6 inline-block px-6 py-3 rounded-xl font-semibold cursor-pointer transition ${
                    uploading
                      ? "bg-slate-700 cursor-not-allowed"
                      : "bg-cyan-600 hover:bg-cyan-700"
                  }`}>

                  {uploading ? "Uploading..." : "📷 Upload Photo"}

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      console.log("FILE INPUT TRIGGERED");

                      const file = e.target.files?.[0];

                      console.log(file);

                      if (file) {
                        uploadAvatar(file);
                      }
                    }}
                  />
                </label>
              </div>

            </div>

            {/* RIGHT */}

            <div className="lg:col-span-2 space-y-8">

              {/* Account */}

              <div className="rounded-3xl bg-slate-900 border border-slate-700 p-8">

                <h2 className="text-2xl font-bold mb-6">

                  Account Information

                </h2>

                <div className="space-y-6">

                  <div>

                    <label className="text-gray-400">

                      Full Name

                    </label>

                    <input
                      value={profile.full_name}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          full_name: e.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-cyan-500"
                    />

                  </div>

                  <div>

                    <label className="text-gray-400">

                      Email

                    </label>

                    <input
                      value={profile.email}
                      disabled
                      className="mt-2 w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 opacity-70"
                    />

                  </div>

                  <div>

                    <label className="text-gray-400">

                      Bio

                    </label>

                    <textarea
                      value={profile.bio}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          bio: e.target.value,
                        })
                      }
                      rows={4}
                      className="mt-2 w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-cyan-500"
                    />

                  </div>

                </div>

              </div>

              {/* Statistics */}

              <div className="rounded-3xl bg-slate-900 border border-slate-700 p-8">

                <h2 className="text-2xl font-bold mb-6">

                  📊 Account Statistics

                </h2>

                <div className="grid grid-cols-2 gap-6">

                  <div>
                    <p className="text-gray-400">Credits</p>
                    <h3 className="text-3xl font-bold">
                      {profile.credits}
                    </h3>
                  </div>

                  <div>
                    <p className="text-gray-400">Plan</p>
                    <h3 className="text-3xl font-bold">
                      {profile.plan}
                    </h3>
                  </div>

                  <div>
                    <p className="text-gray-400">Images</p>
                    <h3 className="text-3xl font-bold">
                      {profile.images}
                    </h3>
                  </div>

                  <div>
                    <p className="text-gray-400">Storage</p>
                    <h3 className="text-3xl font-bold">
                      {profile.storage}
                    </h3>
                  </div>

                </div>

              </div>

              <button
  onClick={saveProfile}
  disabled={saving}
  className={`w-full py-4 rounded-2xl text-xl font-bold transition ${
    saving
      ? "bg-slate-700 cursor-not-allowed"
      : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.02]"
  }`}
>

  {saving ? "Saving..." : "💾 Save Changes"}

</button>

            </div>

          </div>

        </div>

      </main>

    </>
  );
}