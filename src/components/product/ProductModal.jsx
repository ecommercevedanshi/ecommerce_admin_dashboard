import ConfirmationDeleteModal from "../ui/ConfirmDeleteModal";
import ProductForm from "./ProductForm";

import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "../../features/products/Productapislice";

// simple internal modal wrapper for forms
const FormModal = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

      <div className="surface w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg">

        {/* header */}
        <div className="flex justify-between items-center border-b border-[var(--border-color)] px-6 py-4">

          <h3 className="text-lg font-semibold">
            {title}
          </h3>

          <button
            onClick={onClose}
            className="text-xl text-[var(--text-muted)] hover:text-white"
          >
            ×
          </button>

        </div>

        {/* body */}
        <div className="p-6">
          {children}
        </div>

      </div>

    </div>
  );
};

const ProductModal = ({
  type,
  product,
  categories,
  lowStock,
  onClose,
  onDelete,
}) => {

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const handleCreate = async (data) => {
    await createProduct(data);
    onClose();
  };

  const handleUpdate = async (data) => {
    await updateProduct({
      id: product._id,
      ...data,
    });

    onClose();
  };

  // ───────────────── DELETE ─────────────────

  if (type === "delete") {
    return (
      <ConfirmationDeleteModal
        title="Delete Product"
        message={`Are you sure you want to toggle status for ${product.name}?`}
        confirmText={product.status === "active" ? "Deactivate" : "Activate"}
        onConfirm={onDelete}
        onCancel={onClose}
      />
    );
  }

  // ───────────────── LOW STOCK ─────────────────

  if (type === "lowstock") {
    return (
      <FormModal title="Low Stock Products" onClose={onClose}>

        <div className="overflow-x-auto">

          <table className="table">

            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
              </tr>
            </thead>

            <tbody>

              {lowStock.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center text-sm text-[var(--text-muted)]">
                    No low stock products
                  </td>
                </tr>
              )}

              {lowStock.map((p) =>
                p.variants
                  .filter((v) => v.stockQty <= v.lowStockThreshold)
                  .map((v) => (
                    <tr key={v.sku}>
                      <td>{p.name}</td>
                      <td>{v.sku}</td>
                      <td className="text-red-400 font-semibold">
                        {v.stockQty}
                      </td>
                    </tr>
                  ))
              )}

            </tbody>

          </table>

        </div>

      </FormModal>
    );
  }

  // ───────────────── CREATE / EDIT ─────────────────

  return (
    <FormModal
      title={type === "edit" ? "Edit Product" : "Create Product"}
      onClose={onClose}
    >

      <ProductForm
        categories={categories}
        initial={product}
        onSubmit={type === "edit" ? handleUpdate : handleCreate}
        onClose={onClose}
      />

    </FormModal>
  );
};

export default ProductModal;