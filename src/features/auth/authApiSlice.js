import { apiSlice } from "../../app/api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    login: builder.mutation({
      query: (data) => ({
        url: "/user/login",
        method: "POST",
        body: data,
      }),
    }),
    logoutUser: builder.mutation({
  query: () => ({
    url: "/user/logout",
    method: "POST",
  }),
}),

  }),
});

export const { useLoginMutation, useLogoutUserMutation } = authApiSlice;