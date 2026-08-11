"use client";

import SuspendUserModal from "./SuspendUserModal";
import { useState } from "react";
import UserModal from "./UserModal";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";

type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  plan: string;
  credits: number;
  lastLogin: string | null;
  createdAt: string;
};

type Props = {
  users: User[];
};

export default function UserTable({ users }: Props) {

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
const [openModal, setOpenModal] = useState(false);

const [editUser, setEditUser] = useState<User | null>(null);
const [editOpen, setEditOpen] = useState(false);

const [suspendUser, setSuspendUser] = useState<User | null>(null);
const [suspendOpen, setSuspendOpen] = useState(false);
const [suspendLoading, setSuspendLoading] = useState(false);
const [deleteUser, setDeleteUser] = useState<User | null>(null);
const [deleteOpen, setDeleteOpen] = useState(false);
const [deleteLoading, setDeleteLoading] = useState(false);
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 p-6">

        <div>
          <h2 className="text-2xl font-bold text-white">
            Registered Users
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Manage all users on SONET AI STUDIO
          </p>
        </div>

        <button className="rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white transition hover:bg-cyan-700">
          + New User
        </button>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-800">

            <tr className="text-left text-slate-300">

              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Credits</th>
              <th className="px-6 py-4">Last Login</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-center">Actions</th>

            </tr>

          </thead>

          <tbody>

            {users.length === 0 ? (

              <tr>

                <td
                  colSpan={8}
                  className="p-10 text-center text-slate-400"
                >
                  No users found.
                </td>

              </tr>

            ) : (

              users.map((user) => (

                <tr
                  key={user.id}
                  className="border-t border-slate-800 transition hover:bg-slate-800/60"
                >

                  {/* User */}

                  <td className="px-6 py-5">

                    <div>

                      <h3 className="font-semibold text-white">
                        {user.fullName || "Unnamed User"}
                      </h3>

                      <p className="text-sm text-slate-400">
                        {user.email}
                      </p>

                    </div>

                  </td>

                  {/* Role */}

                  <td className="px-6 py-5">

                    <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-sm font-medium text-indigo-300">
                      {user.role}
                    </span>

                  </td>

                  {/* Status */}

                  <td className="px-6 py-5">

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        user.status === "ACTIVE"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {user.status}
                    </span>

                  </td>

                  {/* Plan */}

                  <td className="px-6 py-5">

                    <span className="rounded-full bg-purple-500/20 px-3 py-1 text-sm font-medium text-purple-300">
                      {user.plan}
                    </span>

                  </td>

                  {/* Credits */}

                  <td className="px-6 py-5 font-semibold text-cyan-400">
                    {user.credits}
                  </td>

                  {/* Last Login */}

                  <td className="px-6 py-5 text-slate-400">

                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "Never"}

                  </td>

                  {/* Joined */}

                  <td className="px-6 py-5 text-slate-400">

                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "—"}

                  </td>

                  {/* Actions */}

                  <td className="px-6 py-5">

                    <div className="flex justify-center gap-2">

                      <button
  title="View"
  onClick={() => {
    setSelectedUser(user);
    setOpenModal(true);
  }}
  className="rounded-lg bg-blue-600 p-2 transition hover:bg-blue-700"
>
  👁
</button>

                      <button
  title="Edit User"
  onClick={() => {
    setEditUser(user);
    setEditOpen(true);
  }}
  className="rounded-lg bg-emerald-600 px-3 py-2 text-white transition hover:bg-emerald-700"
>
  ✏️
</button>

                     <button
  title="Suspend User"
  onClick={() => {
    setSuspendUser(user);
    setSuspendOpen(true);
  }}
  className="rounded-lg bg-yellow-600 px-3 py-2 text-white transition hover:bg-yellow-700"
>
  🚫
</button>

                     <button
  title="Delete User"
  onClick={() => {
    setDeleteUser(user);
    setDeleteOpen(true);
  }}
  className="rounded-lg bg-red-600 px-3 py-2 text-white transition hover:bg-red-700"
>
  🗑
</button>

                    </div>

                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

      </div>

     <DeleteUserModal
  user={deleteUser}
  open={deleteOpen}
  loading={deleteLoading}
  onClose={() => {
    if (deleteLoading) return;

    setDeleteOpen(false);
    setDeleteUser(null);
  }}
  onConfirm={async (userId) => {
    try {
      setDeleteLoading(true);

      const response = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete user."
        );
      }

      setDeleteOpen(false);
      setDeleteUser(null);

      window.location.reload();
    } catch (error) {
      console.error("Delete User Error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete user."
      );
    } finally {
      setDeleteLoading(false);
    }
  }}
/>

    </div>
  );
}