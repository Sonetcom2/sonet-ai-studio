import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type Props = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">

      {/* Sidebar */}

      <AdminSidebar />

      {/* Right Side */}

      <div className="flex flex-1 flex-col">

        <AdminNavbar />

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>

      </div>

    </div>
  );
}