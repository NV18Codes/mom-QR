import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ScanPage = () => {
  const { code } = useParams<{ code: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'expired' | 'already_scanned' | 'invalid'>('loading');

  useEffect(() => {
    const handleScan = async () => {
      if (!code) {
        setStatus('invalid');
        return;
      }

      try {
        // Get QR code details
        const { data: qrCode, error: qrError } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('code', code)
          .single();

        if (qrError || !qrCode) {
          setStatus('invalid');
          return;
        }

        // Check if expired
        if (new Date(qrCode.expires_at) <= new Date() || !qrCode.is_active) {
          setStatus('expired');
          return;
        }

        // Generate user fingerprint (simple browser fingerprint)
        const userFingerprint = navigator.userAgent + navigator.language + screen.width + screen.height;
        const hashedFingerprint = btoa(userFingerprint).substring(0, 32);

        // Check if user already scanned this QR
        const { data: existingScan, error: scanCheckError } = await supabase
          .from('qr_scans')
          .select('*')
          .eq('qr_code_id', qrCode.id)
          .eq('user_fingerprint', hashedFingerprint)
          .single();

        if (scanCheckError && scanCheckError.code !== 'PGRST116') {
          console.error('Error checking existing scan:', scanCheckError);
        }

        if (existingScan) {
          setStatus('already_scanned');
          return;
        }

        // Record the scan
        const { error: insertError } = await supabase
          .from('qr_scans')
          .insert([{
            qr_code_id: qrCode.id,
            user_fingerprint: hashedFingerprint
          }]);

        if (insertError) {
          console.error('Error recording scan:', insertError);
          setStatus('invalid');
          return;
        }

        setStatus('success');
        
        // Redirect to hellomealsonme.com after 3 seconds
        setTimeout(() => {
          window.location.href = 'http://www.hellomealsonme.com';
        }, 3000);

      } catch (error) {
        console.error('Error handling scan:', error);
        setStatus('invalid');
      }
    };

    handleScan();
  }, [code]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4">Processing QR code...</p>
              </div>
            </CardContent>
          </Card>
        );

      case 'success':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-green-600">✅ Success!</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>QR code scanned successfully!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Redirecting to hellomealsonme.com in 3 seconds...
              </p>
            </CardContent>
          </Card>
        );

      case 'expired':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-red-600">⏰ Expired</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>This QR code has expired.</p>
              <p className="text-sm text-muted-foreground mt-2">
                QR codes are only valid for 2 minutes.
              </p>
            </CardContent>
          </Card>
        );

      case 'already_scanned':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-yellow-600">⚠️ Already Scanned</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>You have already scanned this QR code.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Each user can only scan a QR code once.
              </p>
            </CardContent>
          </Card>
        );

      case 'invalid':
      default:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-red-600">❌ Invalid</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>This QR code is invalid or not found.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {renderContent()}
    </div>
  );
};

export default ScanPage;