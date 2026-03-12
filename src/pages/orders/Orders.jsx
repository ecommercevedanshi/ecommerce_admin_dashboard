import { useState } from "react";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";

const Orders = () => {

  const [search, setSearch] = useState("");

  const columns = [
    "Order ID",
    "Customer",
    "Date",
    "Amount",
    "Status",
    "Payment",
    "Action"
  ];

  const data = [
    ["#1021", "John Doe", "12 Apr 2025", "$120", "Pending", "Paid", "View"],
    ["#1022", "Sarah Smith", "10 Apr 2025", "$240", "Shipped", "Paid", "View"],
    ["#1023", "Michael Lee", "09 Apr 2025", "$80", "Cancelled", "Refunded", "View"],
    ["#1024", "Emily Davis", "08 Apr 2025", "$150", "Delivered", "Paid", "View"],
  ];

  return (
    <div className="space-y-6">

      {/* Order Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <StatCard label="Total Orders" value="1,245" />

        <StatCard label="Pending Orders" value="120" />

        <StatCard label="Shipped Orders" value="860" />

        <StatCard label="Cancelled Orders" value="45" />

      </div>


      {/* Search */}

      <Card>

        <div className="flex justify-between items-center">

          <h2 className="font-semibold text-[var(--color-primary)]">
            Orders List
          </h2>

          <input
            className="input w-60"
            placeholder="Search order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </Card>


      {/* Orders Table */}

      <Card>

        <DataTable
          columns={columns}
          data={data}
        />

      </Card>

    </div>
  );
};

export default Orders;