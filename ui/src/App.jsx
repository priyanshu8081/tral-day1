import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import ProtectedRoute, { PublicRoute } from './components/ProtectedRoute';
import AddProduct from './components/AddProduct';
import ProductList from './components/PrdouctList';
import './App.css'
const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* public  */}
        <Route path='/' element={<PublicRoute><Login /></PublicRoute>} />
        <Route path='/register' element={<Register />} />

        {/* protected */}
        <Route path='/dashboard' element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path='/addProduct' element={
          <ProtectedRoute>
            <AddProduct />
          </ProtectedRoute>
        } />
        <Route path='/listProduct' element={
          <ProtectedRoute>
            <ProductList />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
