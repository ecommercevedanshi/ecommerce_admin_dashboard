// import { useState } from "react";

// import { useUploadMediaMutation } from "../../features/media/mediaApiSlice";
// import { useGetCategoriesQuery } from "../../features/category/categoryApiSlice";

// const UploadMediaModal = ({ close }) => {

//   const [files, setFiles] = useState([]);

//   const [form, setForm] = useState({
//     baseName: "",
//     entityType: "",
//     // category: "",
//     alt: "",
//   });

//   const [uploadMedia] = useUploadMediaMutation();
//   const { data: categories } = useGetCategoriesQuery();

//   const mainCategories =
//   categories?.data?.categories?.filter((c) => !c.parent) || [];

//   const handleSubmit = async () => {

//     const formData = new FormData();

//     formData.append("baseName", form.baseName);
//     formData.append("entityType", form.entityType);
//     // formData.append("category", form.category);
//     formData.append("alt", form.alt);

//     files.forEach((file) => {
//       formData.append("files", file);
//     });

//     await uploadMedia(formData).unwrap();

//     close();
//   };

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black/60">

//       <div className="surface p-6 rounded-lg w-[420px] space-y-4">

//         <h2 className="text-lg">Upload Media</h2>

//         {/* Base Name */}

//         <input
//           placeholder="Base Name"
//           className="input w-full"
//           value={form.baseName}
//           onChange={(e) =>
//             setForm({ ...form, baseName: e.target.value })
//           }
//         />

//         {/* Entity Type */}

//         <select
//   className="input w-full"
//   value={form.entityType}
//   onChange={(e) =>
//     setForm({ ...form, entityType: e.target.value })
//   }
// >
//   <option value="">Select Category</option>

//   {mainCategories.map((cat) => (
//     <option key={cat._id} value={cat.name}>
//       {cat.name}
//     </option>
//   ))}
// </select>

//         {/* Category */}

//         {/* <input
//           placeholder="Category"
//           className="input w-full"
//           value={form.category}
//           onChange={(e) =>
//             setForm({ ...form, category: e.target.value })
//           }
//         /> */}

//         {/* Alt */}

//         <input
//           placeholder="Alt (optional)"
//           className="input w-full"
//           value={form.alt}
//           onChange={(e) =>
//             setForm({ ...form, alt: e.target.value })
//           }
//         />

//         {/* File Upload */}

//         <input
//           type="file"
//           multiple
//           onChange={(e) => setFiles([...e.target.files])}
//         />

//         {/* Buttons */}

//         <div className="flex justify-end gap-3">

//           <button className="btn-secondary" onClick={close}>
//             Cancel
//           </button>

//           <button className="btn-primary" onClick={handleSubmit}>
//             Upload
//           </button>

//         </div>

//       </div>

//     </div>
//   );
// };

// export default UploadMediaModal;

import { Formik, Form, Field, ErrorMessage } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { z } from "zod";

import {
  useUploadMediaMutation,
  useUpdateMediaMutation
} from "../../features/media/mediaApiSlice";

import { useGetCategoriesQuery } from "../../features/category/categoryApiSlice";
import { useState } from "react";
import { useSelector } from "react-redux";

const uploadMediaSchema = z.object({
  baseName: z.string().min(2, "Base name required"),
  entityType: z.string().min(1, "Select a category"),
  alt: z.string().optional(),
  files: z.array(z.any()).optional(),
});

