import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";

const Dashboard = () => {

  const tableColumns = ["Order ID", "Customer", "Status", "Amount"];

  const tableData = [
    ["#1245", "John Doe", "Completed", "$120"],
    ["#1246", "Sarah Smith", "Pending", "$75"],
    ["#1247", "Michael Lee", "Cancelled", "$60"],
    ["#1248", "Emily Davis", "Completed", "$210"],
  ];

  return (
    <div className="space-y-6">

      {/* Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <StatCard
          label="Total Orders"
          value="1,245"
          change="+12% this week"
        />

        <StatCard
          label="Revenue"
          value="$32,540"
          change="+8% this month"
        />

        <StatCard
          label="Rejected Orders"
          value="42"
          change="-3% today"
        />

        <StatCard
          label="Total Users"
          value="8,920"
          change="+220 new"
        />

      </div>


      {/* Sales Summary */}

      <div className="grid lg:grid-cols-2 gap-6">

        <Card title="Sales Summary">
          <p className="text-[var(--text-muted)] text-sm">
            Daily sales analytics will appear here.
          </p>
        </Card>


        <Card title="Order Status">

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span>Completed</span>
              <span className="text-[var(--color-primary)]">820</span>
            </div>

            <div className="flex justify-between">
              <span>Pending</span>
              <span>312</span>
            </div>

            <div className="flex justify-between">
              <span>Rejected</span>
              <span>113</span>
            </div>

          </div>

        </Card>

      </div>


      {/* Revenue Overview */}

      <Card title="Revenue Overview">

        <p className="text-sm text-[var(--text-muted)]">
          Chart placeholder (can integrate Recharts or Chart.js later).
        </p>

      </Card>


      {/* Recent Orders */}

      <Card title="Recent Orders">

        <DataTable
          columns={tableColumns}
          data={tableData}
        />

      </Card>


      {/* Recent Activity */}

      <Card title="Recent Activity">

        <ul className="space-y-3 text-sm text-[var(--text-muted)]">

          <li>New order placed by John Doe</li>
          <li>Product "Sneakers" added</li>
          <li>User Sarah registered</li>
          <li>Order #1246 marked as shipped</li>

        </ul>

      </Card>

    </div>
  );
};

export default Dashboard;