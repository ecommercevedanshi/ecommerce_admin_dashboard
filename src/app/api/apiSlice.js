import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const apiSlice = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl || "http://localhost:3004/api",
    credentials: "include",

    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.accessToken;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["User", "Auth"],

  endpoints: () => ({}),
});