import { useState } from "react";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";

const Users = () => {

  const [search, setSearch] = useState("");

  const columns = [
    "Name",
    "Email",
    "Status",
    "Joined",
    "Orders",
    "Action"
  ];

  const data = [
    ["John Doe", "john@mail.com", "Active", "12 Mar 2025", "5", "View"],
    ["Sarah Smith", "sarah@mail.com", "Blocked", "08 Feb 2025", "2", "View"],
    ["Michael Lee", "michael@mail.com", "Active", "01 Jan 2025", "9", "View"],
    ["Emily Davis", "emily@mail.com", "Active", "21 Dec 2024", "4", "View"],
  ];

  return (
    <div className="space-y-6">

      {/* Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <StatCard label="Total Users" value="8,920" />

        <StatCard label="New Users" value="124" />

        <StatCard label="Active Users" value="7,300" />

        <StatCard label="Blocked Users" value="35" />

      </div>


      {/* Search */}

      <Card>

        <div className="flex justify-between items-center">

          <h2 className="font-semibold text-[var(--color-primary)]">
            Users List
          </h2>

          <input
            className="input w-60"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </Card>


      {/* Table */}

      <Card>

        <DataTable columns={columns} data={data} />

      </Card>

    </div>
  );
};

export default Users;