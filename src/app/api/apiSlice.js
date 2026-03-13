// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// const baseUrl = import.meta.env.VITE_BASE_URL;

// export const apiSlice = createApi({
//   reducerPath: "api",

//   baseQuery: fetchBaseQuery({
//     baseUrl: baseUrl || "http://localhost:3004/api",
//     credentials: "include",

//     prepareHeaders: (headers, { getState }) => {
//       const token = getState()?.auth?.accessToken;

//       if (token) {
//         headers.set("authorization", `Bearer ${token}`);
//       }

//       return headers;
//     },
//   }),

//   tagTypes: ["User", "Auth"],

//   endpoints: () => ({}),
// });

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logout } from "../../features/auth/authSlice";

const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3004/api";

const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: "include",

  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.auth?.user?.token;
    
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  
  let result = await baseQuery(args, api, extraOptions);
  const refreshToken = api.getState()?.auth?.user?.refreshToken;

  // If access token expired
  if (result?.error?.status === 401) {

    console.log("Access token expired. Attempting refresh...");

    // Call refresh endpoint
   const refreshResult = await baseQuery(
  {
    url: "/user/refreshToken",
    method: "POST",
    body: { refreshToken },
  },
  api,
  extraOptions
);

if (refreshResult?.data) {
      // const currentUser = api.getState().auth.user;

      // Store new token
      api.dispatch(
        setCredentials({
    ...api.getState().auth.user,
    token: refreshResult.data.token,
  })
      );

      // Retry original request
      result = await baseQuery(args, api, extraOptions);

    } else {

      // Refresh failed → logout
      api.dispatch(logout());

    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Auth", "Category"],
  endpoints: () => ({}),
});