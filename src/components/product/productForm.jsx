import { useState } from "react";
import { generateSlug } from "../../utils/slugify";
import {
  useGetAllMediaQuery,
  useGetMediaByEntityQuery,
} from "../../features/products/Productapislice.js";

// ─── Reusable UI ──────────────────────────────────────────────────────────────

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-[var(--text-muted)] tracking-wide">
      {label}
    </label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type = "text", ...rest }) => (
  <input
    type={type}
    value={value ?? ""}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] bg-[var(--bg-surface-light)] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--hover-primary)] transition placeholder:text-[var(--text-muted)]"
    {...rest}
  />
);

const SelectUI = ({ value, onChange, children }) => (
  <select
    value={value ?? ""}
    onChange={onChange}
    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] bg-[var(--bg-surface-light)] outline-none focus:border-[var(--color-primary)] transition"
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
    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] bg-[var(--bg-surface-light)] outline-none focus:border-[var(--color-primary)] transition resize-y placeholder:text-[var(--text-muted)]"
  />
);

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  brand: "",
  category: "",
  subCategory: "",
  tags: "",
  badges: "",
  isFeatured: "false",
  visibility: "public",
  status: "active",
  seoTitle: "",
  seoDescription: "",
  material: "",
  fit: "",
  sleeve: "",
  washCare: "",
};

const EMPTY_VARIANT = {
  sku: "",
  size: "",
  colour: "",
  hex: "#000000",
  mrp: "",
  price: "",
  stockQty: "",
  lowStockThreshold: "5",
};

const TABS = ["Basic Info", "Cloth Details", "Variants", "Images", "SEO"];

// ─── Media Image Picker (tab 3) ───────────────────────────────────────────────

function MediaPicker({ selectedImages, setSelectedImages }) {
  const [selectedFolder, setSelectedFolder] = useState("");

  const { data: mediaFolders, isLoading: foldersLoading } = useGetAllMediaQuery({
    page: 1,
    limit: 50,
  });

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
      selectedImages.map((i) => ({
        ...i,
        isPrimary: i._id === imgId,
      }))
    );
  };

  return (
    <div className="flex flex-col gap-5">
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
              <option key={folder._id} value={folder._id}>
                {folder.baseName} ({folder.entityType})
              </option>
            ))
          )}
        </SelectUI>
      </Field>

      {selectedFolder && (
        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
            Click images to select
          </p>

          {imagesLoading ? (
            <div className="text-center py-8 text-[var(--text-muted)] text-sm">
              Loading images...
            </div>
          ) : folderImages.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)] text-sm border-2 border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-surface-light)]">
              No images in this folder
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {folderImages.map((img) => {
                const isSelected = !!selectedImages.find((i) => i._id === img._id);
                const selIndex = selectedImages.findIndex((i) => i._id === img._id);

                return (
                  <button
                    key={img._id}
                    type="button"
                    onClick={() => toggleImage(img)}
                    className={`relative rounded-lg overflow-hidden border-2 transition ${
                      isSelected
                        ? "border-[var(--color-primary)]"
                        : "border-[var(--border-color)] hover:border-[var(--border-color-secondary)]"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.altText || "media"}
                      className="h-20 w-full object-cover"
                    />

                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-[var(--color-primary)] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {selIndex + 1}
                      </div>
                    )}

                    {isSelected && selIndex === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-primary)]/90 text-white text-[9px] font-bold text-center py-0.5">
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

      {selectedImages.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
            Selected Images ({selectedImages.length})
          </p>

          <div className="flex gap-3 flex-wrap">
            {selectedImages.map((img, index) => (
              <div key={img._id} className="relative group">
                <img
                  src={img.url}
                  alt={img.altText || "selected"}
                  className={`h-20 w-20 object-cover rounded-lg border-2 ${
                    img.isPrimary
                      ? "border-[var(--color-primary)]"
                      : "border-[var(--border-color)]"
                  }`}
                />

                {img.isPrimary && (
                  <span className="absolute bottom-0 left-0 right-0 text-center bg-[var(--color-primary)] text-white text-[9px] font-bold py-0.5 rounded-b-lg">
                    PRIMARY
                  </span>
                )}

                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(img._id)}
                    className="absolute bottom-0 left-0 right-0 text-center bg-black/60 text-white text-[9px] font-bold py-0.5 rounded-b-lg opacity-0 group-hover:opacity-100 transition"
                  >
                    Set Primary
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => removeSelected(img._id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold leading-none hover:bg-red-600 transition"
                >
                  ×
                </button>

                <span className="absolute top-1 left-1 bg-black/50 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-[var(--text-muted)] mt-2">
            Hover an image to set it as primary. First selected is primary by default.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Product Form ─────────────────────────────────────────────────────────────

function ProductForm({ initial, onSubmit, onClose, loading, categories = [] }) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [variants, setVariants] = useState(initial?.variants || []);
  const [selectedImages, setSelectedImages] = useState(
    initial?.images?.map((img, idx) => ({ ...img, sortOrder: idx + 1 })) || []
  );
  const [newV, setNewV] = useState(EMPTY_VARIANT);
  const [variantError, setVariantError] = useState("");
  const [formError, setFormError] = useState("");

  // MAIN CATEGORIES
const mainCategories = categories.filter((c) => c.parent === null);

// SUBCATEGORIES based on selected category
const subCategories = categories.filter(
  (c) =>
    c.parent &&
    c.parent.toLowerCase() === form.category.toLowerCase()
);

  const set = (key) => (e) => {
    const value = e.target.value;

    if (key === "name") {
  setForm((f) => ({
    ...f,
    name: value,
    slug: generateSlug(value),
  }));
  return;
}

if (key === "category") {
  setForm((f) => ({
    ...f,
    category: value,
    subCategory: "" // reset subcategory
  }));
  return;
}

    setForm((f) => ({ ...f, [key]: value }));
  };

  const setN = (key) => (e) => setNewV((v) => ({ ...v, [key]: e.target.value }));

  const addVariant = () => {
    if (!newV.sku.trim()) {
      setVariantError("SKU is required");
      return;
    }
    if (!newV.size.trim()) {
      setVariantError("Size is required");
      return;
    }

    setVariantError("");
    setVariants((v) => [...v, { ...newV }]);
    setNewV(EMPTY_VARIANT);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim() || !form.category) {
      setFormError("Name and Category are required.");
      setTab(0);
      return;
    }

    setFormError("");

    const payload = {
      ...form,
      isFeatured: form.isFeatured === "true",
      tags:
        typeof form.tags === "string"
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : form.tags,
      badges:
        typeof form.badges === "string"
          ? form.badges.split(",").map((b) => b.trim()).filter(Boolean)
          : form.badges,
      clothDetails: {
        material: form.material,
        fit: form.fit,
        sleeve: form.sleeve,
        washCare: form.washCare,
      },
      variants,
      images: selectedImages.map((img) => ({
        url: img.key,
        key: img.key,
        alt: img.altText || "",
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
              tab === i
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--bg-surface-light)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] border border-[var(--border-color)]"
            }`}
          >
            {t}
            {i === 3 && selectedImages.length > 0 && (
              <span className="ml-1 bg-white text-[var(--color-primary)] rounded-full px-1.5 text-[10px]">
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
            <div className="col-span-1 sm:col-span-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold px-4 py-2 rounded-lg">
              {formError}
            </div>
          )}

          <Field label="Name *">
            <div>
              <Input value={form.name} onChange={set("name")} placeholder="Product name" />
              {form.slug && (
                <p className="text-xs mt-1 text-[var(--text-muted)]">
                  slug: <span className="text-[var(--color-primary)]">{form.slug}</span>
                </p>
              )}
            </div>
          </Field>

          <Field label="Brand">
            <Input value={form.brand} onChange={set("brand")} placeholder="Brand name" />
          </Field>

        <Field label="Category *">
  <SelectUI value={form.category} onChange={set("category")}>
    <option value="">Select category</option>

    {mainCategories
      .filter((c) => c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => (
        <option key={c._id} value={c.name}>
          {c.name}
        </option>
      ))}

  </SelectUI>
</Field>

         <Field label="Sub Category">
  <SelectUI value={form.subCategory} onChange={set("subCategory")}>

    <option value="">Select sub category</option>

    {subCategories.map((c) => (
      <option key={c._id} value={c.name}>
        {c.name}
      </option>
    ))}

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

          <Field label="Tags (comma separated)">
            <Input value={form.tags} onChange={set("tags")} placeholder="cotton, summer" />
          </Field>

          <Field label="Badges (comma separated)">
            <Input value={form.badges} onChange={set("badges")} placeholder="New, Sale" />
          </Field>

          <div className="col-span-1 sm:col-span-2">
            <Field label="Short Description">
              <Input value={form.shortDescription} onChange={set("shortDescription")} placeholder="One liner" />
            </Field>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Field label="Description">
              <Textarea value={form.description} onChange={set("description")} placeholder="Full product description" />
            </Field>
          </div>
        </div>
      )}

      {/* ── Cloth Details ── */}
      {tab === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Material">
            <Input value={form.material} onChange={set("material")} placeholder="e.g. 100% Cotton" />
          </Field>

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

          <Field label="Wash Care">
            <Input value={form.washCare} onChange={set("washCare")} placeholder="e.g. Machine wash cold" />
          </Field>
        </div>
      )}

      {/* ── Variants ── */}
      {tab === 2 && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <Field label="SKU *">
              <Input value={newV.sku} onChange={setN("sku")} placeholder="SKU-001" />
            </Field>

            <Field label="Size *">
              <Input value={newV.size} onChange={setN("size")} placeholder="M" />
            </Field>

            <Field label="Colour">
              <Input value={newV.colour} onChange={setN("colour")} placeholder="Blue" />
            </Field>

            <Field label="Hex Colour">
              <input
                type="color"
                value={newV.hex}
                onChange={setN("hex")}
                className="w-full h-10 border border-[var(--border-color)] rounded-lg cursor-pointer p-1 bg-[var(--bg-surface-light)]"
              />
            </Field>

            <Field label="MRP">
              <Input type="number" value={newV.mrp} onChange={setN("mrp")} placeholder="999" />
            </Field>

            <Field label="Price">
              <Input type="number" value={newV.price} onChange={setN("price")} placeholder="799" />
            </Field>

            <Field label="Stock Qty">
              <Input type="number" value={newV.stockQty} onChange={setN("stockQty")} placeholder="50" />
            </Field>

            <Field label="Low Stock Threshold">
              <Input
                type="number"
                value={newV.lowStockThreshold}
                onChange={setN("lowStockThreshold")}
                placeholder="5"
              />
            </Field>
          </div>

          {variantError && (
            <p className="text-red-400 text-xs font-semibold mb-2">{variantError}</p>
          )}

          <button
            type="button"
            onClick={addVariant}
            className="mb-5 px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-lg hover:bg-[var(--color-primary-hover)] transition"
          >
            + Add Variant
          </button>

          {variants.length === 0 && (
            <p className="text-[var(--text-muted)] text-xs">
              No variants added yet. Fill SKU & Size above then click Add Variant.
            </p>
          )}

          {variants.length > 0 && (
            <div className="rounded-lg border border-[var(--border-color)] overflow-x-auto bg-[var(--bg-surface)]">
              <table className="w-full text-xs">
                <thead className="bg-[var(--bg-surface-light)]">
                  <tr>
                    {["SKU", "Size", "Colour", "MRP", "Price", "Stock", ""].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left font-semibold text-[var(--text-muted)]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {variants.map((v, i) => (
                    <tr key={i} className="border-t border-[var(--border-color)]">
                      <td className="px-3 py-2 font-mono text-[var(--text-primary)]">{v.sku}</td>
                      <td className="px-3 py-2 text-[var(--text-secondary)]">{v.size}</td>
                      <td className="px-3 py-2 text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full border border-[var(--border-color)] flex-shrink-0"
                            style={{ background: v.hex }}
                          />
                          {v.colour}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[var(--text-secondary)]">₹{v.mrp}</td>
                      <td className="px-3 py-2 text-[var(--text-secondary)]">₹{v.price}</td>
                      <td className="px-3 py-2 text-[var(--text-secondary)]">{v.stockQty}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setVariants((vl) => vl.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-500 font-bold text-base leading-none"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Images ── */}
      {tab === 3 && (
        <MediaPicker selectedImages={selectedImages} setSelectedImages={setSelectedImages} />
      )}

      {/* ── SEO ── */}
      {tab === 4 && (
        <div className="flex flex-col gap-4">
          <Field label="SEO Title">
            <Input value={form.seoTitle} onChange={set("seoTitle")} placeholder="SEO Title" />
          </Field>

          <Field label="SEO Description">
            <Textarea value={form.seoDescription} onChange={set("seoDescription")} placeholder="Meta description" />
          </Field>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-7 pt-5 border-t border-[var(--border-color)]">
        <button
          type="button"
          onClick={() => setTab((t) => Math.max(0, t - 1))}
          className={`px-5 py-2 border border-[var(--border-color)] rounded-lg text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition ${
            tab === 0 ? "invisible" : ""
          }`}
        >
          ← Back
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-[var(--border-color)] rounded-lg text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition"
          >
            Cancel
          </button>

          {tab < TABS.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                if (tab === 0 && (!form.name.trim() || !form.slug.trim() || !form.category)) {
                  setFormError("Name and Category are required.");
                  return;
                }
                setFormError("");
                setTab((t) => t + 1);
              }}
              className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-bold hover:bg-[var(--color-primary-hover)] transition"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-bold hover:bg-[var(--color-primary-hover)] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Product"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductForm;