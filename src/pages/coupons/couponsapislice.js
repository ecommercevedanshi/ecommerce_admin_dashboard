import { apiSlice } from "../../app/api/apiSlice";

export const couponApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        // ───────── ADMIN APIs ─────────

        getAllCoupons: builder.query({
            query: ({
                page = 1,
                limit = 10,
                isActive,
                discountType,
                scope,
                search,
            } = {}) => {
                const params = new URLSearchParams({
                    page,
                    limit,
                });

                if (isActive !== undefined) params.append("isActive", isActive);
                if (discountType) params.append("discountType", discountType);
                if (scope) params.append("scope", scope);
                if (search) params.append("search", search);

                return `/coupons/admin/get-all-coupons?${params.toString()}`;
            },

            providesTags: (result) =>
                result?.coupons
                    ? [
                        ...result.coupons.map(({ _id }) => ({
                            type: "Coupon",
                            id: _id,
                        })),
                        { type: "Coupon", id: "LIST" },
                    ]
                    : [{ type: "Coupon", id: "LIST" }],
        }),

        getCouponById: builder.query({
            query: (id) => `/coupons/admin/get-coupon/${id}`,

            providesTags: (result, error, id) => [
                { type: "Coupon", id },
            ],
        }),

        createCoupon: builder.mutation({
            query: (body) => ({
                url: "/coupons/admin/create-coupon",
                method: "POST",
                body,
            }),

            invalidatesTags: [{ type: "Coupon", id: "LIST" }],
        }),

        updateCoupon: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/coupons/admin/update-coupon/${id}`,
                method: "PUT",
                body,
            }),

            invalidatesTags: (result, error, { id }) => [
                { type: "Coupon", id },
                { type: "Coupon", id: "LIST" },
            ],
        }),

        deleteCoupon: builder.mutation({
            query: (id) => ({
                url: `/coupons/admin/delete-coupon/${id}`,
                method: "DELETE",
            }),

            invalidatesTags: [{ type: "Coupon", id: "LIST" }],
        }),

        // ───────── USER APIs ─────────

        validateCoupon: builder.mutation({
            query: (body) => ({
                url: "/coupons/validate-coupon",
                method: "POST",
                body,
            }),
        }),

        getAvailableCoupons: builder.query({
            query: () => "/coupons/available",

            providesTags: [{ type: "Coupon", id: "AVAILABLE" }],
        }),

        getCouponsForProduct: builder.query({
            query: (productId) => `/coupons/product/${productId}`,
        }),

        getCouponsForCategory: builder.query({
            query: (categoryId) => `/coupons/category/${categoryId}`,
        }),

    }),

    overrideExisting: false,
});

export const {
    useGetAllCouponsQuery,
    useGetCouponByIdQuery,
    useCreateCouponMutation,
    useUpdateCouponMutation,
    useDeleteCouponMutation,
    useValidateCouponMutation,
    useGetAvailableCouponsQuery,
    useGetCouponsForProductQuery,
    useGetCouponsForCategoryQuery,
} = couponApi;