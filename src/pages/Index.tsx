import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, BarChart3 } from 'lucide-react';
import QRGenerator from '@/components/QRGenerator';
import AdminPanel from '@/components/AdminPanel';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            QR Code System
          </h1>
          <p className="text-lg text-muted-foreground">HelloMealsOnMe - Real-time QR Management</p>
        </div>
        
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="generate" className="flex items-center space-x-2">
              <QrCode className="h-4 w-4" />
              <span>Generate QR</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="mt-6">
            <QRGenerator />
          </TabsContent>
          
          <TabsContent value="admin" className="mt-6">
            <AdminPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
