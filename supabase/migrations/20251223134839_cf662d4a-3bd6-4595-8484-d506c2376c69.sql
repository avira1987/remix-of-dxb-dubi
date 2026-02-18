-- Create site_settings table
CREATE TABLE public.site_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value text,
    category text NOT NULL DEFAULT 'general',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings (public site info)
CREATE POLICY "Anyone can view settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings"
ON public.site_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.site_settings (key, value, category) VALUES
    ('site_name', 'Fashion Store', 'general'),
    ('site_description', 'Your premium fashion destination', 'general'),
    ('site_logo', '', 'general'),
    ('contact_email', '', 'contact'),
    ('contact_phone', '', 'contact'),
    ('contact_address', '', 'contact'),
    ('facebook_url', '', 'social'),
    ('instagram_url', '', 'social'),
    ('twitter_url', '', 'social'),
    ('youtube_url', '', 'social'),
    ('linkedin_url', '', 'social'),
    ('tiktok_url', '', 'social'),
    ('whatsapp_number', '', 'social'),
    ('telegram_url', '', 'social'),
    ('currency', 'USD', 'store'),
    ('currency_symbol', '$', 'store'),
    ('free_shipping_threshold', '100', 'store'),
    ('tax_rate', '0', 'store'),
    ('meta_title', '', 'seo'),
    ('meta_description', '', 'seo'),
    ('meta_keywords', '', 'seo'),
    ('google_analytics_id', '', 'integrations'),
    ('facebook_pixel_id', '', 'integrations');