import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Store, 
  Package, 
  Settings, 
  Eye, 
  Edit3, 
  Trash2, 
  ShoppingBag,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import AddProductModal from '@/components/modals/AddProductModal';
import PaymentGatewayConfig from '@/components/dashboard/PaymentGatewayConfig';
import { useNotifications } from '@/contexts/NotificationContext';

const OrganizerStore = () => {
  const { showToast } = useNotifications();
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  // Mock data para produtos
  const [products, setProducts] = useState([
    {
      id: '1',
      name: 'Camiseta Festival 2025',
      description: 'Camiseta oficial do festival com design exclusivo',
      price: 49.90,
      originalPrice: 69.90,
      category: 'vestuario',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
      featured: true,
      stock: 50,
      sales: 23
    },
    {
      id: '2',
      name: 'Caneca Personalizada',
      description: 'Caneca de cerâmica com logo do evento',
      price: 29.90,
      category: 'acessorios',
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=300&h=300&fit=crop',
      featured: false,
      stock: 100,
      sales: 45
    }
  ]);

  // Estatísticas da loja
  const storeStats = {
    totalProducts: products.length,
    totalSales: products.reduce((sum, product) => sum + product.sales, 0),
    totalRevenue: products.reduce((sum, product) => sum + (product.sales * product.price), 0),
    topProduct: products.sort((a, b) => b.sales - a.sales)[0]
  };

  const handleAddProduct = (productData: any) => {
    const newProduct = {
      id: String(products.length + 1),
      ...productData,
      stock: 0,
      sales: 0
    };
    setProducts([...products, newProduct]);
    setIsAddProductModalOpen(false);
    showToast('success', 'Produto adicionado com sucesso!');
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    showToast('success', 'Produto removido com sucesso!');
  };

  const handleViewPublicPage = () => {
    window.open('/producer-page/eventpro', '_blank');
  };

  return (
    <DashboardLayout userType="organizer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Store className="h-6 w-6" />
              Loja Online
            </h1>
            <p className="text-gray-600">Gerencie produtos, vendas e configurações da sua loja</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleViewPublicPage}>
              <Eye className="h-4 w-4 mr-2" />
              Ver Página Pública
            </Button>
            <Button onClick={() => setIsAddProductModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total de Produtos</p>
                  <p className="text-xl font-bold">{storeStats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Total de Vendas</p>
                  <p className="text-xl font-bold">{storeStats.totalSales}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Receita Total</p>
                  <p className="text-xl font-bold">R$ {storeStats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Produto Top</p>
                  <p className="text-sm font-medium">{storeStats.topProduct?.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {product.featured && (
                      <Badge className="absolute top-2 left-2">Destaque</Badge>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-green-600">R$ {product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          R$ {product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Estoque: {product.stock}</span>
                      <span>Vendidos: {product.sales}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <PaymentGatewayConfig />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações da Loja
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Nome da Loja</Label>
                    <Input
                      id="storeName"
                      defaultValue="EventPro Store"
                      placeholder="Digite o nome da sua loja"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeSlug">URL da Loja</Label>
                    <Input
                      id="storeSlug"
                      defaultValue="eventpro"
                      placeholder="eventpro"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeDescription">Descrição da Loja</Label>
                  <Textarea
                    id="storeDescription"
                    placeholder="Descreva sua loja..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryFee">Taxa de Entrega (R$)</Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      step="0.01"
                      placeholder="10.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="freeShipping">Frete Grátis Acima de (R$)</Label>
                    <Input
                      id="freeShipping"
                      type="number"
                      step="0.01"
                      placeholder="100.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime">Prazo de Entrega (dias)</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-3">1 a 3 dias</SelectItem>
                        <SelectItem value="3-5">3 a 5 dias</SelectItem>
                        <SelectItem value="5-10">5 a 10 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Salvar Configurações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSubmit={handleAddProduct}
      />
    </DashboardLayout>
  );
};

export default OrganizerStore;
