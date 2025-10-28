/**
 * Página de Gestão de Cliente Individual
 * Rota: /customers/:id
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerManagement from '../components/CustomerManagement';

export default function CustomerPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900">
      <CustomerManagement 
        customerId={id} 
        onClose={() => navigate('/customers')} 
      />
    </div>
  );
}

