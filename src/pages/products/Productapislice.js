import { apiSlice } from "../../app/api/apiSlice";

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ── PRODUCTS ──────────────────────────────────────────────────────────────

    // GET /products/admin/product?page=&limit=&status=
    adminGetAllProducts: builder.query({
      query: ({ page = 1, limit = 20, status, visibility, isArchived } = {}) => {
        const params = new URLSearchParams({ page, limit });

        if (status) params.append("status", status);
        if (visibility) params.append("visibility", visibility);
        if (isArchived !== undefined) params.append("isArchived", isArchived);

        return `/products/admin/product?${params.toString()}`;
      },
      providesTags: ["Product"],
    }),

    // GET /products/admin/products/low-stock
    getLowStockProducts: builder.query({
      query: () => "/products/admin/products/low-stock",
      providesTags: ["Product"],
    }),

    // GET /products/admin/products/:id
    adminGetProductById: builder.query({
      query: (id) => `/products/admin/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),

    // POST /products/admin/create-product
    createProduct: builder.mutation({
      query: (body) => ({
        url: "/products/admin/create-product",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),

    // PUT /products/admin/update-products/:id
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/products/admin/update-products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Product"],
    }),

    // DELETE /products/admin/delete-products/:id
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/admin/delete-products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    // POST /products/admin/upload-images
    uploadProductImages: builder.mutation({
      query: (formData) => ({
        url: "/products/admin/upload-images",
        method: "POST",
        body: formData,
      }),
    }),

    // ── CATEGORIES ────────────────────────────────────────────────────────────

    // GET /categories
    getCategories: builder.query({
      query: () => "/category",
      providesTags: ["Category"],
    }),

    // ── MEDIA ─────────────────────────────────────────────────────────────────

    // GET /media/get-all-media?page=&limit=
    getAllMedia: builder.query({
      query: ({ page = 1, limit = 50 } = {}) =>
        `/media/get-all-media?page=${page}&limit=${limit}`,
      providesTags: ["Media"],
    }),

    // GET /media/entity/:entityId
    getMediaByEntity: builder.query({
      query: (entityId) => `/media/entity/${entityId}`,
      providesTags: (_r, _e, entityId) => [{ type: "Media", id: entityId }],
    }),

  }),
});

export const {
  // Products
  useAdminGetAllProductsQuery,
  useGetLowStockProductsQuery,
  useAdminGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImagesMutation,

  // Categories
  useGetCategoriesQuery,

  // Media
  useGetAllMediaQuery,
  useGetMediaByEntityQuery,
} = productApi;