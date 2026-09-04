// Bootstrap removed — using custom CSS design system
import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ProductList from './components/user/PrdouctList';
import { PublicRoutes } from './components/ProtectedRoute';
import './App.css'
import Login from './pages/landing/Login';
import Register from './pages/landing/Register';
import Navbar from './components/landing/Navbar';
import EmployeeList from './components/user/EmployeeList';
import CompanyProfile from './pages/admin/CompanyProfile';
import Dashboard from './components/Admin/Dashboard';
const App = () => {
  const location = useLocation();

  // Navbar Login & Register page par nahi dikhega 
  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/register";
  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* public  */}
        <Route path='/' element={
          <PublicRoutes>
            <Login />
          </PublicRoutes>
        } />
        <Route path='/register' element={<Register />} />

        {/* protected */}
        <Route path='/dashboard' element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path='/listProduct' element={
          <ProtectedRoute>
            <ProductList />
          </ProtectedRoute>
        } />
        <Route path='/employees' element={
          <ProtectedRoute>
            <EmployeeList />
          </ProtectedRoute>
        } />

        <Route path='/company-profile' element={
          <ProtectedRoute>
            <CompanyProfile />
          </ProtectedRoute>
        } />



        {/* Redirect old addProduct route to listProduct */}
        <Route path='/addProduct' element={<Navigate to="/listProduct" replace />} />

        {/* Fallback for unknown routes */}
        <Route path='*' element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
