import { useState } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { z } from "zod";

import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "../../features/products/productApiSlice";

import { useGetCategoriesQuery } from "../../features/category/categoryApiSlice";

import {
  useGetAllMediaQuery,
  useGetMediaByEntityQuery,
} from "../../features/media/mediaApiSlice";

import { generateSlug } from "../../utils/slugify";

const productSchema = z.object({
  name: z.string().min(2),
  brand: z.string().optional(),
  category: z.string(),
  subCategory: z.string().optional(),
});

const ProductModal = ({ close, product }) => {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedImages, setSelectedImages] = useState(product?.images || []);

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const { data: categories } = useGetCategoriesQuery();

  const { data: mediaFolders } = useGetAllMediaQuery({
    page: 1,
    limit: 50,
  });

  const { data: mediaImages } = useGetMediaByEntityQuery(selectedFolder, {
    skip: !selectedFolder,
  });

  const initialValues = {
    name: product?.name || "",
    shortDescription: product?.shortDescription || "",
    description: product?.description || "",
    brand: product?.brand || "",

    category: product?.category || "",
    subCategory: product?.subCategory || "",

    variants: product?.variants || [
      {
        sku: "",
        size: "",
        colour: "",
        hex: "",
        mrp: "",
        price: "",
        stockQty: "",
        lowStockThreshold: "",
        status: "active",
      },
    ],

    tags: product?.tags || [],

    clothDetails: {
      material: product?.clothDetails?.material || "",
      fit: product?.clothDetails?.fit || "",
      sleeve: product?.clothDetails?.sleeve || "",
      washCare: product?.clothDetails?.washCare || "",
      sizeChartImage: product?.clothDetails?.sizeChartImage || "",
    },

    isFeatured: product?.isFeatured ?? false,
    badges: product?.badges || [],

    visibility: product?.visibility || "public",
    status: product?.status || "active",

    seoTitle: product?.seoTitle || "",
    seoDescription: product?.seoDescription || "",
  };

  const toggleImage = (img) => {
    const exists = selectedImages.find((i) => i.url === img.url);

    if (exists) {
      setSelectedImages(selectedImages.filter((i) => i.url !== img.url));
    } else {
      setSelectedImages([
        ...selectedImages,
        {
          url: img.url,
          alt: "",
          isPrimary: selectedImages.length === 0,
          sortOrder: selectedImages.length + 1,
        },
      ]);
    }
  };

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      images: selectedImages,
      slug: generateSlug(values.name),
    };

    if (product) {
      await updateProduct({
        id: product._id,
        data: payload,
      }).unwrap();
    } else {
      await createProduct(payload);
    }

    close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="surface p-6 rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg mb-4">
          {product ? "Update Product" : "Create Product"}
        </h2>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={toFormikValidationSchema(productSchema)}
          onSubmit={handleSubmit}
        >
          {({ values }) => (
            <Form className="space-y-6">
              {/* BASIC INFO */}

              <div className="space-y-3">
                <Field
                  name="name"
                  placeholder="Product Name"
                  className="input w-full"
                />

                <div className="text-xs">Slug: {generateSlug(values.name)}</div>

                <Field
                  name="brand"
                  placeholder="Brand"
                  className="input w-full"
                />

                <Field
                  name="shortDescription"
                  placeholder="Short Description"
                  className="input w-full"
                />

                <Field
                  name="description"
                  as="textarea"
                  placeholder="Description"
                  className="input w-full"
                />
              </div>

              {/* CATEGORY */}

              <div>
                <Field as="select" name="category" className="input w-full">
                  <option value="">Select Category</option>

                  {categories?.data?.categories
                    ?.filter((c) => !c.parent)
                    .map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                </Field>
              </div>

              {/* MEDIA */}

              <div>
                <select
                  className="input w-full"
                  onChange={(e) => setSelectedFolder(e.target.value)}
                >
                  <option value="">Select Media Folder</option>

                  {mediaFolders?.data?.map((folder) => (
                    <option key={folder._id} value={folder.entityId}>
                      {folder.baseName}
                    </option>
                  ))}
                </select>

                {mediaImages?.data?.images && (
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {mediaImages.data.images.map((img) => {
                      const selected = selectedImages.find(
                        (i) => i.url === img.url,
                      );

                      return (
                        <button
                          key={img._id}
                          type="button"
                          onClick={() => toggleImage(img)}
                        >
                          <img
                            src={img.url}
                            className={`h-20 w-full object-cover rounded border
                            ${
                              selected
                                ? "border-[var(--color-primary)]"
                                : "border-gray-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SELECTED IMAGES */}

              {selectedImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm mb-2">Selected Images</p>

                  <div className="flex gap-2 flex-wrap">
                    {selectedImages.map((img, index) => (
                      <div key={img.url} className="relative">
                        <img
                          src={img.url}
                          className="h-20 w-20 object-cover rounded"
                        />

                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-1 text-xs"
                          onClick={() => {
                            const updated = selectedImages.filter(
                              (i) => i.url !== img.url,
                            );

                            const reordered = updated.map((i, idx) => ({
                              ...i,
                              sortOrder: idx + 1,
                              isPrimary: idx === 0,
                            }));

                            setSelectedImages(reordered);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VARIANTS */}

              <FieldArray name="variants">
                {({ push, remove }) => (
                  <div className="space-y-3">
                    {values.variants.map((v, i) => (
                      <div key={i} className="grid grid-cols-4 gap-2">
                        <Field
                          name={`variants.${i}.sku`}
                          placeholder="SKU"
                          className="input"
                        />
                        <Field
                          name={`variants.${i}.size`}
                          placeholder="Size"
                          className="input"
                        />
                        <Field
                          as="select"
                          name={`variants.${i}.size`}
                          className="input"
                        >
                          <option value="">Size</option>
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </Field>
                        <Field
                          name={`variants.${i}.colour`}
                          placeholder="Colour"
                          className="input"
                        />
                        <Field
                          name={`variants.${i}.hex`}
                          placeholder="Hex"
                          className="input"
                        />

                        <Field
                          name={`variants.${i}.mrp`}
                          placeholder="MRP"
                          className="input"
                        />
                        <Field
                          name={`variants.${i}.price`}
                          placeholder="Price"
                          className="input"
                        />
                        <Field
                          name={`variants.${i}.stockQty`}
                          placeholder="Stock"
                          className="input"
                        />
                        <Field
                          name={`variants.${i}.lowStockThreshold`}
                          placeholder="Low Stock"
                          className="input"
                        />

                        {values.variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            className="text-red-500 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() =>
                        push({
                          sku: "",
                          size: "",
                          colour: "",
                          hex: "",
                          mrp: "",
                          price: "",
                          stockQty: "",
                          lowStockThreshold: "",
                          status: "active",
                        })
                      }
                    >
                      Add Variant
                    </button>
                  </div>
                )}
              </FieldArray>

              {/* CLOTH DETAILS */}

              <div className="grid grid-cols-2 gap-3">
                <Field
                  name="clothDetails.material"
                  placeholder="Material"
                  className="input"
                />
                <Field as="select" name="clothDetails.fit" className="input">
                  <option value="">Fit</option>
                  <option value="Regular">Regular</option>
                  <option value="Slim">Slim</option>
                  <option value="Oversized">Oversized</option>
                </Field>
                <Field as="select" name="clothDetails.sleeve" className="input">
                  <option value="">Sleeve</option>
                  <option value="Half">Half</option>
                  <option value="Full">Full</option>
                  <option value="Sleeveless">Sleeveless</option>
                </Field>
                <Field
                  name="clothDetails.washCare"
                  placeholder="Wash Care"
                  className="input"
                />
              </div>

              {/* SETTINGS */}

              <div className="flex gap-4">
                <label>
                  <Field type="checkbox" name="isFeatured" />
                  Featured
                </label>
              </div>
              {/* TAGS */}

              <FieldArray name="tags">
                {({ push, remove }) => (
                  <div>
                    <p className="text-sm mb-2">Tags</p>

                    <div className="flex gap-2 flex-wrap">
                      {values.tags.map((tag, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <Field
                            name={`tags.${index}`}
                            className="input w-32"
                          />

                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-500"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        className="btn-secondary text-xs"
                        onClick={() => push("")}
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>
                )}
              </FieldArray>

              {/* SEO */}

              <div className="space-y-2">
                <Field
                  name="seoTitle"
                  placeholder="SEO Title"
                  className="input w-full"
                />

                <Field
                  name="seoDescription"
                  placeholder="SEO Description"
                  as="textarea"
                  className="input w-full"
                />
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={close}>
                  Cancel
                </button>

                <button type="submit" className="btn-primary">
                  {product ? "Update" : "Create"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ProductModal;
