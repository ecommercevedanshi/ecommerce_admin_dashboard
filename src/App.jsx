import { Route, Routes } from "react-router-dom"
import Products from "./pages/products/Products"
import AdminLayout from "./components/adminlayout/AdminLayout"
import Dashboard from "./pages/dashboard/Dashboard"
import Users from "./pages/users/Users"
import Orders from "./pages/orders/Orders"
import Coupons from "./pages/coupons/Coupons"
import CMS from "./pages/cms/CMS"

function App() {
  
  return (
  <>
  <Routes>

      <Route path="/" element={<AdminLayout />}>

        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="cms" element={<CMS />} />

      </Route>

    </Routes>
  </>
  )
}

export default App
