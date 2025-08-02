import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QRGenerator from '@/components/QRGenerator';
import AdminPanel from '@/components/AdminPanel';

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">QR Code System - MealsOnMe</h1>
        
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate QR</TabsTrigger>
            <TabsTrigger value="admin">Admin Panel</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="mt-6">
            <div className="flex justify-center">
              <QRGenerator />
            </div>
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
