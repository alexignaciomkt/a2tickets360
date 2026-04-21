import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  DollarSign,
  ClipboardList,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import AddProductModal from '@/components/modals/AddProductModal';
import PaymentGatewayConfig from '@/components/dashboard/PaymentGatewayConfig';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { organizerService } from '@/services/organizerService';

const OrganizerStore = () => {
  const { showToast } = useNotifications();
  const { user } = useAuth();
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      loadStoreData();
    }
  }, [user]);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      const [productsData, ordersData, profile] = await Promise.all([
        organizerService.getProducts(user!.id),
        organizerService.getProductOrders(user!.id),
        organizerService.getProfile(user!.id)
      ]);
      setProducts(productsData);
      setOrders(ordersData);
      setProfileData(profile);
    } catch (error) {
      console.error('Erro ao carregar dados da loja:', error);
      showToast('error', 'Falha ao carregar dados da loja');
    } finally {
      setLoading(false);
    }
  };

  // Estatísticas da loja calculadas em tempo real
  const storeStats = {
    totalProducts: products.length,
    totalSales: orders.filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered').length,
    totalRevenue: orders.reduce((sum, order) => {
      if (order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered') {
        return sum + parseFloat(order.total_value || 0);
      }
      return sum;
    }, 0),
    topProduct: products.length > 0 ? products[0] : null // Simplificado para exemplo
  };

  const handleAddProduct = async (productData: any) => {
    try {
      await organizerService.saveProduct(user!.id, productData);
      showToast('success', editingProduct ? 'Produto atualizado!' : 'Produto adicionado com sucesso!');
      setIsAddProductModalOpen(false);
      setEditingProduct(null);
      loadStoreData();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      showToast('error', 'Erro ao salvar produto');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await organizerService.deleteProduct(productId);
        showToast('success', 'Produto removido!');
        loadStoreData();
      } catch (error) {
        showToast('error', 'Erro ao remover produto');
      }
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsAddProductModalOpen(true);
  };

  const handleViewPublicPage = () => {
    if (profileData?.slug) {
      window.open(`/p/${profileData.slug}`, '_blank');
    } else {
      showToast('error', 'Slug não encontrada para sua página pública. Complete seu cadastro.');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status.toUpperCase()}</Badge>;
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
            <Button onClick={() => {
              setEditingProduct(null);
              setIsAddProductModalOpen(true);
            }}>
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
                  <p className="text-sm font-medium truncate">{storeStats.topProduct?.name || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : products.length === 0 ? (
              <Card className="p-12 text-center text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhum produto cadastrado ainda.</p>
                <Button variant="link" onClick={() => setIsAddProductModalOpen(true)}>Adicionar seu primeiro produto</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(products || []).map(product => (
                  <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="relative">
                      <img 
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop'} 
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      {product.isFeatured && (
                        <Badge className="absolute top-2 left-2 bg-indigo-600">Destaque</Badge>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditProduct(product)}
                        >
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
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge variant={product.status === 'active' ? 'outline' : 'secondary'} className="text-[10px]">
                          {product.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className="font-bold text-indigo-600 text-lg">R$ {parseFloat(product.price).toFixed(2)}</span>
                        {product.salePrice && parseFloat(product.salePrice) > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            R$ {parseFloat(product.salePrice).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" /> Estoque: {product.hasVariants ? 'Variável' : product.totalStock}
                        </span>
                        {product.hasVariants && (
                          <span className="text-indigo-500 font-medium">
                            {product.variants?.length || 0} variações
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Pedidos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Nenhum pedido realizado até o momento.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id.substring(0, 8).toUpperCase()}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.buyer_name}</p>
                              <p className="text-xs text-gray-500">{order.buyer_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                                <p className="font-bold">R$ {parseFloat(order.total_value).toFixed(2)}</p>
                                <p className="text-[10px] text-gray-400">Taxa: R$ {(parseFloat(order.total_value) * 0.12).toFixed(2)}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-gray-500 text-xs">
                            {new Date(order.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Gerenciar <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <PaymentGatewayConfig />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações do Ecommerce
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Nome da Exibição na Loja</Label>
                    <Input
                      id="storeName"
                      placeholder="Ex: Loja Oficial do Festival"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryFee">Taxa Fixa de Entrega (R$)</Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                        <Store className="h-4 w-4" /> 
                        Taxa da Plataforma: 12% retidos automaticamente sobre o valor bruto das vendas físicas.
                    </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => showToast('success', 'Configurações salvas!')}>Salvar Configurações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleAddProduct}
        product={editingProduct}
      />
    </DashboardLayout>
  );
};

export default OrganizerStore;
