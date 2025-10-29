import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'
import ClientProfile from './pages/ClientProfile.jsx'
import CustomerPage from './pages/CustomerPage.jsx'
import NewCustomerPage from './pages/NewCustomerPage.jsx'
import Customers from './pages/Customers.jsx'
import Layout from './components/Layout.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/clients" element={<Customers />} />
          <Route path="/clients/:clientId" element={<ClientProfile />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/new" element={<NewCustomerPage />} />
          <Route path="/customers/:id" element={<CustomerPage />} />
        </Routes>
      </Layout>
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
