import { useState, useRef } from "react";
import {
  useAdminGetAllProductsQuery,
  useGetLowStockProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetAllMediaQuery,
  useGetMediaByEntityQuery,
} from "./Productapislice.js";

// ─── Reusable UI ──────────────────────────────────────────────────────────────

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500 tracking-wide">{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type = "text", ...rest }) => (
  <input
    type={type}
    value={value ?? ""}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition"
    {...rest}
  />
);

const SelectUI = ({ value, onChange, children }) => (
  <select
    value={value ?? ""}
    onChange={onChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white outline-none focus:border-pink-400 transition"
  >
    {children}
  </select>
);

const Textarea = ({ value, onChange, placeholder }) => (
  <textarea
    value={value ?? ""}
    onChange={onChange}
    placeholder={placeholder}
    rows={3}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white outline-none focus:border-pink-400 transition resize-y"
  />
);

const StatusBadge = ({ value }) => {
  const map = {
    active:   "bg-teal-100 text-teal-700",
    inactive: "bg-gray-100 text-gray-500",
    draft:    "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full ${map[value] || "bg-gray-100 text-gray-500"}`}>
      {value}
    </span>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h3 className="text-base font-bold text-gray-800">{title}</h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
      </div>
      <div className="px-7 py-6">{children}</div>
    </div>
  </div>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "", slug: "", shortDescription: "", description: "",
  brand: "", category: "", subCategory: "",
  tags: "", badges: "",
  isFeatured: "false", visibility: "public", status: "active",
  seoTitle: "", seoDescription: "",
  material: "", fit: "", sleeve: "", washCare: "",
};

const EMPTY_VARIANT = {
  sku: "", size: "", colour: "", hex: "#000000",
  mrp: "", price: "", stockQty: "", lowStockThreshold: "5",
};

const TABS = ["Basic Info", "Cloth Details", "Variants", "Images", "SEO"];

// ─── Media Image Picker (tab 3) ───────────────────────────────────────────────

function MediaPicker({ selectedImages, setSelectedImages }) {
  const [selectedFolder, setSelectedFolder] = useState("");

  const { data: mediaFolders, isLoading: foldersLoading } = useGetAllMediaQuery({ page: 1, limit: 50 });
  const { data: mediaEntityRes, isFetching: imagesLoading } = useGetMediaByEntityQuery(
    selectedFolder,
    { skip: !selectedFolder }
  );

  const folderImages = mediaEntityRes?.data?.images || [];

  const toggleImage = (img) => {
    const exists = selectedImages.find((i) => i._id === img._id);
    if (exists) {
      const updated = selectedImages
        .filter((i) => i._id !== img._id)
        .map((i, idx) => ({ ...i, sortOrder: idx + 1, isPrimary: idx === 0 }));
      setSelectedImages(updated);
    } else {
      setSelectedImages([
        ...selectedImages,
        {
          ...img,
          sortOrder: selectedImages.length + 1,
          isPrimary: selectedImages.length === 0,
        },
      ]);
    }
  };

  const removeSelected = (imgId) => {
    const updated = selectedImages
      .filter((i) => i._id !== imgId)
      .map((i, idx) => ({ ...i, sortOrder: idx + 1, isPrimary: idx === 0 }));
    setSelectedImages(updated);
  };

  const setPrimary = (imgId) => {
    setSelectedImages(
      selectedImages.map((i) => ({ ...i, isPrimary: i._id === imgId }))
    );
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Folder selector */}
      <Field label="Select Media Folder">
        <SelectUI
          value={selectedFolder}
          onChange={(e) => {
            setSelectedFolder(e.target.value);
          }}
        >
          <option value="">-- Choose a folder --</option>
          {foldersLoading ? (
            <option disabled>Loading...</option>
          ) : (
            mediaFolders?.data?.map((folder) => (
              <option key={folder._id} value={folder.entityId}>
                {folder.baseName} ({folder.entityType})
              </option>
            ))
          )}
        </SelectUI>
      </Field>

      {/* Images grid from selected folder */}
      {selectedFolder && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            Click images to select
          </p>
          {imagesLoading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading images...</div>
          ) : folderImages.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
              No images in this folder
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {folderImages.map((img) => {
                const isSelected = !!selectedImages.find((i) => i._id === img._id);
                const selIndex   = selectedImages.findIndex((i) => i._id === img._id);
                return (
                  <button
                    key={img._id}
                    type="button"
                    onClick={() => toggleImage(img)}
                    className={`relative rounded-lg overflow-hidden border-2 transition ${
                      isSelected ? "border-pink-500" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.altText || "media"}
                      className="h-20 w-full object-cover"
                    />
                    {/* Selection badge */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-pink-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {selIndex + 1}
                      </div>
                    )}
                    {/* Primary badge */}
                    {isSelected && selIndex === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-pink-500/80 text-white text-[9px] font-bold text-center py-0.5">
                        PRIMARY
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected images strip */}
      {selectedImages.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            Selected Images ({selectedImages.length})
          </p>
          <div className="flex gap-3 flex-wrap">
            {selectedImages.map((img, index) => (
              <div key={img._id} className="relative group">
                <img
                  src={img.url}
                  alt={img.altText || "selected"}
                  className={`h-20 w-20 object-cover rounded-lg border-2 ${
                    img.isPrimary ? "border-pink-500" : "border-gray-200"
                  }`}
                />

                {/* Primary label */}
                {img.isPrimary && (
                  <span className="absolute bottom-0 left-0 right-0 text-center bg-pink-500 text-white text-[9px] font-bold py-0.5 rounded-b-lg">
                    PRIMARY
                  </span>
                )}

                {/* Set as primary button */}
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(img._id)}
                    className="absolute bottom-0 left-0 right-0 text-center bg-black/60 text-white text-[9px] font-bold py-0.5 rounded-b-lg opacity-0 group-hover:opacity-100 transition"
                  >
                    Set Primary
                  </button>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeSelected(img._id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold leading-none hover:bg-red-600 transition"
                >
                  ×
                </button>

                {/* Order number */}
                <span className="absolute top-1 left-1 bg-black/50 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Hover an image to set it as primary. First selected is primary by default.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Product Form ─────────────────────────────────────────────────────────────

function ProductForm({ initial, onSubmit, onClose, loading, categories = [] }) {
  const [tab, setTab]                   = useState(0);
  const [form, setForm]                 = useState({ ...EMPTY_FORM, ...initial });
  const [variants, setVariants]         = useState(initial?.variants || []);
  const [selectedImages, setSelectedImages] = useState(
    initial?.images?.map((img, idx) => ({ ...img, sortOrder: idx + 1 })) || []
  );
  const [newV, setNewV]                 = useState(EMPTY_VARIANT);
  const [variantError, setVariantError] = useState("");
  const [formError, setFormError]       = useState("");

  const set  = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setN = (key) => (e) => setNewV((v) => ({ ...v, [key]: e.target.value }));

  const addVariant = () => {
    if (!newV.sku.trim()) { setVariantError("SKU is required"); return; }
    if (!newV.size.trim()) { setVariantError("Size is required"); return; }
    setVariantError("");
    setVariants((v) => [...v, { ...newV }]);
    setNewV(EMPTY_VARIANT);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim() || !form.category) {
      setFormError("Name, Slug and Category are required.");
      setTab(0);
      return;
    }
    setFormError("");

    const payload = {
      ...form,
      isFeatured: form.isFeatured === "true",
      tags:   typeof form.tags   === "string" ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)   : form.tags,
      badges: typeof form.badges === "string" ? form.badges.split(",").map((b) => b.trim()).filter(Boolean) : form.badges,
      clothDetails: {
        material: form.material,
        fit:      form.fit,
        sleeve:   form.sleeve,
        washCare: form.washCare,
      },
      variants,
      // Map selected images to product images format
      images: selectedImages.map((img) => ({
        url:       img.url,
        key:       img.key,
        alt:       img.altText || "",
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
    };

    delete payload.material;
    delete payload.fit;
    delete payload.sleeve;
    delete payload.washCare;

    await onSubmit(payload);
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(i)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              tab === i ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {t}
            {i === 3 && selectedImages.length > 0 && (
              <span className="ml-1 bg-white text-pink-500 rounded-full px-1.5 text-[10px]">
                {selectedImages.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Basic Info ── */}
      {tab === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formError && (
            <div className="col-span-1 sm:col-span-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-2 rounded-lg">
              {formError}
            </div>
          )}
          <Field label="Name *"><Input value={form.name} onChange={set("name")} placeholder="Product name" /></Field>
          <Field label="Slug *"><Input value={form.slug} onChange={set("slug")} placeholder="product-slug" /></Field>
          <Field label="Brand"><Input value={form.brand} onChange={set("brand")} placeholder="Brand name" /></Field>
          <Field label="Category *">
            <SelectUI value={form.category} onChange={set("category")}>
              <option value="">Select category</option>
              {categories
                .filter((c) => c.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
            </SelectUI>
          </Field>
          <Field label="Sub Category"><Input value={form.subCategory} onChange={set("subCategory")} placeholder="e.g. T-shirts" /></Field>
          <Field label="Status">
            <SelectUI value={form.status} onChange={set("status")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </SelectUI>
          </Field>
          <Field label="Visibility">
            <SelectUI value={form.visibility} onChange={set("visibility")}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </SelectUI>
          </Field>
          <Field label="Featured">
            <SelectUI value={form.isFeatured} onChange={set("isFeatured")}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </SelectUI>
          </Field>
          <Field label="Tags (comma separated)"><Input value={form.tags} onChange={set("tags")} placeholder="cotton, summer" /></Field>
          <Field label="Badges (comma separated)"><Input value={form.badges} onChange={set("badges")} placeholder="New, Sale" /></Field>
          <div className="col-span-1 sm:col-span-2">
            <Field label="Short Description"><Input value={form.shortDescription} onChange={set("shortDescription")} placeholder="One liner" /></Field>
          </div>
          <div className="col-span-1 sm:col-span-2">
            <Field label="Description"><Textarea value={form.description} onChange={set("description")} placeholder="Full product description" /></Field>
          </div>
        </div>
      )}

      {/* ── Cloth Details ── */}
      {tab === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Material"><Input value={form.material} onChange={set("material")} placeholder="e.g. 100% Cotton" /></Field>
          <Field label="Fit">
            <SelectUI value={form.fit} onChange={set("fit")}>
              <option value="">Select fit</option>
              <option value="Slim">Slim</option>
              <option value="Fit">Fit</option>
              <option value="Regular">Regular</option>
              <option value="Oversize">Oversize</option>
            </SelectUI>
          </Field>
          <Field label="Sleeve">
            <SelectUI value={form.sleeve} onChange={set("sleeve")}>
              <option value="">Select sleeve</option>
              <option value="Half">Half</option>
              <option value="Full">Full</option>
              <option value="Sleeveless">Sleeveless</option>
            </SelectUI>
          </Field>
          <Field label="Wash Care"><Input value={form.washCare} onChange={set("washCare")} placeholder="e.g. Machine wash cold" /></Field>
        </div>
      )}

      {/* ── Variants ── */}
      {tab === 2 && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <Field label="SKU *"><Input value={newV.sku} onChange={setN("sku")} placeholder="SKU-001" /></Field>
            <Field label="Size *"><Input value={newV.size} onChange={setN("size")} placeholder="M" /></Field>
            <Field label="Colour"><Input value={newV.colour} onChange={setN("colour")} placeholder="Blue" /></Field>
            <Field label="Hex Colour">
              <input type="color" value={newV.hex} onChange={setN("hex")} className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer p-1" />
            </Field>
            <Field label="MRP"><Input type="number" value={newV.mrp} onChange={setN("mrp")} placeholder="999" /></Field>
            <Field label="Price"><Input type="number" value={newV.price} onChange={setN("price")} placeholder="799" /></Field>
            <Field label="Stock Qty"><Input type="number" value={newV.stockQty} onChange={setN("stockQty")} placeholder="50" /></Field>
            <Field label="Low Stock Threshold"><Input type="number" value={newV.lowStockThreshold} onChange={setN("lowStockThreshold")} placeholder="5" /></Field>
          </div>

          {variantError && <p className="text-red-500 text-xs font-semibold mb-2">{variantError}</p>}

          <button type="button" onClick={addVariant} className="mb-5 px-4 py-2 bg-pink-500 text-white text-xs font-bold rounded-lg hover:bg-pink-600 transition">
            + Add Variant
          </button>

          {variants.length === 0 && (
            <p className="text-gray-400 text-xs">No variants added yet. Fill SKU & Size above then click Add Variant.</p>
          )}

          {variants.length > 0 && (
            <div className="rounded-lg border border-gray-100 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    {["SKU", "Size", "Colour", "MRP", "Price", "Stock", ""].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-mono">{v.sku}</td>
                      <td className="px-3 py-2">{v.size}</td>
                      <td className="px-3 py-2">
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0" style={{ background: v.hex }} />
                          {v.colour}
                        </span>
                      </td>
                      <td className="px-3 py-2">₹{v.mrp}</td>
                      <td className="px-3 py-2">₹{v.price}</td>
                      <td className="px-3 py-2">{v.stockQty}</td>
                      <td className="px-3 py-2">
                        <button type="button" onClick={() => setVariants((vl) => vl.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-600 font-bold text-base leading-none">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Images (Media Picker) ── */}
      {tab === 3 && (
        <MediaPicker selectedImages={selectedImages} setSelectedImages={setSelectedImages} />
      )}

      {/* ── SEO ── */}
      {tab === 4 && (
        <div className="flex flex-col gap-4">
          <Field label="SEO Title"><Input value={form.seoTitle} onChange={set("seoTitle")} placeholder="SEO Title" /></Field>
          <Field label="SEO Description"><Textarea value={form.seoDescription} onChange={set("seoDescription")} placeholder="Meta description" /></Field>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-7 pt-5 border-t border-gray-100">
        <button
          type="button"
          onClick={() => setTab((t) => Math.max(0, t - 1))}
          className={`px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition ${tab === 0 ? "invisible" : ""}`}
        >
          ← Back
        </button>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          {tab < TABS.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                if (tab === 0 && (!form.name.trim() || !form.slug.trim() || !form.category)) {
                  setFormError("Name, Slug and Category are required.");
                  return;
                }
                setFormError("");
                setTab((t) => t + 1);
              }}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg text-sm font-bold hover:bg-pink-600 transition"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg text-sm font-bold hover:bg-pink-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Product"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Low Stock Modal ──────────────────────────────────────────────────────────

function LowStockModal({ data, onClose }) {
  return (
    <Modal title="Low Stock Products" onClose={onClose}>
      {!data?.length ? (
        <p className="text-center text-gray-400 py-10 text-sm">All products are well stocked!</p>
      ) : (
        <div className="rounded-lg border border-gray-100 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {["Product", "SKU", "Size", "Colour", "Stock", "Threshold"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-semibold text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.flatMap((p) =>
                p.variants
                  .filter((v) => v.stockQty <= v.lowStockThreshold)
                  .map((v, i) => (
                    <tr key={`${p._id}-${i}`} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-semibold text-gray-700">{p.name}</td>
                      <td className="px-3 py-2 text-gray-400">{v.sku}</td>
                      <td className="px-3 py-2">{v.size}</td>
                      <td className="px-3 py-2">
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full border border-gray-200" style={{ background: v.hex }} />
                          {v.colour}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-bold text-red-500">{v.stockQty}</td>
                      <td className="px-3 py-2 text-yellow-500 font-semibold">{v.lowStockThreshold}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-end pt-5 border-t border-gray-100 mt-5">
        <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
          Close
        </button>
      </div>
    </Modal>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ product, onConfirm, onClose, loading }) {
  return (
    <Modal title="Delete Product" onClose={onClose}>
      <p className="text-sm text-gray-600 mb-6">
        Are you sure you want to toggle status for <strong className="text-gray-800">{product.name}</strong>?
        {product.status === "active" ? " It will be marked inactive." : " It will be reactivated."}
      </p>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-6 py-2 text-white rounded-lg text-sm font-bold transition disabled:opacity-60 ${
            product.status === "active" ? "bg-red-500 hover:bg-red-600" : "bg-teal-500 hover:bg-teal-600"
          }`}
        >
          {loading ? "Processing..." : product.status === "active" ? "Deactivate" : "Activate"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Main Products Page ───────────────────────────────────────────────────────

const Products = () => {
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal]               = useState(null);
  const [selected, setSelected]         = useState(null);
  const [toast, setToast]               = useState("");

  const { data, isLoading, isError } = useAdminGetAllProductsQuery({
    page, limit: 20, status: statusFilter || undefined,
  });
  const { data: lowStockRes }   = useGetLowStockProductsQuery();
  const { data: categoriesRes } = useGetCategoriesQuery();

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

  const products   = data?.data?.products || [];
  const pagination = data?.data?.pagination || {};
  const lowStock   = lowStockRes?.data || [];
  const categories = categoriesRes?.data || [];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const closeModal = () => { setModal(null); setSelected(null); };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (payload) => {
    try {
      await createProduct(payload).unwrap();
      closeModal();
      showToast("✅ Product created successfully!");
    } catch (e) {
      showToast(e?.data?.message || "Error creating product");
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await updateProduct({ id: selected._id, ...payload }).unwrap();
      closeModal();
      showToast("✅ Product updated successfully!");
    } catch (e) {
      showToast(e?.data?.message || "Error updating product");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(selected._id).unwrap();
      closeModal();
      showToast(selected.status === "active" ? "Product deactivated" : "✅ Product activated!");
    } catch (e) {
      showToast(e?.data?.message || "Error updating product");
    }
  };

  const inStock    = products.filter((p) => p.totalStock > 0).length;
  const outOfStock = products.filter((p) => p.totalStock === 0).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-gray-800 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Products",   value: pagination.total || 0, color: "text-gray-800" },
          { label: "In Stock",         value: inStock,               color: "text-teal-600" },
          { label: "Out of Stock",     value: outOfStock,            color: "text-red-500"  },
          { label: "Low Stock Alerts", value: lowStock.length,       color: "text-yellow-600", action: () => setModal("lowstock") },
        ].map(({ label, value, color, action }) => (
          <div key={label} onClick={action}
            className={`bg-white rounded-xl border border-gray-200 p-5 ${action ? "cursor-pointer hover:shadow-md transition" : ""}`}>
            <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{isLoading ? "—" : value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-gray-700">Products List</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input type="text" placeholder="Search by name or brand..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-pink-400 w-56" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-pink-400 bg-white">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
          <button type="button" onClick={() => setModal("create")}
            className="px-4 py-2 bg-pink-500 text-white text-sm font-bold rounded-lg hover:bg-pink-600 transition">
            + Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading products...</div>
        ) : isError ? (
          <div className="text-center py-16 text-red-400 text-sm">Failed to load products.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Product", "Brand", "Category", "Price", "Stock", "Status", "Visibility", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No products found</td></tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {p.images?.[0]?.url ? (
                              <img src={p.images[0].url} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-gray-100 flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">📦</div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-800 text-xs leading-tight">{p.name}</p>
                              <p className="text-gray-400 text-xs mt-0.5">{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{p.brand || "—"}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{p.category?.name || p.category || "—"}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-gray-800 text-xs">₹{p.minPrice}</span>
                          {p.mrp > p.minPrice && <span className="text-gray-400 text-xs ml-1 line-through">₹{p.mrp}</span>}
                        </td>
                        <td className="px-4 py-3 font-bold text-xs">
                          <span className={p.totalStock === 0 ? "text-red-500" : p.totalStock <= 10 ? "text-yellow-500" : "text-teal-600"}>
                            {p.totalStock}
                          </span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge value={p.status} /></td>
                        <td className="px-4 py-3 text-gray-400 text-xs capitalize">{p.visibility}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button type="button" onClick={() => { setSelected(p); setModal("edit"); }}
                              className="px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition">Edit</button>
                            <button type="button" onClick={() => { setSelected(p); setModal("delete"); }}
                              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                                p.status === "active"
                                  ? "border border-red-100 bg-red-50 text-red-500 hover:bg-red-100"
                                  : "border border-teal-100 bg-teal-50 text-teal-600 hover:bg-teal-100"
                              }`}>
                              {p.status === "active" ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-end items-center gap-3 px-5 py-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
                <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">← Prev</button>
                <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {modal === "create" && (
        <Modal title="Create Product" onClose={closeModal}>
          <ProductForm categories={categories} onSubmit={handleCreate} onClose={closeModal} loading={creating} />
        </Modal>
      )}

      {modal === "edit" && selected && (
        <Modal title="Edit Product" onClose={closeModal}>
          <ProductForm
            categories={categories}
            initial={{
              ...selected,
              tags:      Array.isArray(selected.tags)   ? selected.tags.join(", ")   : selected.tags   || "",
              badges:    Array.isArray(selected.badges) ? selected.badges.join(", ") : selected.badges || "",
              isFeatured: String(selected.isFeatured),
              material:  selected.clothDetails?.material  || "",
              fit:       selected.clothDetails?.fit        || "",
              sleeve:    selected.clothDetails?.sleeve     || "",
              washCare:  selected.clothDetails?.washCare   || "",
            }}
            onSubmit={handleUpdate}
            onClose={closeModal}
            loading={updating}
          />
        </Modal>
      )}

      {modal === "delete" && selected && (
        <DeleteModal product={selected} onConfirm={handleDelete} onClose={closeModal} loading={deleting} />
      )}

      {modal === "lowstock" && (
        <LowStockModal data={lowStock} onClose={closeModal} />
      )}
    </div>
  );
};

export default Products;