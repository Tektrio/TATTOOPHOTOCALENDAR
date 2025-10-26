/**
 * Página de Gestão de Cliente Individual
 * Rota sugerida: /customers/:customerId
 */

import React from 'react';
import CustomerManagement from '../components/CustomerManagement';

export default function CustomerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerManagement />
    </div>
  );
}

