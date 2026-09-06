import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart3, CheckCircle2, Activity, Save, Info, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

// Manages Google Analytics 4 and Google Tag Manager storefront configurations
const GoogleAnalyticsPage = () => {
  const queryClient = useQueryClient();

  const [measurementId, setMeasurementId] = useState('');
  const [gtmId, setGtmId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [streamName, setStreamName] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [enhancedMeasurement, setEnhancedMeasurement] = useState(true);

  const { data: gaData, isLoading } = useQuery({
    queryKey: ['google-analytics-settings'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/settings/google-analytics');
      return res.data?.data || {};
    },
  });

  useEffect(() => {
    if (gaData) {
      setMeasurementId(gaData.measurementId || '');
      setGtmId(gaData.gtmId || '');
      setPropertyId(gaData.propertyId || '');
      setStreamName(gaData.streamName || '');
      setIsEnabled(gaData.isEnabled !== false);
      setEnhancedMeasurement(gaData.enhancedMeasurement !== false);
    }
  }, [gaData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        measurementId: measurementId.trim(),
        gtmId: gtmId.trim(),
        propertyId: propertyId.trim(),
        streamName: streamName.trim(),
        isEnabled,
        enhancedMeasurement,
      };
      const res = await apiClient.put('/api/v1/settings/google-analytics', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Google Analytics settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['google-analytics-settings'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save Google Analytics settings');
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const isConfigured = Boolean(measurementId.trim());

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 w-full max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BarChart3 className="h-7 w-7 text-amber-500" />
            Google Analytics 4 & Tag Manager
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your storefront with Google Analytics 4 (GA4) streams and Google Tag Manager (GTM) containers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isConfigured && isEnabled ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 px-3 py-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Active Tracking
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground flex items-center gap-1.5 px-3 py-1">
              <Activity className="h-3.5 w-3.5 text-amber-500" />
              {!isEnabled ? 'Disabled' : 'Pending Configuration'}
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">GA4 Stream & Container Credentials</CardTitle>
            <CardDescription className="text-xs">
              Configure your Google Analytics 4 Measurement ID and optional Google Tag Manager Container ID.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">GA4 Measurement ID</label>
              <Input
                placeholder="e.g. G-95TCXBZG7W"
                value={measurementId}
                onChange={(e) => setMeasurementId(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-[11px] text-muted-foreground">
                Found in Google Analytics Admin &gt; Data Streams &gt; Web &gt; Measurement ID.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Google Tag Manager (GTM) Container ID (Optional)</label>
              <Input
                placeholder="e.g. GTM-DEC883Z"
                value={gtmId}
                onChange={(e) => setGtmId(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-[11px] text-muted-foreground">
                Optional container ID if you inject client-side marketing tags via Google Tag Manager.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">GA4 Property ID (Optional)</label>
                <Input
                  placeholder="e.g. 419823412"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Stream Name (Optional)</label>
                <Input
                  placeholder="e.g. Storefront Web Stream"
                  value={streamName}
                  onChange={(e) => setStreamName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Tracking Preferences</CardTitle>
            <CardDescription className="text-xs">
              Control event reporting and automated visitor interactions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground">Enable Google Analytics</p>
                <p className="text-[11px] text-muted-foreground">Inject gtag.js script snippet in public storefront pages.</p>
              </div>
              <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground">Enhanced Measurement</p>
                <p className="text-[11px] text-muted-foreground">Automatically track scroll depth, external link clicks, and site search queries.</p>
              </div>
              <Switch checked={enhancedMeasurement} onCheckedChange={setEnhancedMeasurement} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border/60 bg-muted/30 text-xs text-muted-foreground">
          <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-foreground">E-commerce Event Pipeline</p>
            <p>
              Storefront checkout and purchase events automatically broadcast standard GA4 e-commerce payloads including view_item, add_to_cart, and purchase with real-time revenue metrics.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full sm:w-auto cursor-pointer flex items-center gap-2 font-semibold"
          >
            <Save className="h-4 w-4" />
            <span>Save Google Analytics Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GoogleAnalyticsPage;
