import { useState, useRef, useEffect } from "react";
import {
  useGetAllCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from "./couponsapislice.js"

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d={d} />
  </svg>
);
const TagIcon = () => <Icon size={15} d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" />;
const PlusIcon = () => <Icon size={15} d="M12 5v14M5 12h14" />;
const SearchIcon = () => <Icon size={14} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />;
const EditIcon = () => <Icon size={13} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />;
const TrashIcon = () => <Icon size={13} d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />;
const XIcon = () => <Icon size={16} d="M18 6L6 18M6 6l12 12" />;
const ChevronIcon = ({ dir = "down" }) => (
  <Icon size={14} d={dir === "down" ? "M6 9l6 6 6-6" : "M18 15l-6-6-6 6"} />
);
const TicketIcon = () => <Icon size={20} d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" />;
const ClockIcon = () => <Icon size={13} d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2" />;
const ZapIcon = () => <Icon size={13} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />;
const UsersIcon = () => <Icon size={13} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const isExpired = (d) => d && new Date(d) < new Date();

const DISCOUNT_BADGE = {
  percentage: { bg: "bg-violet-500/15", text: "text-violet-400", label: "%" },
  flat: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "₹" },
};

const SCOPE_BADGE = {
  all: { bg: "bg-sky-500/15", text: "text-sky-400" },
  specific_products: { bg: "bg-amber-500/15", text: "text-amber-400" },
  category: { bg: "bg-rose-500/15", text: "text-rose-400" },
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  code: "", description: "",
  discountType: "percentage", discountValue: "",
  maxDiscountAmount: "", minOrderAmount: "",
  scope: "all",
  applicableProducts: [], applicableCategories: [],
  startsAt: "", expiresAt: "",
  isActive: true,
  usageLimitTotal: "", usageLimitPerUser: 1,
};

