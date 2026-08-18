"use client";

import { useMemo, useState } from "react";
import UserSearch from "./UserSearch";
import UserFilters from "./UserFilters";
import UserTable from "./UserTable";

type User = {
  id: string;
  fullName: string;
  email: string;
  plan: string;
  credits: number;
  createdAt: string;
  status: string;
  role: string;
  lastLogin: string | null;
};

type Props = {
  users: User[];
};

type Filter =
  | "ALL"
  | "FREE"
  | "PRO"
  | "PREMIUM"
  | "ACTIVE"
  | "SUSPENDED";

export default function UserManagement({
  users,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<Filter>("ALL");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.fullName
          .toLowerCase()
          .includes(query) ||
        user.email
          .toLowerCase()
          .includes(query);

      const plan =
        String(user.plan).toUpperCase();

      const status =
        String(user.status).toUpperCase();

      let matchesFilter = true;

      switch (filter) {
        case "FREE":
          matchesFilter = plan === "FREE";
          break;

        case "PRO":
          matchesFilter = plan === "PRO";
          break;

        case "PREMIUM":
          matchesFilter = plan === "PREMIUM";
          break;

        case "ACTIVE":
          matchesFilter = status === "ACTIVE";
          break;

        case "SUSPENDED":
          matchesFilter =
            status === "SUSPENDED";
          break;

        case "ALL":
        default:
          matchesFilter = true;
      }

      return matchesSearch && matchesFilter;
    });
  }, [users, search, filter]);

  return (
    <>
      <UserSearch
        value={search}
        onChange={setSearch}
      />

      <UserFilters
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      <UserTable users={filteredUsers} />
    </>
  );
}