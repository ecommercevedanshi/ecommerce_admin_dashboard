import { Route, Routes } from "react-router-dom"

import Products from "./pages/products/Products"
import AdminLayout from "./components/adminlayout/AdminLayout"
import Dashboard from "./pages/dashboard/Dashboard"
import Users from "./pages/users/Users"
import Orders from "./pages/orders/Orders"
import Coupons from "./pages/coupons/Coupons"
import CMS from "./pages/cms/CMS"
import Categories from "./pages/category/Categories"
import Media from "./pages/media/Media"

import Login from "./pages/auth/Login"
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {

  return (
    <Routes>

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* PROTECTED ADMIN ROUTES */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="media" element={<Media />} />
        <Route path="categories" element={<Categories />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="cms" element={<CMS />} />

      </Route>

    </Routes>
  );
}

export default App