-- Enable real-time for QR codes table
ALTER TABLE public.qr_codes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_codes;

-- Enable real-time for QR scans table  
ALTER TABLE public.qr_scans REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_scans;