import { Formik, Form, Field } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { z } from "zod";

import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetCategoriesQuery,
} from "../../features/category/categoryApiSlice";

import {useGetAllMediaQuery, useGetMediaByEntityQuery} from "../../features/media/mediaApiSlice";

import { generateSlug } from "../../utils/slugify";
import { useState } from "react";

const categorySchema = z.object({
  name: z.string().min(2, "Name required"),
  parent: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number(),
  thumbnail: z.string().optional(),
});

const CategoryModal = ({ close, category }) => {
  const [selectedFolder, setSelectedFolder] = useState(null);

  const { data: categories } = useGetCategoriesQuery();
  //   console.log(categories)

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  const { data: mediaFolders } = useGetAllMediaQuery({
  page: 1,
  limit: 50,
});

const { data: mediaImages } = useGetMediaByEntityQuery(
  selectedFolder,
  { skip: !selectedFolder }
);

  const initialValues = {
    name: category?.name || "",
    parent:
  categories?.data?.categories?.find(
    (c) => c.name === category?.parent
  )?.slug || "",
    isActive: category?.isActive ?? true,
    sortOrder: category?.sortOrder || 0,
     thumbnail: category?.thumbnail || "",
  };

  const handleSubmit = async (values) => {
    const parentCategory = categories?.data?.categories?.find(
  (c) => c.slug === values.parent
);
    const payload = {
  ...values,
  slug: generateSlug(values.name),
  parent: values.parent ? parentCategory?.name : null,
  thumbnail: values.thumbnail,
};

    if (category) {
      await updateCategory({
        ...payload,
        id: category._id,
      });
    } else {
      await createCategory(payload).unwrap();
    }

    close();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="surface p-6 rounded-lg w-[420px] h-[60vh] overflow-y-auto">
        <h2 className="text-lg mb-4">
          {category ? "Update Category" : "Create Category"}
        </h2>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={toFormikValidationSchema(categorySchema)}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue  }) => (
            <Form className="space-y-4">
              {/* Name */}

              <div>
                <label className="text-sm">Category Name</label>

                <Field name="name" className="input w-full" />
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
  Slug: {generateSlug(values.name)}
</div>

              {/* Parent */}

              <div>
                <label className="text-sm">Parent Category</label>

                <Field as="select" name="parent" className="input w-full">
                  <option value="">Main Category</option>

                {categories?.data?.categories
  ?.filter(
    (c) =>
      (!c.parent || c.slug === category?.parent) &&
      c._id !== category?._id
  )
  .map((cat) => (
    <option key={cat._id} value={cat.slug}>
      {cat.name}
    </option>
  ))}
                </Field>
              </div>

              <div>
<label className="text-sm">Select Media Folder</label>

<select
  className="input w-full"
  onChange={(e) => setSelectedFolder(e.target.value)}
>

<option value="">Select Folder</option>

{mediaFolders?.data?.map((folder) => (

<option key={folder._id} value={folder._id}>
{folder.baseName}
</option>

))}

</select>
</div>

{mediaImages?.data?.images && (

<div className="grid grid-cols-4 gap-2 mt-3">

{mediaImages.data.images.map((img) => (

<button
type="button"
key={img._id}
onClick={() => setFieldValue("thumbnail", img.url)}
>

<img
src={img.url}
className="h-16 w-full object-cover rounded border"
/>

</button>

))}

</div>

)}
{values.thumbnail && (

<div className="mt-3">

<p className="text-xs text-[var(--text-muted)]">Selected Thumbnail</p>

<img
src={values.thumbnail}
className="h-20 rounded"
/>

</div>

)}

              {/* Sort Order */}

              <div>
                <label className="text-sm">Sort Order</label>

                <Field
                  name="sortOrder"
                  type="number"
                  className="input w-full"
                />
              </div>

              {/* Active */}

              <div className="flex items-center gap-2">
                <Field type="checkbox" name="isActive" />

                <label>Active</label>
              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={close}>
                  Cancel
                </button>

                <button type="submit" className="btn-primary">
                  {category ? "Update" : "Create"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CategoryModal;
