import { useState } from "react";

import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";

import { useGetProductsQuery } from "../../features/products/productApiSlice"

import ProductModal from "../../components/products/ProductModal";

const Products = () => {

  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data } = useGetProductsQuery();

  const products = data?.data?.products || [];

  const columns = [
    "Image",
    "Product",
    "Category",
    "Price",
    "Stock",
    "Status",
    "Action"
  ];

  const rows = products.map((product) => [

    <img
      src={product.images?.[0]?.url}
      className="w-12 h-12 object-cover rounded"
    />,

    product.name,

    product.category,

    product.minPrice,

    product.totalStock,

    product.status,

    <button
      className="btn-secondary text-xs"
      onClick={() => {
        setSelectedProduct(product);
        setOpenModal(true);
      }}
    >
      Edit
    </button>

  ]);

  return (
    <div className="space-y-6">

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

            <button
              className="btn-primary"
              onClick={() => {
                setSelectedProduct(null);
                setOpenModal(true);
              }}
            >
              Add Product
            </button>

          </div>

        </div>

      </Card>

      <Card>

        <DataTable
          columns={columns}
          data={rows}
        />

      </Card>

      {openModal && (
        <ProductModal
          close={() => setOpenModal(false)}
          product={selectedProduct}
        />
      )}

    </div>
  );
};

export default Products;