const UploadMediaModal = ({ close, media }) => {

  const [uploadMedia] = useUploadMediaMutation();
  const [updateMedia] = useUpdateMediaMutation();
  const [removedImages, setRemovedImages] = useState([]);

  const { data: categories } = useGetCategoriesQuery();

  const user = useSelector((state) => state.auth) || localStorage.getItem("admin");

  const entityId = user?.user?.id || user?.id;

  // console.log(entityId)

  const mainCategories =
    categories?.data?.categories?.filter((c) => !c.parent) || [];

  const initialValues = {
    baseName: media?.baseName || "",
    entityType: media?.entityType || "",
   alt: media?.images?.[0]?.altText || "",
    files: [],
  };

  const handleRemoveExisting = (id) => {
  setRemovedImages((prev) => [...prev, id]);
};

  const handleSubmit = async (values) => {

  const formData = new FormData();

  formData.append("baseName", values.baseName);
  formData.append("entityType", values.entityType);
  formData.append("entityId", entityId);

  if (values.alt) {
    formData.append("alt", values.alt);
  }

  values.files.forEach((file) => {
    formData.append("files[]", file);
  });

  if (removedImages.length > 0) {
    formData.append("removeImages", JSON.stringify(removedImages));
  }

  if (media) {
    await updateMedia({
      id: media._id,
      formData
    }).unwrap();
  } else {
    await uploadMedia(formData).unwrap();
  }

  close();
};

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">

      <div className="surface p-6 rounded-lg w-[420px] space-y-4">

        <h2 className="text-lg">
          {media ? "Update Media" : "Upload Media"}
        </h2>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={toFormikValidationSchema(uploadMediaSchema)}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => {

            const handleRemoveFile = (index) => {
              const updated = [...values.files];
              updated.splice(index, 1);
              setFieldValue("files", updated);
            };

            return (
              <Form className="space-y-4">

                {/* Base Name */}
                <div>
                  <Field
                    name="baseName"
                    placeholder="Base Name"
                    className="input w-full"
                  />

                  <ErrorMessage
                    name="baseName"
                    component="div"
                    className="text-red-400 text-xs mt-1"
                  />
                </div>

                {/* Category */}
                <div>

                  <Field
                    as="select"
                    name="entityType"
                    className="input w-full"
                  >
                    <option value="">Select Category</option>

                    {mainCategories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}

                  </Field>

                  <ErrorMessage
                    name="entityType"
                    component="div"
                    className="text-red-400 text-xs mt-1"
                  />

                </div>

                {/* Alt */}
                <div>
                  <Field
                    name="alt"
                    placeholder="Alt text (optional)"
                    className="input w-full"
                  />
                </div>

                {/* File Upload */}
                <div>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setFieldValue(
                        "files",
                        [...values.files, ...Array.from(e.target.files)]
                      )
                    }
                  />

                </div>

                {/* Existing Images (Update Mode) */}
{media?.images?.length > 0 && (

  <div className="space-y-2">

    <p className="text-xs text-[var(--text-muted)]">
      Existing Images
    </p>

    <div className="grid grid-cols-4 gap-2">

      {media.images
        .filter(img => !removedImages.includes(img._id))
        .map((img) => (

        <div key={img._id} className="relative">

          <img
            src={img.url}
            alt={img.altText}
            className="h-16 w-full object-cover rounded"
          />

          <button
            type="button"
            onClick={() => handleRemoveExisting(img._id)}
            className="absolute top-0 right-0 bg-black/70 text-white text-xs px-1 rounded"
          >
            ✕
          </button>

        </div>

      ))}

    </div>

  </div>

)}

{/* Newly Selected Files */}

{values.files.length > 0 && (

  <div className="space-y-2">

    <p className="text-xs text-[var(--text-muted)]">
      New Images
    </p>

    <div className="grid grid-cols-4 gap-2">

      {values.files.map((file, index) => (

        <div key={index} className="relative">

          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="h-16 w-full object-cover rounded"
          />

          <button
            type="button"
            onClick={() => handleRemoveFile(index)}
            className="absolute top-0 right-0 bg-black/70 text-white text-xs px-1 rounded"
          >
            ✕
          </button>

        </div>

      ))}

    </div>

  </div>

)}

                {/* Buttons */}
                <div className="flex justify-end gap-3">

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={close}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {media ? "Update" : "Upload"}
                  </button>

                </div>

              </Form>
            );
          }}
        </Formik>

      </div>

    </div>
  );
};

export default UploadMediaModal;