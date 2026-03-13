import { useState } from "react";
import Card from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";

import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "../../features/category/categoryApiSlice";
import CategoryModal from "../../components/category/CategoryModal";
import CategoryViewModal from "../../components/category/CategoryViewModal";


const Categories = () => {

  const { data, isLoading } = useGetCategoriesQuery();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [selectedId, setSelectedId] = useState(null);
const [showCreate, setShowCreate] = useState(false);
const [showUpdate, setShowUpdate] = useState(null);

  const columns = [
    "Name",
    "Slug",
    "Parent",
    "Status",
    "Sort Order",
    "Actions"
  ];

//   console.log(data)

  const rows =
    data?.data?.categories?.map((cat) => [
      cat.name,
      cat.slug,
      cat.parent || "Main Category",
      cat.isActive ? "Active" : "Inactive",
      cat.sortOrder,
      <>
  <button
    className="btn-secondary text-xs mr-2"
    onClick={() => setSelectedId(cat._id)}
  >
    View
  </button>

  <button
    className="btn-secondary text-xs"
    onClick={() => deleteCategory(cat._id)}
  >
    Toggle status
  </button>
</>
    ]) || [];

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">

      <Card>

        <div className="flex justify-between items-center">

          <h3 className="text-sm font-semibold text-[var(--text-secondary)]">
            Categories
          </h3>

          <button
  className="btn-primary"
  onClick={() => setShowCreate(true)}
>
  Create Category
</button>

        </div>

      </Card>

      <Card>

        <DataTable
          columns={columns}
          data={rows}
        />

      </Card>

      {/* CREATE MODAL */}

{showCreate && (
  <CategoryModal
    close={() => setShowCreate(false)}
  />
)}

{/* VIEW MODAL */}

{selectedId && (
  <CategoryViewModal
    id={selectedId}
    close={() => setSelectedId(null)}
    openUpdate={(data) => {
      setSelectedId(null);
      setShowUpdate(data);
    }}
  />
)}

{/* UPDATE MODAL */}

{showUpdate && (
  <CategoryModal
    category={showUpdate}
    close={() => setShowUpdate(null)}
  />
)}

    </div>
  );
};

export default Categories;