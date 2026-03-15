// import { apiSlice } from "../../app/api/apiSlice";

// export const categoryApiSlice = apiSlice.injectEndpoints({
//   endpoints: (builder) => ({

//     /* ======================
//        GET ALL CATEGORIES
//     ====================== */

//     getCategories: builder.query({
//       query: () => "/category/admin/categories",
//       providesTags: ["Category"],
//     }),

//     /* ======================
//        GET SINGLE CATEGORY
//     ====================== */

//     getCategoryById: builder.query({
//       query: (id) => `/category/admin/categories/${id}`,
//     }),

//     /* ======================
//        CREATE CATEGORY
//     ====================== */

//     createCategory: builder.mutation({
//       query: (data) => ({
//         url: "/category/admin/create-categories",
//         method: "POST",
//         body: data,
//       }),
//       invalidatesTags: ["Category"],
//     }),

//     /* ======================
//        UPDATE CATEGORY
//     ====================== */

//     updateCategory: builder.mutation({
//       query: ({id, ...data}) => ({
//         url: `/category/admin/update-category/${id}`,
//         method: "PUT",
//         body: data,
//       }),
//       invalidatesTags: ["Category"],
//     }),

//     /* ======================
//        DELETE CATEGORY
//     ====================== */

//     deleteCategory: builder.mutation({
//       query: (id) => ({
//         url: `/category/admin/delete-category/${id}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: ["Category"],
//     }),

//   }),
// });

// export const {
//   useGetCategoriesQuery,
//   useGetCategoryByIdQuery,
//   useCreateCategoryMutation,
//   useUpdateCategoryMutation,
//   useDeleteCategoryMutation,
// } = categoryApiSlice;

import { apiSlice } from "../../app/api/apiSlice";

export const categoryApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        // ── PUBLIC ──────────────────────────────────────────────────────────────

        // GET /categories
        getCategories: builder.query({
            query: () => "/category",
        }),

        // GET /categories/:slug/subcategories
        getSubCategories: builder.query({
            query: (slug) => `/categories/${slug}/subcategories`,
            providesTags: ["Category"],
        }),

        // ── ADMIN ────────────────────────────────────────────────────────────────

        // GET /categories/admin/categories
        adminGetAllCategories: builder.query({
            query: () => "/category/admin/categories",
            providesTags: ["Category"],
        }),

        // GET /categories/admin/categories/:id
        adminGetCategoryById: builder.query({
            query: (id) => `/category/admin/categories/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Category", id }],
        }),

        // POST /categories/admin/create-categories
        createCategory: builder.mutation({
            query: (body) => ({
                url: "/category/admin/create-categories",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Category"],
        }),

        // PUT /categories/admin/update-category/:id
        updateCategory: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/category/admin/update-category/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Category"],
        }),

        // DELETE /categories/admin/delete-category/:id
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
    // Public
    useGetCategoriesQuery,
    useGetSubCategoriesQuery,

    // Admin
    useAdminGetAllCategoriesQuery,
    useAdminGetCategoryByIdQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;