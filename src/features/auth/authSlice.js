import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("admin")) || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {

    setCredentials: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("admin", JSON.stringify(action.payload));
    },

    logout: (state) => {
      state.user = null;
      localStorage.removeItem("admin");
    },

  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;