-- Create table for QR codes
CREATE TABLE public.qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '2 minutes'),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create table for QR scans
CREATE TABLE public.qr_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  user_fingerprint TEXT NOT NULL,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(qr_code_id, user_fingerprint)
);

-- Enable Row Level Security
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "QR codes are viewable by everyone" 
ON public.qr_codes 
FOR SELECT 
USING (true);

CREATE POLICY "QR codes can be created by everyone" 
ON public.qr_codes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "QR scans are viewable by everyone" 
ON public.qr_scans 
FOR SELECT 
USING (true);

CREATE POLICY "QR scans can be created by everyone" 
ON public.qr_scans 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_qr_codes_code ON public.qr_codes(code);
CREATE INDEX idx_qr_codes_expires_at ON public.qr_codes(expires_at);
CREATE INDEX idx_qr_scans_qr_code_id ON public.qr_scans(qr_code_id);
CREATE INDEX idx_qr_scans_fingerprint ON public.qr_scans(user_fingerprint);