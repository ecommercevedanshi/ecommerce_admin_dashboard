import { useState } from "react";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";

const Products = () => {

  const [search, setSearch] = useState("");

  const columns = [
    "Product",
    "Category",
    "Price",
    "Stock",
    "Status",
    "Action"
  ];

  const data = [
    ["Sneakers", "Footwear", "$120", "24", "In Stock", "Edit"],
    ["Leather Jacket", "Clothing", "$240", "8", "In Stock", "Edit"],
    ["Backpack", "Accessories", "$80", "0", "Out of Stock", "Edit"],
    ["Running Shoes", "Footwear", "$140", "15", "In Stock", "Edit"],
  ];

  return (
    <div className="space-y-6">

      {/* Product Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <StatCard label="Total Products" value="320" />

        <StatCard label="In Stock" value="280" />

        <StatCard label="Out of Stock" value="40" />

        <StatCard label="Categories" value="12" />

      </div>


      {/* Search + Add */}

      <Card>

        <div className="flex justify-between items-center">

          <h2 className="font-semibold text-[var(--color-primary)]">
            Products List
          </h2>

          <div className="flex gap-3">

            <input
              className="input w-60"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button className="btn-primary">
              Add Product
            </button>

          </div>

        </div>

      </Card>


      {/* Products Table */}

      <Card>

        <DataTable
          columns={columns}
          data={data}
        />

      </Card>

    </div>
  );
};

export default Products;