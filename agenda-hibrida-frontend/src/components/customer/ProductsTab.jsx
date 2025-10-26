import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  ShoppingBag, 
  Plus, 
  X, 
  Search,
  Calendar,
  DollarSign,
  Package as PackageIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const ProductsTab = ({ customerId, customerData }) => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saleDialog, setSaleDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para nova venda
  const [newSale, setNewSale] = useState({
    product_id: '',
    quantity: 1,
    unit_price: 0,
    purchase_location: 'In House'
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Carregar dados
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [purchasesRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/api/products/customers/${customerId}/products`),
        fetch(`${API_URL}/api/products`)
      ]);
      
      if (!purchasesRes.ok || !productsRes.ok) {
        throw new Error('Erro ao carregar dados');
      }
      
      const [purchasesData, productsData] = await Promise.all([
        purchasesRes.json(),
        productsRes.json()
      ]);
      
      setPurchases(purchasesData);
      setProducts(productsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [customerId, API_URL]);

  useEffect(() => {
    if (customerId) {
      loadData();
    }
  }, [customerId, loadData]);

  // Registrar venda
  const handleRegisterSale = async () => {
    try {
      setError(null);
      
      if (!newSale.product_id || !newSale.unit_price) {
        setError('Selecione um produto e informe o preço');
        return;
      }

      const saleData = {
        product_id: Number(newSale.product_id),
        quantity: Number(newSale.quantity),
        unit_price: Number(newSale.unit_price),
        purchase_location: newSale.purchase_location
      };

      const response = await fetch(`${API_URL}/api/products/customers/${customerId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao registrar venda');
      }

      setSuccess('Venda registrada com sucesso!');
      
      // Reset form
      setNewSale({
        product_id: '',
        quantity: 1,
        unit_price: 0,
        purchase_location: 'In House'
      });
      
      setSaleDialog(false);
      await loadData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao registrar venda:', err);
      setError(err.message || 'Erro ao registrar venda. Tente novamente.');
    }
  };

  // Atualizar preço ao selecionar produto
  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id.toString() === productId);
    setNewSale({
      ...newSale,
      product_id: productId,
      unit_price: product?.price || 0
    });
  };

  // Formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  // Filtrar compras por busca
  const filteredPurchases = purchases.filter(purchase =>
    purchase.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estatísticas
  const totalSpent = purchases.reduce((sum, p) => sum + (p.total_price || 0), 0);
  const totalProducts = purchases.reduce((sum, p) => sum + (p.quantity || 0), 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produtos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="flex items-center justify-between text-green-800">
            <span>{success}</span>
            <Button variant="ghost" size="sm" onClick={() => setSuccess(null)}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Produtos Comprados
            </CardTitle>
            <Button onClick={() => setSaleDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Venda
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total gasto */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-700 font-medium">Total Gasto</span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(totalSpent)}
              </p>
            </div>

            {/* Total de produtos */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <PackageIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">Total de Produtos</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {totalProducts}
              </p>
            </div>

            {/* Média por compra */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-purple-700 font-medium">Média por Compra</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                {formatCurrency(purchases.length > 0 ? totalSpent / purchases.length : 0)}
              </p>
            </div>
          </div>

          {/* Busca */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de compras */}
      {filteredPurchases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhuma compra encontrada</p>
            <p className="text-sm">
              {searchTerm 
                ? 'Tente uma busca diferente' 
                : 'Registre a primeira compra deste cliente'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {filteredPurchases.map((purchase) => (
                <div 
                  key={purchase.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold">{purchase.product_name}</h3>
                      <Badge variant="outline">
                        {purchase.product_category || 'Sem categoria'}
                      </Badge>
                    </div>
                    
                    {purchase.product_description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {purchase.product_description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        <strong>Quantidade:</strong> {purchase.quantity}
                      </span>
                      <span>
                        <strong>Preço unitário:</strong> {formatCurrency(purchase.unit_price)}
                      </span>
                      <span>
                        <strong>Local:</strong> {purchase.purchase_location}
                      </span>
                      <span>
                        <strong>Data:</strong> {new Date(purchase.purchased_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(purchase.total_price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de nova venda */}
      <Dialog open={saleDialog} onOpenChange={setSaleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Venda de Produto</DialogTitle>
            <DialogDescription>
              Registre uma venda de produto para {customerData?.name || 'o cliente'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Produto */}
            <div>
              <Label htmlFor="product">Produto *</Label>
              <Select 
                value={newSale.product_id} 
                onValueChange={handleProductSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} - {formatCurrency(product.price)}
                      {product.stock_quantity !== null && product.stock_quantity !== undefined && (
                        <span className="text-gray-500 ml-2">
                          (Estoque: {product.stock_quantity})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantidade e Preço */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newSale.quantity}
                  onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="unit_price">Preço Unitário *</Label>
                <Input
                  id="unit_price"
                  type="number"
                  value={newSale.unit_price}
                  onChange={(e) => setNewSale({ ...newSale, unit_price: e.target.value })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Local de compra */}
            <div>
              <Label htmlFor="purchase_location">Local de Compra</Label>
              <Select 
                value={newSale.purchase_location} 
                onValueChange={(value) => setNewSale({ ...newSale, purchase_location: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In House">No Estabelecimento</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Third Party">Terceiros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resumo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total da Venda:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(Number(newSale.quantity) * Number(newSale.unit_price))}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSaleDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegisterSale}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsTab;
