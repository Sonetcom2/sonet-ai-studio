"use client";



import { useState } from "react";

import SuspendUserModal from "./SuspendUserModal";

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



type EditableUser = Pick<

  User,

  "id" | "fullName" | "email" | "role" | "status" | "plan" | "credits"

>;



export default function UserTable({ users }: Props) {

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [openModal, setOpenModal] = useState(false);



  const [editUser, setEditUser] = useState<User | null>(null);

  const [editOpen, setEditOpen] = useState(false);

  const [editLoading, setEditLoading] = useState(false);



  const [suspendUser, setSuspendUser] = useState<User | null>(null);

  const [suspendOpen, setSuspendOpen] = useState(false);

  const [suspendLoading, setSuspendLoading] = useState(false);



  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{
    sent: number;
    failed: number;
    recipients: number;
  } | null>(null);




  async function handleSaveUser(user: EditableUser) {

    try {

      setEditLoading(true);



      const response = await fetch("/api/admin/users/update", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify(user),

      });



      const data = await response.json();



      if (!response.ok) {

        throw new Error(data.error || "Failed to update user.");

      }



      setEditOpen(false);

      setEditUser(null);

      window.location.reload();

    } catch (error) {

      console.error("Edit User Error:", error);



      alert(

        error instanceof Error

          ? error.message

          : "Failed to update user."

      );

    } finally {

      setEditLoading(false);

    }

  }



  async function handleSuspendUser(userId: string) {

    try {

      setSuspendLoading(true);



      const response = await fetch("/api/admin/users/suspend", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({ userId }),

      });



      const data = await response.json();



      if (!response.ok) {

        throw new Error(data.error || "Failed to suspend user.");

      }



      setSuspendOpen(false);

      setSuspendUser(null);

      window.location.reload();

    } catch (error) {

      console.error("Suspend User Error:", error);



      alert(

        error instanceof Error

          ? error.message

          : "Failed to suspend user."

      );

    } finally {

      setSuspendLoading(false);

    }

  }



  async function handleDeleteUser(userId: string) {

    try {

      setDeleteLoading(true);



      const response = await fetch("/api/admin/users/delete", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({ userId }),

      });



      const data = await response.json();



      if (!response.ok) {

        throw new Error(data.error || "Failed to delete user.");

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

  }





  async function handleBroadcastEmail(testOnly: boolean) {
    const subject = broadcastSubject.trim();
    const message = broadcastMessage.trim();

    if (!subject || !message) {
      alert("Please enter both a subject and message.");
      return;
    }

    const confirmed = testOnly
      ? window.confirm(
          "Send a TEST email only to the administrator email address?"
        )
      : window.confirm(
          `You are about to send this email to ${users.length} registered users.\n\nContinue?`
        );

    if (!confirmed) return;

    try {
      setBroadcastLoading(true);
      setBroadcastResult(null);

      const response = await fetch("/api/admin/email-broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          message,
          testOnly,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email.");
      }

      if (testOnly) {
        alert(`Test email sent successfully to ${data.recipient}.`);
      } else {
        setBroadcastResult({
          sent: data.sent ?? 0,
          failed: data.failed ?? 0,
          recipients: data.recipients ?? 0,
        });
      }
    } catch (error) {
      console.error("Broadcast Email Error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to send email."
      );
    } finally {
      setBroadcastLoading(false);
    }
  }

  return (

    <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">

      <div className="flex items-center justify-between border-b border-slate-700 p-6">

        <div>

          <h2 className="text-2xl font-bold text-white">

            Registered Users

          </h2>



          <p className="mt-1 text-sm text-slate-400">

            Manage all users on SONET AI STUDIO

          </p>

        </div>



        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setBroadcastOpen(true);
              setBroadcastResult(null);
            }}
            className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700"
          >
            📧 Broadcast Email
          </button>

          <button
            type="button"
            className="rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white transition hover:bg-cyan-700"
          >
            + New User
          </button>
        </div>

      </div>



      {broadcastOpen && (
        <div className="border-b border-slate-700 bg-slate-950/70 p-6">
          <div className="mx-auto max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  📧 Broadcast Email
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Send an email to registered SONET AI STUDIO users.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (broadcastLoading) return;
                  setBroadcastOpen(false);
                  setBroadcastResult(null);
                }}
                className="text-2xl text-slate-400 transition hover:text-white"
                aria-label="Close broadcast email panel"
              >
                ×
              </button>
            </div>

            <div className="mb-5 rounded-xl border border-purple-500/40 bg-purple-500/10 px-4 py-3 text-sm text-purple-200">
              Recipients:{" "}
              <span className="font-bold">{users.length}</span>{" "}
              registered users
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="broadcast-subject"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Subject
                </label>
                <input
                  id="broadcast-subject"
                  type="text"
                  value={broadcastSubject}
                  onChange={(event) =>
                    setBroadcastSubject(event.target.value)
                  }
                  maxLength={200}
                  disabled={broadcastLoading}
                  placeholder="Enter email subject"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500"
                />
                <div className="mt-1 text-right text-xs text-slate-500">
                  {broadcastSubject.length}/200
                </div>
              </div>

              <div>
                <label
                  htmlFor="broadcast-message"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Message
                </label>
                <textarea
                  id="broadcast-message"
                  value={broadcastMessage}
                  onChange={(event) =>
                    setBroadcastMessage(event.target.value)
                  }
                  maxLength={10000}
                  disabled={broadcastLoading}
                  rows={10}
                  placeholder="Write your message here..."
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500"
                />
                <div className="mt-1 text-right text-xs text-slate-500">
                  {broadcastMessage.length}/10,000
                </div>
              </div>

              {broadcastResult && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
                  <div className="font-semibold">Broadcast completed.</div>
                  <div className="mt-2 space-y-1">
                    <div>Recipients: {broadcastResult.recipients}</div>
                    <div>Sent: {broadcastResult.sent}</div>
                    <div>Failed: {broadcastResult.failed}</div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (broadcastLoading) return;
                    setBroadcastOpen(false);
                    setBroadcastSubject("");
                    setBroadcastMessage("");
                    setBroadcastResult(null);
                  }}
                  disabled={broadcastLoading}
                  className="rounded-xl bg-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleBroadcastEmail(true)}
                  disabled={broadcastLoading}
                  className="rounded-xl bg-amber-600 px-5 py-3 font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {broadcastLoading ? "Sending..." : "Send Test Email"}
                </button>

                <button
                  type="button"
                  onClick={() => handleBroadcastEmail(false)}
                  disabled={broadcastLoading}
                  className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {broadcastLoading
                    ? "Sending..."
                    : `Send Broadcast (${users.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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



                  <td className="px-6 py-5">

                    <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-sm font-medium text-indigo-300">

                      {user.role}

                    </span>

                  </td>



                  <td className="px-6 py-5">

                    <span

                      className={`rounded-full px-3 py-1 text-sm font-medium ${

                        user.status?.toUpperCase() === "ACTIVE"

                          ? "bg-green-500/20 text-green-300"

                          : "bg-red-500/20 text-red-300"

                      }`}

                    >

                      {user.status}

                    </span>

                  </td>



                  <td className="px-6 py-5">

                    <span className="rounded-full bg-purple-500/20 px-3 py-1 text-sm font-medium text-purple-300">

                      {user.plan}

                    </span>

                  </td>



                  <td className="px-6 py-5 font-semibold text-cyan-400">

                    {user.credits}

                  </td>



                  <td className="px-6 py-5 text-slate-400">

                    {user.lastLogin

                      ? new Date(user.lastLogin).toLocaleDateString()

                      : "Never"}

                  </td>



                  <td className="px-6 py-5 text-slate-400">

                    {user.createdAt

                      ? new Date(user.createdAt).toLocaleDateString()

                      : "—"}

                  </td>



                  <td className="px-6 py-5">

                    <div className="flex justify-center gap-2">

                      <button

                        type="button"

                        title="View"

                        onClick={() => {

                          setSelectedUser(user);

                          setOpenModal(true);

                        }}

                        className="rounded-lg bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"

                      >

                        View

                      </button>



                      <button

                        type="button"

                        title="Edit User"

                        onClick={() => {

                          setEditUser(user);

                          setEditOpen(true);

                        }}

                        className="rounded-lg bg-emerald-600 px-3 py-2 text-white transition hover:bg-emerald-700"

                      >

                        Edit

                      </button>



                      <button

                        type="button"

                        title="Suspend User"

                        onClick={() => {

                          setSuspendUser(user);

                          setSuspendOpen(true);

                        }}

                        disabled={

                          user.status?.toUpperCase() === "SUSPENDED"

                        }

                        className="rounded-lg bg-yellow-600 px-3 py-2 text-white transition hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"

                      >

                        Suspend

                      </button>



                      <button

                        type="button"

                        title="Delete User"

                        onClick={() => {

                          setDeleteUser(user);

                          setDeleteOpen(true);

                        }}

                        className="rounded-lg bg-red-600 px-3 py-2 text-white transition hover:bg-red-700"

                      >

                        Delete

                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>



      <UserModal

        user={selectedUser}

        open={openModal}

        onClose={() => {

          setOpenModal(false);

          setSelectedUser(null);

        }}

      />



      <EditUserModal

        user={editUser}

        open={editOpen}

        onClose={() => {

          if (editLoading) return;



          setEditOpen(false);

          setEditUser(null);

        }}

        onSave={handleSaveUser}

      />



      <SuspendUserModal

        user={suspendUser}

        open={suspendOpen}

        loading={suspendLoading}

        onClose={() => {

          if (suspendLoading) return;



          setSuspendOpen(false);

          setSuspendUser(null);

        }}

        onConfirm={handleSuspendUser}

      />



      <DeleteUserModal

        user={deleteUser}

        open={deleteOpen}

        loading={deleteLoading}

        onClose={() => {

          if (deleteLoading) return;



          setDeleteOpen(false);

          setDeleteUser(null);

        }}

        onConfirm={handleDeleteUser}

      />

    </div>

  );

}