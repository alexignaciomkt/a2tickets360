
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Shield, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

interface PaymentGateway {
  id: string;
  name: string;
  enabled: boolean;
  fee: number;
  feeType: 'percentage' | 'fixed';
  status: 'active' | 'inactive' | 'pending';
  credentials: {
    apiKey?: string;
    secretKey?: string;
    merchantId?: string;
  };
}

const PaymentGatewayConfig = () => {
  const { showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('gateways');

  const [gateways, setGateways] = useState<PaymentGateway[]>([
    {
      id: 'stripe',
      name: 'Stripe',
      enabled: true,
      fee: 3.4,
      feeType: 'percentage',
      status: 'active',
      credentials: { apiKey: '', secretKey: '' }
    },
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      enabled: true,
      fee: 4.99,
      feeType: 'percentage',
      status: 'active',
      credentials: { apiKey: '', secretKey: '' }
    },
    {
      id: 'pagseguro',
      name: 'PagSeguro',
      enabled: false,
      fee: 4.99,
      feeType: 'percentage',
      status: 'inactive',
      credentials: { apiKey: '', merchantId: '' }
    },
    {
      id: 'paypal',
      name: 'PayPal',
      enabled: false,
      fee: 5.4,
      feeType: 'percentage',
      status: 'inactive',
      credentials: { apiKey: '', secretKey: '' }
    }
  ]);

  const [paymentMethods, setPaymentMethods] = useState({
    creditCard: true,
    debitCard: true,
    pix: true,
    boleto: false,
    applePay: false,
    googlePay: false
  });

  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);

  const handleToggleGateway = (gatewayId: string) => {
    setGateways(prev => prev.map(gateway => 
      gateway.id === gatewayId 
        ? { ...gateway, enabled: !gateway.enabled, status: !gateway.enabled ? 'active' : 'inactive' }
        : gateway
    ));
    
    const gateway = gateways.find(g => g.id === gatewayId);
    showToast('success', `${gateway?.name} ${gateway?.enabled ? 'desativado' : 'ativado'} com sucesso!`);
  };

  const handleSaveCredentials = (gatewayId: string, credentials: any) => {
    setGateways(prev => prev.map(gateway => 
      gateway.id === gatewayId 
        ? { ...gateway, credentials, status: 'active' }
        : gateway
    ));
    
    showToast('success', 'Credenciais salvas com sucesso!');
    setSelectedGateway(null);
  };

  const handleTogglePaymentMethod = (method: string) => {
    setPaymentMethods(prev => ({
      ...prev,
      [method]: !prev[method as keyof typeof prev]
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      default:
        return <Badge variant="secondary">Inativo</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gateways">Gateways</TabsTrigger>
          <TabsTrigger value="methods">Métodos de Pagamento</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Gateway de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {gateways.map((gateway) => (
                  <div key={gateway.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(gateway.status)}
                      <div>
                        <p className="font-medium">{gateway.name}</p>
                        <p className="text-sm text-gray-500">
                          Taxa: {gateway.fee}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(gateway.status)}
                      <Switch 
                        checked={gateway.enabled} 
                        onCheckedChange={() => handleToggleGateway(gateway.id)}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedGateway(gateway.id)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configurar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gateway Configuration Modal */}
          {selectedGateway && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Configurar {gateways.find(g => g.id === selectedGateway)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GatewayCredentialsForm
                  gateway={gateways.find(g => g.id === selectedGateway)!}
                  onSave={(credentials) => handleSaveCredentials(selectedGateway, credentials)}
                  onCancel={() => setSelectedGateway(null)}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Métodos de Pagamento Aceitos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(paymentMethods).map(([method, enabled]) => (
                  <div key={method} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span className="text-sm capitalize">
                        {method === 'creditCard' ? 'Cartão de Crédito' :
                         method === 'debitCard' ? 'Cartão de Débito' :
                         method === 'pix' ? 'PIX' :
                         method === 'boleto' ? 'Boleto' :
                         method === 'applePay' ? 'Apple Pay' :
                         method === 'googlePay' ? 'Google Pay' : method}
                      </span>
                    </div>
                    <Switch 
                      checked={enabled} 
                      onCheckedChange={() => handleTogglePaymentMethod(method)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="environment">Ambiente</Label>
                <Select defaultValue="sandbox">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox (Teste)</SelectItem>
                    <SelectItem value="production">Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook">URL de Webhook</Label>
                <Input
                  id="webhook"
                  placeholder="https://seusite.com/webhook"
                  defaultValue=""
                />
                <p className="text-xs text-gray-500">
                  URL para receber notificações de pagamento
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="autoCapture" defaultChecked />
                <Label htmlFor="autoCapture" className="text-sm">
                  Captura automática de pagamentos
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="saveCards" defaultChecked />
                <Label htmlFor="saveCards" className="text-sm">
                  Permitir salvar cartões
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Component for gateway credentials form
const GatewayCredentialsForm = ({ 
  gateway, 
  onSave, 
  onCancel 
}: { 
  gateway: PaymentGateway;
  onSave: (credentials: any) => void;
  onCancel: () => void;
}) => {
  const [credentials, setCredentials] = useState(gateway.credentials);

  const handleSave = () => {
    onSave(credentials);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Shield className="h-4 w-4" />
        Suas credenciais são armazenadas com segurança
      </div>
      
      {gateway.id === 'stripe' && (
        <>
          <div className="space-y-2">
            <Label>Chave Pública</Label>
            <Input
              type="password"
              placeholder="pk_test_..."
              value={credentials.apiKey || ''}
              onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Chave Secreta</Label>
            <Input
              type="password"
              placeholder="sk_test_..."
              value={credentials.secretKey || ''}
              onChange={(e) => setCredentials({ ...credentials, secretKey: e.target.value })}
            />
          </div>
        </>
      )}

      {gateway.id === 'mercadopago' && (
        <>
          <div className="space-y-2">
            <Label>Access Token</Label>
            <Input
              type="password"
              placeholder="APP_USR-..."
              value={credentials.apiKey || ''}
              onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Public Key</Label>
            <Input
              type="password"
              placeholder="APP_USR-..."
              value={credentials.secretKey || ''}
              onChange={(e) => setCredentials({ ...credentials, secretKey: e.target.value })}
            />
          </div>
        </>
      )}

      {gateway.id === 'pagseguro' && (
        <>
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              placeholder="Sua API Key do PagSeguro"
              value={credentials.apiKey || ''}
              onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Merchant ID</Label>
            <Input
              placeholder="Seu Merchant ID"
              value={credentials.merchantId || ''}
              onChange={(e) => setCredentials({ ...credentials, merchantId: e.target.value })}
            />
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          Salvar Credenciais
        </Button>
      </div>
    </div>
  );
};

export default PaymentGatewayConfig;
