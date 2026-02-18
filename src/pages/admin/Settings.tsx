import { useState, useEffect } from 'react';
import { Save, Loader2, Globe, Phone, Share2, Store, Search, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Setting {
  id: string;
  key: string;
  value: string | null;
  category: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('category');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getValue = (key: string) => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || '';
  };

  const setValue = (key: string, value: string) => {
    setSettings(prev => 
      prev.map(s => s.key === key ? { ...s, value } : s)
    );
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      for (const setting of settings) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: setting.value })
          .eq('key', setting.key);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground font-body">Manage your website settings</p>
        </div>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="bg-primary hover:bg-primary/90"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-6 h-auto gap-1">
          <TabsTrigger value="general" className="flex items-center gap-2 py-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2 py-2">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2 py-2">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Social</span>
          </TabsTrigger>
          <TabsTrigger value="store" className="flex items-center gap-2 py-2">
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Store</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2 py-2">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">SEO</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2 py-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic information about your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={getValue('site_name')}
                    onChange={(e) => setValue('site_name', e.target.value)}
                    placeholder="Your Store Name"
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_logo">Logo URL</Label>
                  <Input
                    id="site_logo"
                    value={getValue('site_logo')}
                    onChange={(e) => setValue('site_logo', e.target.value)}
                    placeholder="https://..."
                    className="bg-card"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={getValue('site_description')}
                  onChange={(e) => setValue('site_description', e.target.value)}
                  placeholder="A brief description of your store..."
                  rows={3}
                  className="bg-card"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Settings */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How customers can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email Address</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={getValue('contact_email')}
                    onChange={(e) => setValue('contact_email', e.target.value)}
                    placeholder="contact@example.com"
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone Number</Label>
                  <Input
                    id="contact_phone"
                    value={getValue('contact_phone')}
                    onChange={(e) => setValue('contact_phone', e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="bg-card"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_address">Address</Label>
                <Textarea
                  id="contact_address"
                  value={getValue('contact_address')}
                  onChange={(e) => setValue('contact_address', e.target.value)}
                  placeholder="Your business address..."
                  rows={2}
                  className="bg-card"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Settings */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Connect your social media accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram</Label>
                  <Input
                    id="instagram_url"
                    value={getValue('instagram_url')}
                    onChange={(e) => setValue('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook_url">Facebook</Label>
                  <Input
                    id="facebook_url"
                    value={getValue('facebook_url')}
                    onChange={(e) => setValue('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter_url">Twitter / X</Label>
                  <Input
                    id="twitter_url"
                    value={getValue('twitter_url')}
                    onChange={(e) => setValue('twitter_url', e.target.value)}
                    placeholder="https://x.com/..."
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube_url">YouTube</Label>
                  <Input
                    id="youtube_url"
                    value={getValue('youtube_url')}
                    onChange={(e) => setValue('youtube_url', e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn</Label>
                  <Input
                    id="linkedin_url"
                    value={getValue('linkedin_url')}
                    onChange={(e) => setValue('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/..."
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok_url">TikTok</Label>
                  <Input
                    id="tiktok_url"
                    value={getValue('tiktok_url')}
                    onChange={(e) => setValue('tiktok_url', e.target.value)}
                    placeholder="https://tiktok.com/..."
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number">WhatsApp</Label>
                  <Input
                    id="whatsapp_number"
                    value={getValue('whatsapp_number')}
                    onChange={(e) => setValue('whatsapp_number', e.target.value)}
                    placeholder="+1234567890"
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram_url">Telegram</Label>
                  <Input
                    id="telegram_url"
                    value={getValue('telegram_url')}
                    onChange={(e) => setValue('telegram_url', e.target.value)}
                    placeholder="https://t.me/..."
                    className="bg-card"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Store Settings */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>Configure your store preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={getValue('currency')}
                    onChange={(e) => setValue('currency', e.target.value)}
                    placeholder="USD"
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency_symbol">Currency Symbol</Label>
                  <Input
                    id="currency_symbol"
                    value={getValue('currency_symbol')}
                    onChange={(e) => setValue('currency_symbol', e.target.value)}
                    placeholder="$"
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="free_shipping_threshold">Free Shipping Threshold</Label>
                  <Input
                    id="free_shipping_threshold"
                    type="number"
                    value={getValue('free_shipping_threshold')}
                    onChange={(e) => setValue('free_shipping_threshold', e.target.value)}
                    placeholder="100"
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    value={getValue('tax_rate')}
                    onChange={(e) => setValue('tax_rate', e.target.value)}
                    placeholder="0"
                    className="bg-card"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize your store for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={getValue('meta_title')}
                  onChange={(e) => setValue('meta_title', e.target.value)}
                  placeholder="Your Store - Best Fashion Products"
                  className="bg-card"
                />
                <p className="text-xs text-muted-foreground">Recommended: 50-60 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={getValue('meta_description')}
                  onChange={(e) => setValue('meta_description', e.target.value)}
                  placeholder="Shop the latest fashion trends..."
                  rows={3}
                  className="bg-card"
                />
                <p className="text-xs text-muted-foreground">Recommended: 150-160 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                <Input
                  id="meta_keywords"
                  value={getValue('meta_keywords')}
                  onChange={(e) => setValue('meta_keywords', e.target.value)}
                  placeholder="fashion, clothing, accessories, online store"
                  className="bg-card"
                />
                <p className="text-xs text-muted-foreground">Separate keywords with commas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect third-party services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                  <Input
                    id="google_analytics_id"
                    value={getValue('google_analytics_id')}
                    onChange={(e) => setValue('google_analytics_id', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                  <Input
                    id="facebook_pixel_id"
                    value={getValue('facebook_pixel_id')}
                    onChange={(e) => setValue('facebook_pixel_id', e.target.value)}
                    placeholder="XXXXXXXXXXXXXXX"
                    className="bg-card"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
