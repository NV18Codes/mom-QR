import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface QRStats {
  totalGenerated: number;
  totalScans: number;
  activeQRs: number;
  expiredQRs: number;
}

interface QRCodeData {
  id: string;
  code: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  scan_count: number;
}

const AdminPanel = () => {
  const [stats, setStats] = useState<QRStats>({
    totalGenerated: 0,
    totalScans: 0,
    activeQRs: 0,
    expiredQRs: 0
  });
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Get QR codes with scan counts
      const { data: qrData, error: qrError } = await supabase
        .from('qr_codes')
        .select(`
          id,
          code,
          created_at,
          expires_at,
          is_active,
          qr_scans(count)
        `);

      if (qrError) throw qrError;

      // Get total scans
      const { count: totalScans, error: scanError } = await supabase
        .from('qr_scans')
        .select('*', { count: 'exact', head: true });

      if (scanError) throw scanError;

      const now = new Date();
      const activeQRs = qrData?.filter(qr => 
        qr.is_active && new Date(qr.expires_at) > now
      ).length || 0;
      
      const expiredQRs = qrData?.filter(qr => 
        new Date(qr.expires_at) <= now
      ).length || 0;

      // Transform data for display
      const transformedQRs = qrData?.map(qr => ({
        ...qr,
        scan_count: qr.qr_scans?.[0]?.count || 0
      })) || [];

      setStats({
        totalGenerated: qrData?.length || 0,
        totalScans: totalScans || 0,
        activeQRs,
        expiredQRs
      });

      setQrCodes(transformedQRs);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGenerated}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScans}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeQRs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiredQRs}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>QR Code History</CardTitle>
          <Button onClick={fetchStats} variant="outline" size="sm">
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {qrCodes.map((qr) => {
              const isExpired = new Date(qr.expires_at) <= new Date();
              return (
                <div key={qr.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="space-y-1">
                    <div className="font-mono text-sm">{qr.code}</div>
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(qr.created_at).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Expires: {new Date(qr.expires_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={isExpired ? "destructive" : "default"}>
                      {isExpired ? "Expired" : "Active"}
                    </Badge>
                    <div className="text-sm">
                      Scans: <span className="font-bold">{qr.scan_count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;