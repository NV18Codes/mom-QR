import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { QrCode, Users, Clock, CheckCircle, Filter } from 'lucide-react';
import QRCodeItem from './QRCodeItem';

interface QRStats {
  totalGenerated: number;
  totalScans: number;
  activeQRs: number;
  expiredQRs: number;
  uniqueUsers: number;
}

interface QRCodeData {
  id: string;
  code: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  scan_count: number;
  recent_scans: Array<{
    id: string;
    scanned_at: string;
    user_fingerprint: string;
  }>;
}

const AdminPanel = () => {
  const [stats, setStats] = useState<QRStats>({
    totalGenerated: 0,
    totalScans: 0,
    activeQRs: 0,
    expiredQRs: 0,
    uniqueUsers: 0
  });
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scanned' | 'unscanned'>('all');

  const fetchStats = async () => {
    try {
      // Get ALL QR codes with detailed scan information (including expired ones)
      const { data: qrData, error: qrError } = await supabase
        .from('qr_codes')
        .select(`
          id,
          code,
          created_at,
          expires_at,
          is_active,
          qr_scans(
            id,
            scanned_at,
            user_fingerprint
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50); // Limit to last 50 QR codes to prevent performance issues

      if (qrError) throw qrError;

      // Get total scans and unique users
      const { count: totalScans, error: scanError } = await supabase
        .from('qr_scans')
        .select('*', { count: 'exact', head: true });

      const { data: uniqueUsersData, error: uniqueError } = await supabase
        .from('qr_scans')
        .select('user_fingerprint', { count: 'exact' });

      if (scanError) throw scanError;
      if (uniqueError) throw uniqueError;

      const uniqueUsers = new Set(uniqueUsersData?.map(scan => scan.user_fingerprint)).size;

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
        scan_count: qr.qr_scans?.length || 0,
        recent_scans: qr.qr_scans?.slice(0, 3) || []
      })) || [];

      setStats({
        totalGenerated: qrData?.length || 0,
        totalScans: totalScans || 0,
        activeQRs,
        expiredQRs,
        uniqueUsers
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
    
    // Set up real-time subscriptions
    const qrCodesChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'qr_codes'
        },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'qr_scans'
        },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(qrCodesChannel);
    };
  }, []);

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <QrCode className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-blue-600">Generated</p>
                <p className="text-lg font-bold text-blue-700">{stats.totalGenerated}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs font-medium text-green-600">Total Scans</p>
                <p className="text-lg font-bold text-green-700">{stats.totalScans}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs font-medium text-purple-600">Unique Users</p>
                <p className="text-lg font-bold text-purple-700">{stats.uniqueUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-xs font-medium text-yellow-600">Active</p>
                <p className="text-lg font-bold text-yellow-700">{stats.activeQRs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-xs font-medium text-red-600">Expired</p>
                <p className="text-lg font-bold text-red-700">{stats.expiredQRs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">QR Code History</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="h-8"
            >
              All
            </Button>
            <Button
              variant={filter === 'scanned' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('scanned')}
              className="h-8"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Scanned
            </Button>
            <Button
              variant={filter === 'unscanned' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unscanned')}
              className="h-8"
            >
              Unscanned
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {qrCodes
              .filter(qr => {
                if (filter === 'all') return true;
                if (filter === 'scanned') return qr.scan_count > 0;
                if (filter === 'unscanned') return qr.scan_count === 0;
                return true;
              })
              .map((qr) => (
                <QRCodeItem key={qr.id} qr={qr} />
              ))}
            
            {qrCodes.filter(qr => {
              if (filter === 'all') return true;
              if (filter === 'scanned') return qr.scan_count > 0;
              if (filter === 'unscanned') return qr.scan_count === 0;
              return true;
            }).length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No QR codes found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;