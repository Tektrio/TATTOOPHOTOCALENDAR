import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Users } from 'lucide-react';

const MembershipsTab = ({ customerId }) => {
  return (
    <Card>
      <CardContent className="py-12 text-center text-gray-500">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">Memberships</p>
        <p className="text-sm">Assinaturas e planos do cliente</p>
        <p className="text-xs mt-2 text-gray-400">Em desenvolvimento...</p>
      </CardContent>
    </Card>
  );
};

export default MembershipsTab;

