import { useState } from "react";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";

const Coupons = () => {

  const [search, setSearch] = useState("");

  const columns = [
    "Code",
    "Discount",
    "Type",
    "Usage",
    "Expiry Date",
    "Status",
    "Action"
  ];

  const data = [
    ["SUMMER10", "10%", "Percentage", "120", "30 Jun 2025", "Active", "Edit"],
    ["WELCOME20", "20%", "Percentage", "85", "31 Dec 2025", "Active", "Edit"],
    ["FREESHIP", "$5", "Flat", "200", "10 Jul 2025", "Expired", "Edit"],
    ["SALE15", "15%", "Percentage", "60", "15 May 2025", "Active", "Edit"],
  ];

  return (
    <div className="space-y-6">

      {/* Coupon Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <StatCard label="Total Coupons" value="24" />

        <StatCard label="Active Coupons" value="15" />

        <StatCard label="Expired Coupons" value="6" />

        <StatCard label="Used Coupons" value="320" />

      </div>


      {/* Search + Add */}

      <Card>

        <div className="flex justify-between items-center">

          <h2 className="font-semibold text-[var(--color-primary)]">
            Coupons List
          </h2>

          <div className="flex gap-3">

            <input
              className="input w-60"
              placeholder="Search coupon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button className="btn-primary">
              Create Coupon
            </button>

          </div>

        </div>

      </Card>


      {/* Coupons Table */}

      <Card>

        <DataTable
          columns={columns}
          data={data}
        />

      </Card>

    </div>
  );
};

export default Coupons;