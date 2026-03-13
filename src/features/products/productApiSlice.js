import { apiSlice } from "../../app/api/apiSlice";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getProducts: builder.query({
      query: () => "/products",
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation({
      query: (data) => ({
        url: "/products/admin/create-product",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation({
  query: ({ id, data }) => ({
    url: `/products/admin/update-products/${id}`,
    method: "PUT",
    body: data,
  }),
  invalidatesTags: ["Product"],
}),

  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} = productApiSlice;