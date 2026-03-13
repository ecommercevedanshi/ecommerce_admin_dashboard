import { Formik, Form, Field, ErrorMessage } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { z } from "zod";
import { useState } from "react";

import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useAdminGetAllCategoriesQuery,
} from "./categoryApiSlice.js"

import {
  useGetAllMediaQuery,
  useGetMediaByEntityQuery,
} from "../../features/media/mediaApiSlice";

import { generateSlug } from "../../utils/slugify";

// ─── Validation ───────────────────────────────────────────────────────────────

const categorySchema = z.object({
  name:      z.string().min(2, "Name must be at least 2 characters"),
  parent:    z.string().optional(),
  isActive:  z.boolean(),
  sortOrder: z.number().min(0),
  thumbnail: z.string().optional(),
});

// ─── CategoryModal ────────────────────────────────────────────────────────────

const CategoryModal = ({ close, category }) => {
  const [selectedFolder, setSelectedFolder] = useState("");
  const [showPicker, setShowPicker]         = useState(false);

  // All categories for parent dropdown (admin endpoint — returns all, not just active)
  const { data: allCategoriesRes } = useAdminGetAllCategoriesQuery();
  const allCategories = allCategoriesRes?.data?.categories || [];

  // Only top-level categories can be parents (no nested subcategories)
  const parentOptions = allCategories.filter(
    (c) => !c.parent && c._id !== category?._id
  );

  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();

  // Media
  const { data: mediaFolders, isLoading: foldersLoading } = useGetAllMediaQuery({ page: 1, limit: 50 });
  const { data: mediaEntityRes, isFetching: imagesLoading } = useGetMediaByEntityQuery(
    selectedFolder,
    { skip: !selectedFolder }
  );
  const folderImages = mediaEntityRes?.data?.images || [];

  // ── Initial values ──
  const initialValues = {
    name:      category?.name      || "",
    // parent stored as name string e.g. "Men"
    parent:    category?.parent    || "",
    isActive:  category?.isActive  ?? true,
    sortOrder: category?.sortOrder || 0,
    thumbnail: category?.thumbnail || "",
  };

  // ── Submit ──
  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const payload = {
        name:      values.name,
        slug:      generateSlug(values.name),
        parent:    values.parent || null,
        isActive:  values.isActive,
        sortOrder: values.sortOrder,
        thumbnail: values.thumbnail || "",
      };

      if (category) {
        await updateCategory({ id: category._id, ...payload }).unwrap();
      } else {
        await createCategory(payload).unwrap();
      }

      close();
    } catch (e) {
      setStatus(e?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = creating || updating;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-gray-800">
            {category ? "Edit Category" : "Create Category"}
          </h2>
          <button
            type="button"
            onClick={close}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
          >&times;</button>
        </div>

        <div className="px-6 py-5">
          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={toFormikValidationSchema(categorySchema)}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, isSubmitting, status }) => (
              <Form className="space-y-4">

                {/* API error */}
                {status && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-2 rounded-lg">
                    {status}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                    Category Name *
                  </label>
                  <Field
                    name="name"
                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg text-sm outline-none focus:border-pink-400 transition"
                    placeholder="e.g. Men"
                  />
                  <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1" />
                  {values.name && (
                    <p className="text-xs text-gray-400 mt-1">
                      Slug: <span className="font-mono text-gray-600">{generateSlug(values.name)}</span>
                    </p>
                  )}
                </div>

                {/* Parent */}
                <div>
                  <label className="text-xs font-semibold  text-gray-500 uppercase tracking-wide block mb-1">
                    Parent Category
                  </label>
                  <Field
                    as="select"
                    name="parent"
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-pink-400 transition"
                  >
                    <option value="">None (Top-level)</option>
                    {parentOptions.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </Field>
                </div>

                {/* Thumbnail picker */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                    Thumbnail
                  </label>

                  {/* Current thumbnail preview */}
                  {values.thumbnail ? (
                    <div className="flex text-black items-center gap-3 mb-3">
                      <img
                        src={values.thumbnail}
                        alt="thumbnail"
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => setShowPicker(!showPicker)}
                          className="text-xs text-pink-500 font-semibold hover:underline"
                        >
                          {showPicker ? "Hide picker" : "Change image"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setFieldValue("thumbnail", ""); setShowPicker(false); }}
                          className="text-xs text-red-400 font-semibold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowPicker(!showPicker)}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-sm text-gray-400 hover:border-pink-300 hover:text-pink-400 transition"
                    >
                      {showPicker ? "Hide picker" : "+ Pick from media library"}
                    </button>
                  )}

                  {/* Media picker panel */}
                  {showPicker && (
                    <div className="mt-3 border border-gray-200 rounded-xl p-4 bg-gray-50">

                      {/* Folder select */}
                      <select
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-pink-400 transition mb-3"
                        value={selectedFolder}
                        onChange={(e) => setSelectedFolder(e.target.value)}
                      >
                        <option value="">Select folder</option>
                        {foldersLoading ? (
                          <option disabled>Loading...</option>
                        ) : (
                          mediaFolders?.data?.map((folder) => (
                            <option key={folder._id} value={folder.entityId}>
                              {folder.baseName} ({folder.entityType})
                            </option>
                          ))
                        )}
                      </select>

                      {/* Images grid */}
                      {selectedFolder && (
                        imagesLoading ? (
                          <p className="text-center text-gray-400 text-xs py-4">Loading images...</p>
                        ) : folderImages.length === 0 ? (
                          <p className="text-center text-gray-400 text-xs py-4">No images in this folder</p>
                        ) : (
                          <div className="grid grid-cols-4 gap-2">
                            {folderImages.map((img) => (
                              <button
                                key={img._id}
                                type="button"
                                onClick={() => {
                                  setFieldValue("thumbnail", img.url);
                                  setShowPicker(false);
                                }}
                                className={`relative rounded-lg overflow-hidden border-2 transition ${
                                  values.thumbnail === img.url
                                    ? "border-pink-500"
                                    : "border-gray-200 hover:border-pink-300"
                                }`}
                              >
                                <img
                                  src={img.url}
                                  alt={img.altText || "media"}
                                  className="h-16 w-full object-cover"
                                />
                                {values.thumbnail === img.url && (
                                  <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                                    <span className="text-pink-600 text-lg font-bold">✓</span>
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Sort Order */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                    Sort Order
                  </label>
                  <Field
                    name="sortOrder"
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-pink-400 transition"
                  />
                  <ErrorMessage name="sortOrder" component="p" className="text-red-500 text-xs mt-1" />
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-3 py-1">
                  <Field
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    className="w-4 h-4 accent-pink-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 font-medium cursor-pointer">
                    Active
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={close}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="px-6 py-2 bg-pink-500 text-white rounded-lg text-sm font-bold hover:bg-pink-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || isLoading
                      ? "Saving..."
                      : category ? "Update" : "Create"}
                  </button>
                </div>

              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;