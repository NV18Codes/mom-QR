import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

const QRGenerator = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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

      // Create scan URL
      const scanUrl = `${window.location.origin}/scan/${uniqueCode}`;
      
      // Generate QR code image
      const qrDataUrl = await QRCode.toDataURL(scanUrl, {
        width: 256,
        margin: 2
      });
      
      setQrCodeUrl(qrDataUrl);
      toast({
        title: "QR Code Generated!",
        description: "QR code expires in 2 minutes"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Generate QR Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={generateQR} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? 'Generating...' : 'Generate QR Code'}
        </Button>
        
        {qrCodeUrl && (
          <div className="text-center space-y-2">
            <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
            <p className="text-sm text-muted-foreground">
              QR code expires in 2 minutes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRGenerator;