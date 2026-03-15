import { useState } from "react";
import {
  useAdminGetAllCategoriesQuery,
  useDeleteCategoryMutation,
} from "../../features/category/categoryApiSlice"
import CategoryModal from "../../components/category/CategoryModal"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Badge = ({ active }) => (
  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
    active ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-400"
  }`}>
    {active ? "Active" : "Inactive"}
  </span>
);

// ─── Categories Page ──────────────────────────────────────────────────────────

const Categories = () => {
  const [modal, setModal]       = useState(null);   // null | "create" | "edit" | "delete"
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState("");
  const [filterParent, setFilterParent] = useState("all");  // "all" | "top" | "sub"
  const [toast, setToast]       = useState("");

  const { data: res, isLoading, isError } = useAdminGetAllCategoriesQuery();
  const [deleteCategory, { isLoading: toggling }] = useDeleteCategoryMutation();

  const categories = res?.data?.categories || [];

  // Derived stats
  const topLevel   = categories.filter((c) => !c.parent);
  const subLevel   = categories.filter((c) => !!c.parent);
  const activeCount = categories.filter((c) => c.isActive).length;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const closeModal = () => { setModal(null); setSelected(null); };

  const handleToggle = async (cat) => {
    try {
      const res = await deleteCategory(cat._id).unwrap();
      showToast(res.message || "Status updated");
    } catch (e) {
      showToast(e?.data?.message || "Error updating status");
    }
  };

  // Filter + search
  const filtered = categories
    .filter((c) => {
      if (filterParent === "top") return !c.parent;
      if (filterParent === "sub") return !!c.parent;
      return true;
    })
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.slug || "").toLowerCase().includes(search.toLowerCase())
    );

  // Group: top-level first, then subs indented under their parent
  const grouped = [];
  const topCats = filtered.filter((c) => !c.parent);
  const subCats = filtered.filter((c) => !!c.parent);

  topCats.forEach((top) => {
    grouped.push({ ...top, _isTop: true });
    subCats
      .filter((s) => s.parent === top.name)
      .forEach((sub) => grouped.push({ ...sub, _isTop: false }));
  });
  // Orphaned subs (parent filtered out or not found)
  const orphans = subCats.filter(
    (s) => !topCats.find((t) => t.name === s.parent)
  );
  orphans.forEach((o) => grouped.push({ ...o, _isTop: false }));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-gray-800 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg transition">
          {toast}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total",       value: categories.length, color: "text-gray-800" },
          { label: "Active",      value: activeCount,       color: "text-teal-600" },
          { label: "Top-level",   value: topLevel.length,   color: "text-blue-600" },
          { label: "Sub-categories", value: subLevel.length, color: "text-purple-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{isLoading ? "—" : value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-gray-700">Categories</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-pink-400 w-52"
          />
          <select
            value={filterParent}
            onChange={(e) => setFilterParent(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-pink-400"
          >
            <option value="all">All Types</option>
            <option value="top">Top-level only</option>
            <option value="sub">Sub-categories only</option>
          </select>
          <button
            type="button"
            onClick={() => setModal("create")}
            className="px-4 py-2 bg-pink-500 text-white text-sm font-bold rounded-lg hover:bg-pink-600 transition"
          >
            + Add Category
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading categories...</div>
        ) : isError ? (
          <div className="text-center py-16 text-red-400 text-sm">Failed to load categories.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["", "Name", "Slug", "Parent", "Sort", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grouped.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  grouped.map((cat) => (
                    <tr
                      key={cat._id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition ${
                        !cat._isTop ? "bg-gray-50/40" : ""
                      }`}
                    >
                      {/* Thumbnail */}
                      <td className="px-4 py-3 w-12">
                        {cat.thumbnail ? (
                          <img
                            src={cat.thumbnail}
                            alt={cat.name}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-base">
                            🗂️
                          </div>
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {!cat._isTop && (
                            <span className="text-gray-300 text-base select-none">└</span>
                          )}
                          <div>
                            <p className={`font-semibold text-xs ${cat._isTop ? "text-gray-800" : "text-gray-600"}`}>
                              {cat.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                          {cat.slug}
                        </span>
                      </td>

                      {/* Parent */}
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {cat.parent || <span className="text-gray-300">—</span>}
                      </td>

                      {/* Sort */}
                      <td className="px-4 py-3 text-xs text-gray-400 text-center">
                        {cat.sortOrder}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge active={cat.isActive} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => { setSelected(cat); setModal("edit"); }}
                            className="px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={toggling}
                            onClick={() => handleToggle(cat)}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition disabled:opacity-50 ${
                              cat.isActive
                                ? "border border-red-100 bg-red-50 text-red-500 hover:bg-red-100"
                                : "border border-teal-100 bg-teal-50 text-teal-600 hover:bg-teal-100"
                            }`}
                          >
                            {cat.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === "create" && (
        <CategoryModal close={closeModal} />
      )}

      {modal === "edit" && selected && (
        <CategoryModal close={closeModal} category={selected} />
      )}

    </div>
  );
};

export default Categories;