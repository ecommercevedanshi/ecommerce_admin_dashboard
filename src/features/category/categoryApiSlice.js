import { apiSlice } from "../../app/api/apiSlice";

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /* ======================
       GET ALL CATEGORIES
    ====================== */

    getCategories: builder.query({
      query: () => "/category/admin/categories",
      providesTags: ["Category"],
    }),

    /* ======================
       GET SINGLE CATEGORY
    ====================== */

    getCategoryById: builder.query({
      query: (id) => `/category/admin/categories/${id}`,
    }),

    /* ======================
       CREATE CATEGORY
    ====================== */

    createCategory: builder.mutation({
      query: (data) => ({
        url: "/category/admin/create-categories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    /* ======================
       UPDATE CATEGORY
    ====================== */

    updateCategory: builder.mutation({
      query: ({id, ...data}) => ({
        url: `/category/admin/update-category/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    /* ======================
       DELETE CATEGORY
    ====================== */

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/category/admin/delete-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApiSlice;