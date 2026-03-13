import { apiSlice } from "../../app/api/apiSlice";

export const mediaApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /* Upload Media */

    uploadMedia: builder.mutation({
      query: (formData) => ({
        url: "/media/upload-media",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Media"],
    }),

    /* Update Media */

    updateMedia: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/media/update-media/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Media"],
    }),

    /* Get All Media */

    getAllMedia: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/media/get-all-media?page=${page}&limit=${limit}`,
      providesTags: ["Media"],
    }),

    /* Get Media By Entity */

    getMediaByEntity: builder.query({
      query: (entityId) => `/media/entity/${entityId}`,
      providesTags: ["Media"],
    }),

    /* Delete Media */

    deleteMedia: builder.mutation({
      query: (id) => ({
        url: `/media/delete-media/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Media"],
    }),

  }),
});

export const {
  useUploadMediaMutation,
  useUpdateMediaMutation,
  useGetAllMediaQuery,
  useGetMediaByEntityQuery,
  useDeleteMediaMutation,
} = mediaApiSlice;