const Field = ({ label, children, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold tracking-widest uppercase text-[#a0a8c0]">
      {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full bg-[#1a1f2e] border border-[#2a3050] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#4a5270] focus:outline-none focus:border-[#6c63ff] transition-colors";
const selectCls = inputCls + " appearance-none cursor-pointer";

const CouponModal = ({ isOpen, onClose, editData, onSuccess }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: updating }] = useUpdateCouponMutation();
  const isLoading = creating || updating;

  useEffect(() => {
    if (editData) {
      setForm({
        ...EMPTY_FORM, ...editData,
        startsAt: editData.startsAt ? editData.startsAt.slice(0, 10) : "",
        expiresAt: editData.expiresAt ? editData.expiresAt.slice(0, 10) : "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editData, isOpen]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxDiscountAmount: form.discountType === "percentage" ? Number(form.maxDiscountAmount) || undefined : undefined,
      usageLimitTotal: Number(form.usageLimitTotal) || undefined,
      usageLimitPerUser: Number(form.usageLimitPerUser) || 1,
    };
    try {
      if (editData) {
        await updateCoupon({ id: editData._id, ...payload }).unwrap();
      } else {
        await createCoupon(payload).unwrap();
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(6,8,18,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-2xl bg-[#0f1221] border border-[#1e2540] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{ boxShadow: "0 0 80px rgba(108,99,255,0.12)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#1e2540]">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#6c63ff]/15 flex items-center justify-center text-[#6c63ff]">
              <TicketIcon />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">{editData ? "Edit Coupon" : "Create Coupon"}</h2>
              <p className="text-xs text-[#5a6080]">{editData ? "Modify existing coupon details" : "Add a new discount coupon"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#1a1f2e] hover:bg-[#252b40] flex items-center justify-center text-[#6070a0] hover:text-white transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-7 py-6 space-y-5 custom-scroll">

          <div className="grid grid-cols-2 gap-4">
            <Field label="Coupon Code" required>
              <input className={inputCls} value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER20" required disabled={!!editData} />
            </Field>
            <Field label="Status">
              <div className="flex gap-2 mt-1">
                {[true, false].map((v) => (
                  <button key={v} type="button"
                    onClick={() => set("isActive", v)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.isActive === v ? (v ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400" : "bg-rose-500/20 border border-rose-500/50 text-rose-400") : "bg-[#1a1f2e] border border-[#2a3050] text-[#5a6080]"}`}>
                    {v ? "Active" : "Inactive"}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <Field label="Description">
            <input className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Short description for this coupon" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Discount Type" required>
              <select className={selectCls} value={form.discountType} onChange={(e) => set("discountType", e.target.value)} required>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </Field>
            <Field label={`Discount Value ${form.discountType === "percentage" ? "(%)" : "(₹)"}`} required>
              <input className={inputCls} type="number" min="0" max={form.discountType === "percentage" ? 100 : undefined}
                value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)}
                placeholder={form.discountType === "percentage" ? "e.g. 20" : "e.g. 100"} required />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Min Order Amount (₹)">
              <input className={inputCls} type="number" min="0" value={form.minOrderAmount}
                onChange={(e) => set("minOrderAmount", e.target.value)} placeholder="e.g. 500" />
            </Field>
            {form.discountType === "percentage" && (
              <Field label="Max Discount Amount (₹)">
                <input className={inputCls} type="number" min="0" value={form.maxDiscountAmount}
                  onChange={(e) => set("maxDiscountAmount", e.target.value)} placeholder="e.g. 200" />
              </Field>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Scope" required>
              <select className={selectCls} value={form.scope} onChange={(e) => set("scope", e.target.value)}>
                <option value="all">All Products</option>
                <option value="specific_products">Specific Products</option>
                <option value="category">Category</option>
              </select>
            </Field>
            <Field label="Usage Limit (Total)">
              <input className={inputCls} type="number" min="0" value={form.usageLimitTotal}
                onChange={(e) => set("usageLimitTotal", e.target.value)} placeholder="Leave empty for unlimited" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Starts At" required>
              <input className={inputCls} type="date" value={form.startsAt}
                onChange={(e) => set("startsAt", e.target.value)} required />
            </Field>
            <Field label="Expires At" required>
              <input className={inputCls} type="date" value={form.expiresAt}
                onChange={(e) => set("expiresAt", e.target.value)} required />
            </Field>
          </div>

          <Field label="Usage Limit Per User">
            <input className={inputCls} type="number" min="1" value={form.usageLimitPerUser}
              onChange={(e) => set("usageLimitPerUser", e.target.value)} placeholder="1" />
          </Field>

        </form>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-[#1e2540] flex justify-end gap-3">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#1a1f2e] border border-[#2a3050] text-sm text-[#8090b0] hover:text-white hover:border-[#3a4060] transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#5a52d5] text-sm font-bold text-white transition-all disabled:opacity-50 flex items-center gap-2">
            {isLoading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {editData ? "Save Changes" : "Create Coupon"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirm ───────────────────────────────────────────────────────────
const DeleteModal = ({ coupon, onClose, onConfirm, isLoading }) => {
  if (!coupon) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(6,8,18,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-sm bg-[#0f1221] border border-[#1e2540] rounded-2xl p-7 text-center"
        style={{ boxShadow: "0 0 60px rgba(239,68,68,0.1)" }}>
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 text-rose-400">
          <TrashIcon />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Delete Coupon?</h3>
        <p className="text-sm text-[#6070a0] mb-6">
          <span className="font-mono font-bold text-white">{coupon.code}</span> will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[#1a1f2e] border border-[#2a3050] text-sm text-[#8090b0] hover:text-white transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-sm font-bold text-white transition-all disabled:opacity-50">
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatBlock = ({ label, value, icon, color }) => (
  <div className="relative bg-[#0f1221] border border-[#1e2540] rounded-2xl px-6 py-5 overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 ${color} opacity-10 blur-2xl`} />
    <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-3 ${color} bg-opacity-15`}>
      <span className={color}>{icon}</span>
    </div>
    <div className="text-2xl font-black text-white mb-0.5">{value}</div>
    <div className="text-xs text-[#5a6080] font-medium tracking-wide">{label}</div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Coupons = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const LIMIT = 10;

  const { data, isLoading, isFetching } = useGetAllCouponsQuery({
    page, limit: LIMIT,
    search: search || undefined,
    isActive: filterStatus !== "" ? filterStatus : undefined,
    discountType: filterType || undefined,
  });

  const [deleteCoupon, { isLoading: deleting }] = useDeleteCouponMutation();

  const coupons = data?.coupons || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const activeCoupons = coupons.filter((c) => c.isActive && !isExpired(c.expiresAt)).length;
  const expiredCoupons = coupons.filter((c) => isExpired(c.expiresAt)).length;
  const totalUsed = coupons.reduce((s, c) => s + (c.usedCount || 0), 0);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleEdit = (coupon) => { setEditData(coupon); setModalOpen(true); };
  const handleCreate = () => { setEditData(null); setModalOpen(true); };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteCoupon(deleteTarget._id).unwrap();
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-[#080a14] text-white p-6 space-y-6"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Coupon Management</h1>
          <p className="text-sm text-[#5a6080] mt-0.5">Create and manage discount codes for your store</p>
        </div>
        <button onClick={handleCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#5a52d5] text-sm font-bold text-white transition-all shadow-lg shadow-[#6c63ff]/25">
          <PlusIcon /> New Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBlock label="Total Coupons" value={total} icon={<TagIcon />} color="text-violet-400" />
        <StatBlock label="Active Coupons" value={activeCoupons} icon={<ZapIcon />} color="text-emerald-400" />
        <StatBlock label="Expired Coupons" value={expiredCoupons} icon={<ClockIcon />} color="text-rose-400" />
        <StatBlock label="Total Used" value={totalUsed} icon={<UsersIcon />} color="text-sky-400" />
      </div>

      {/* Filters */}
      <div className="bg-[#0f1221] border border-[#1e2540] rounded-2xl px-5 py-4 flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-48 max-w-xs bg-[#1a1f2e] border border-[#2a3050] rounded-xl px-3 py-2">
          <SearchIcon />
          <input
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#4a5270] outline-none"
            placeholder="Search code..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
          />
        </form>

        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="bg-[#1a1f2e] border border-[#2a3050] rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="bg-[#1a1f2e] border border-[#2a3050] rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer">
          <option value="">All Types</option>
          <option value="percentage">Percentage</option>
          <option value="flat">Flat</option>
        </select>

        {(search || filterStatus || filterType) && (
          <button onClick={() => { setSearch(""); setSearchInput(""); setFilterStatus(""); setFilterType(""); setPage(1); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a1f2e] border border-[#2a3050] text-xs text-[#8090b0] hover:text-white transition-colors">
            <XIcon /> Clear
          </button>
        )}

        <span className="ml-auto text-xs text-[#4a5270]">
          {total} coupon{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-[#0f1221] border border-[#1e2540] rounded-2xl overflow-hidden">
        <div className={`transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2540]">
                {["Code", "Discount", "Scope", "Usage", "Validity", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-semibold tracking-widest uppercase text-[#4a5270]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#1a1f2e]">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-[#1a1f2e] rounded-lg animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-[#4a5270]">
                    <div className="flex flex-col items-center gap-2">
                      <TicketIcon />
                      <span>No coupons found</span>
                    </div>
                  </td>
                </tr>
              ) : coupons.map((coupon, i) => {
                const expired = isExpired(coupon.expiresAt);
                const db = DISCOUNT_BADGE[coupon.discountType] || DISCOUNT_BADGE.flat;
                const sb = SCOPE_BADGE[coupon.scope] || SCOPE_BADGE.all;
                const usedPct = coupon.usageLimitTotal
                  ? Math.min(100, Math.round((coupon.usedCount || 0) / coupon.usageLimitTotal * 100))
                  : null;

                return (
                  <tr key={coupon._id}
                    className="border-b border-[#1a1f2e] hover:bg-[#131826] transition-colors group">
                    {/* Code */}
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-white tracking-wider text-xs bg-[#1a1f2e] px-3 py-1.5 rounded-lg border border-[#2a3050]">
                        {coupon.code}
                      </span>
                    </td>
                    {/* Discount */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${db.bg} ${db.text}`}>
                        {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                        <span className="opacity-60 font-normal">{coupon.discountType}</span>
                      </span>
                    </td>
                    {/* Scope */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${sb.bg} ${sb.text}`}>
                        {coupon.scope === "specific_products" ? "Products" : coupon.scope === "category" ? "Category" : "All"}
                      </span>
                    </td>
                    {/* Usage */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-white font-semibold">
                          {coupon.usedCount || 0}
                          {coupon.usageLimitTotal && <span className="text-[#4a5270] font-normal"> / {coupon.usageLimitTotal}</span>}
                        </span>
                        {usedPct !== null && (
                          <div className="w-20 h-1 bg-[#1e2540] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${usedPct >= 80 ? "bg-rose-400" : "bg-violet-500"}`}
                              style={{ width: `${usedPct}%` }} />
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Validity */}
                    <td className="px-5 py-4">
                      <div className="text-xs space-y-0.5">
                        <div className="text-[#6070a0]">From <span className="text-white">{formatDate(coupon.startsAt)}</span></div>
                        <div className={expired ? "text-rose-400" : "text-[#6070a0]"}>
                          To <span className={expired ? "text-rose-400 font-semibold" : "text-white"}>{formatDate(coupon.expiresAt)}</span>
                        </div>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      {expired ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          Expired
                        </span>
                      ) : coupon.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1e2540] text-[#6070a0]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6070a0]" />
                          Inactive
                        </span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(coupon)}
                          className="w-7 h-7 rounded-lg bg-[#1a1f2e] border border-[#2a3050] hover:border-[#6c63ff] hover:text-[#6c63ff] flex items-center justify-center text-[#6070a0] transition-all">
                          <EditIcon />
                        </button>
                        <button onClick={() => setDeleteTarget(coupon)}
                          className="w-7 h-7 rounded-lg bg-[#1a1f2e] border border-[#2a3050] hover:border-rose-500/50 hover:text-rose-400 flex items-center justify-center text-[#6070a0] transition-all">
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-[#1e2540]">
            <span className="text-xs text-[#4a5270]">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-[#1a1f2e] border border-[#2a3050] text-xs text-[#8090b0] hover:text-white disabled:opacity-40 transition-all">
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === page ? "bg-[#6c63ff] text-white border border-[#6c63ff]" : "bg-[#1a1f2e] border border-[#2a3050] text-[#8090b0] hover:text-white"}`}>
                    {p}
                  </button>
                );
              })}
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-[#1a1f2e] border border-[#2a3050] text-xs text-[#8090b0] hover:text-white disabled:opacity-40 transition-all">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CouponModal isOpen={modalOpen} onClose={() => setModalOpen(false)} editData={editData} />
      <DeleteModal coupon={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleting} />
    </div>
  );
};

export default Coupons;