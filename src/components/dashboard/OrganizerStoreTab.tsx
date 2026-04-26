import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  ChevronRight,
  Loader2
} from 'lucide-react';
import AddProductModal from '@/components/modals/AddProductModal';
import PaymentGatewayConfig from '@/components/dashboard/PaymentGatewayConfig';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { organizerService } from '@/services/organizerService';

const OrganizerStoreTab = ({ profileData: externalProfile }: { profileData: any }) => {
  const { showToast } = useNotifications();
  const { user } = useAuth();
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadStoreData();
    }
  }, [user?.id]);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      const [productsData, ordersData] = await Promise.all([
        organizerService.getProducts(user!.id),
        organizerService.getProductOrders(user!.id)
      ]);
      setProducts(productsData || []);
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Erro ao carregar dados da loja:', error);
      showToast('error', 'Falha ao carregar dados da loja');
    } finally {
      setLoading(false);
    }
  };

  const storeStats = {
    totalProducts: products.length,
    totalSales: orders.filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered').length,
    totalRevenue: orders.reduce((sum, order) => {
      const val = typeof order.total_value === 'string' ? parseFloat(order.total_value) : (order.total_value || 0);
      if (order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered') {
        return sum + (isNaN(val) ? 0 : val);
      }
      return sum;
    }, 0),
    topProduct: products.length > 0 ? products[0] : null
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Carregando sua Loja...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Cards - Novo Estilo Minimalista */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Produtos', value: storeStats.totalProducts, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Vendas', value: storeStats.totalSales, icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Faturamento', value: `R$ ${storeStats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-violet-500', bg: 'bg-violet-50' },
          { label: 'Top Prod.', value: storeStats.topProduct?.name || '-', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' }
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                <p className="text-lg font-black text-gray-900 truncate max-w-[150px]">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Catálogo de Produtos</h2>
          <p className="text-sm font-medium text-gray-500">Gerencie seu inventário e vendas</p>
        </div>
        <Button 
          onClick={() => {
            setEditingProduct(null);
            setIsAddProductModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-xl px-6 h-12"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Produto
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-xl w-full md:w-auto">
          <TabsTrigger value="products" className="font-bold text-xs uppercase px-6">Produtos</TabsTrigger>
          <TabsTrigger value="orders" className="font-bold text-xs uppercase px-6">Pedidos</TabsTrigger>
          <TabsTrigger value="payments" className="font-bold text-xs uppercase px-6">Pagamentos</TabsTrigger>
          <TabsTrigger value="settings" className="font-bold text-xs uppercase px-6">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {products.length === 0 ? (
            <Card className="p-20 text-center border-none shadow-sm rounded-[3rem]">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase">Sua prateleira está vazia</h3>
              <p className="text-gray-400 font-medium mb-6">Comece adicionando seu primeiro produto para vender na FanPage.</p>
              <Button onClick={() => setIsAddProductModalOpen(true)} variant="outline" className="rounded-xl font-black uppercase">
                Adicionar Primeiro Produto
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Card key={product.id} className="overflow-hidden group hover:shadow-xl transition-all duration-500 border-none rounded-[2rem]">
                  <div className="relative h-56">
                    <img 
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop'} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <div className="flex gap-2 w-full">
                        <Button 
                          variant="secondary" 
                          className="flex-1 font-black uppercase text-[10px] rounded-xl h-10"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-2" /> Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="h-10 w-10 p-0 rounded-xl"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-black text-gray-900 uppercase tracking-tight">{product.name}</h3>
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className="text-[10px] font-black rounded-lg">
                        {product.status === 'active' ? 'ATIVO' : 'INATIVO'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="font-black text-indigo-600 text-xl">R$ {parseFloat(product.price || 0).toFixed(2)}</span>
                      {product.salePrice && parseFloat(product.salePrice) > 0 && (
                        <span className="text-sm text-gray-400 line-through font-bold">
                          R$ {parseFloat(product.salePrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 pt-4 border-t border-gray-50">
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" /> Estoque: {product.hasVariants ? 'Variável' : product.totalStock}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-50 p-8">
              <CardTitle className="text-lg font-black uppercase tracking-tight">Pedidos da Loja</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {orders.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="font-bold uppercase text-xs tracking-widest">Nenhum pedido realizado ainda</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">Pedido</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest py-6">Cliente</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest py-6">Faturamento</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest py-6">Status</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 text-right px-8">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                        <TableCell className="py-6 px-8 font-black text-gray-400 text-xs">#{order.id.substring(0, 8).toUpperCase()}</TableCell>
                        <TableCell className="py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-gray-900 text-sm uppercase">{order.buyer_name}</span>
                            <span className="text-xs font-medium text-gray-400">{order.buyer_email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-emerald-600">R$ {parseFloat(order.total_value || 0).toFixed(2)}</span>
                            <span className="text-[10px] font-bold text-gray-300">Net: R$ {(parseFloat(order.total_value || 0) * 0.88).toFixed(2)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="py-6 text-right px-8">
                          <Button variant="ghost" size="sm" className="font-black uppercase text-[10px] tracking-widest rounded-xl">
                            Detalhes <ChevronRight className="w-4 h-4 ml-1" />
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

        <TabsContent value="payments">
          <PaymentGatewayConfig />
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-none shadow-sm rounded-[2rem]">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black uppercase tracking-tight">Checkout e Entrega</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome de Exibição da Loja</Label>
                  <Input 
                    placeholder="Ex: Loja Kathy Eventos"
                    className="h-12 bg-gray-50 border-none rounded-xl font-bold shadow-inner"
                    defaultValue={externalProfile?.company_name ? `Loja Oficial ${externalProfile.company_name}` : ''}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Taxa Fixa de Entrega (R$)</Label>
                  <Input 
                    type="number"
                    placeholder="0.00"
                    className="h-12 bg-gray-50 border-none rounded-xl font-bold shadow-inner"
                  />
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-[2rem] flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-indigo-900 uppercase tracking-tight">Modelo de Comissionamento</p>
                  <p className="text-xs font-medium text-indigo-700/70 mt-1">Taxa fixa de 12% sobre vendas físicas. Sem mensalidade, pague apenas quando vender.</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-xl px-10 h-12 shadow-lg shadow-indigo-200">
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleAddProduct}
        product={editingProduct}
      />
    </div>
  );
};

export default OrganizerStoreTab;
