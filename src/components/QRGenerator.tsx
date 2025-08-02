import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QrCode, Clock, Download } from 'lucide-react';
import QRCode from 'qrcode';

const QRGenerator = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQRCode, setCurrentQRCode] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(0);

  // Timer for current QR code
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && qrCodeUrl) {
      setQrCodeUrl('');
      setCurrentQRCode('');
    }
  }, [timeLeft, qrCodeUrl]);

  const generateQR = async () => {
    setIsGenerating(true);
    try {
      // Generate a unique code
      const uniqueCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Insert QR code into database
      const { data, error } = await supabase
        .from('qr_codes')
        .insert([{ code: uniqueCode }])
        .select()
        .single();

      if (error) throw error;

      // Create scan URL - use the deployed Vercel URL
      const scanUrl = `https://mom-qr-tau.vercel.app/scan/${uniqueCode}`;
      
      // Generate QR code image
      const qrDataUrl = await QRCode.toDataURL(scanUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      
      setQrCodeUrl(qrDataUrl);
      setCurrentQRCode(uniqueCode);
      setTimeLeft(120); // 2 minutes
      
      toast({
        title: "✅ QR Code Generated!",
        description: "Valid for 2 minutes"
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${currentQRCode}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <QrCode className="h-5 w-5" />
          <span>QR Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={generateQR} 
          disabled={isGenerating}
          className="w-full h-12"
          size="lg"
        >
          {isGenerating ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <QrCode className="h-4 w-4" />
              <span>Generate New QR Code</span>
            </div>
          )}
        </Button>
        
        {qrCodeUrl && (
          <div className="text-center space-y-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
            <div className="relative inline-block">
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto rounded-lg shadow-lg" />
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">QR Code: {currentQRCode}</p>
              <p className="text-xs text-muted-foreground">
                Redirects to: hellomealsonme.com
              </p>
              
              <Button onClick={downloadQR} variant="outline" size="sm" className="w-full">
                <Download className="h-3 w-3 mr-1" />
                Download QR Code
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRGenerator;