import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/ClientsPage'
import ClientFormPage from './pages/ClientFormPage'
import InvoicesListPage from './pages/InvoicesListPage'
import InvoiceFormPage from './pages/InvoiceFormPage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'
import DebugPage from './pages/DebugPage'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/debug" element={<DebugPage />} />
        <Route path="/dashboard" element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/clients" element={isLoggedIn ? <ClientsPage /> : <Navigate to="/login" />} />
        <Route path="/clients/create" element={isLoggedIn ? <ClientFormPage /> : <Navigate to="/login" />} />
        <Route path="/clients/:id/edit" element={isLoggedIn ? <ClientFormPage /> : <Navigate to="/login" />} />
        <Route path="/invoices" element={isLoggedIn ? <InvoicesListPage /> : <Navigate to="/login" />} />
        <Route path="/invoices/create" element={isLoggedIn ? <InvoiceFormPage /> : <Navigate to="/login" />} />
        <Route path="/invoices/:id" element={isLoggedIn ? <InvoiceDetailPage /> : <Navigate to="/login" />} />
        <Route path="/invoices/:id/edit" element={isLoggedIn ? <InvoiceFormPage /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
