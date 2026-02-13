
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const EventApprovalPage = () => {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Aprovação de Eventos</h1>
          <p className="text-gray-600">Revise e aprove novos eventos submetidos pelos organizadores</p>
        </div>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle>Eventos Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">Módulo em desenvolvimento</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Esta funcionalidade estará disponível em breve
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EventApprovalPage;
