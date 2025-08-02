import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { useCountdown } from '@/hooks/use-countdown';

interface QRCodeItemProps {
  qr: {
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
  };
}

const QRCodeItem = ({ qr }: QRCodeItemProps) => {
  const { formattedTime, isExpired, timeLeft } = useCountdown(qr.expires_at);
  
  // Determine badge variant based on time left and scan status
  const getBadgeVariant = () => {
    if (isExpired) return "destructive";
    if (timeLeft < 30000) return "secondary"; // Less than 30 seconds - warning
    return "default";
  };

  // Check if QR code has been scanned
  const hasBeenScanned = qr.scan_count > 0;

  return (
    <div className={`border-b last:border-b-0 p-4 hover:bg-muted/50 transition-colors ${
      hasBeenScanned ? 'bg-green-50/30' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center space-x-2">
            <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
              {qr.code}
            </code>
            <Badge 
              variant={getBadgeVariant()}
              className="text-xs font-mono"
            >
              {isExpired ? "Expired" : formattedTime}
            </Badge>
            {hasBeenScanned && (
              <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                ✓ Scanned
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>Created: {new Date(qr.created_at).toLocaleString()}</div>
            <div>Expires: {new Date(qr.expires_at).toLocaleString()}</div>
          </div>
          
          {qr.recent_scans.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium">Recent Scans:</p>
              {qr.recent_scans.map((scan) => (
                <div key={scan.id} className="text-xs text-muted-foreground ml-2">
                  • {new Date(scan.scanned_at).toLocaleString()} 
                  <span className="ml-2 font-mono text-xs">
                    ({scan.user_fingerprint.substring(0, 8)}...)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-right space-y-1 ml-4">
          <div className="flex items-center space-x-1">
            <CheckCircle className={`h-3 w-3 ${hasBeenScanned ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={`text-sm font-bold ${hasBeenScanned ? 'text-green-600' : 'text-gray-500'}`}>
              {qr.scan_count}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {hasBeenScanned ? 'scanned' : 'no scans'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeItem; 