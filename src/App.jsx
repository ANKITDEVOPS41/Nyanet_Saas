import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

const Beneficiary = lazy(() => import("./pages/Beneficiary"));
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Officer = lazy(() => import("./pages/Officer"));
const ShopOwner = lazy(() => import("./pages/ShopOwner"));

export default function App() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<LoadingSpinner label="Loading NyayaNet" />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute roles={["beneficiary", "shopowner"]} />}>
            <Route path="/beneficiary" element={<Beneficiary />} />
          </Route>

          <Route element={<ProtectedRoute roles={["shopowner"]} />}>
            <Route path="/shop" element={<ShopOwner />} />
            <Route path="/shopowner" element={<ShopOwner />} />
          </Route>

          <Route element={<ProtectedRoute roles={["officer"]} />}>
            <Route path="/officer" element={<Officer />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
