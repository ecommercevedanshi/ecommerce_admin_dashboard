import { useGetCategoryByIdQuery } from "../../features/category/categoryApiSlice";

const CategoryViewModal = ({ id, close, openUpdate }) => {

  const { data } = useGetCategoryByIdQuery(id);

  const category = data?.data?.category;

  if (!category) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30">

      <div className="surface p-6 rounded-lg w-[420px]">

        <h2 className="text-lg mb-4">
          Category Details
        </h2>

        {/* Thumbnail */}

        {category.thumbnail && (
          <div className="mb-4">
            <p className="text-sm mb-2">Thumbnail</p>

            <img
              src={category.thumbnail}
              alt={category.name}
              className="h-24 w-24 object-cover rounded border"
            />
          </div>
        )}

        <div className="space-y-2 text-sm">

          <p>Name: {category.name}</p>

          <p>Slug: {category.slug}</p>

          <p>Parent: {category.parent || "Main Category"}</p>

          <p>Status: {category.isActive ? "Active" : "Inactive"}</p>

          <p>Sort Order: {category.sortOrder}</p>

        </div>

        <div className="flex justify-end gap-3 mt-5">

          <button
            className="btn-secondary"
            onClick={close}
          >
            Close
          </button>

          <button
            className="btn-primary"
            onClick={() => openUpdate(category)}
          >
            Update
          </button>

        </div>

      </div>

    </div>
  );
};

export default CategoryViewModal;