import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Gift } from 'lucide-react';

const GiftCardsTab = ({ customerId }) => {
  return (
    <Card>
      <CardContent className="py-12 text-center text-gray-500">
        <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">Gift Cards</p>
        <p className="text-sm">Cartões presente do cliente</p>
        <p className="text-xs mt-2 text-gray-400">Em desenvolvimento...</p>
      </CardContent>
    </Card>
  );
};

export default GiftCardsTab;

