import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Plus, Trash2, Check, Home, Map } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressesAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useState, lazy, Suspense } from 'react';
import { Link } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const LocationPicker = lazy(() => import('@/components/ui/LocationPicker'));

interface Address {
  id: number;
  userId: number;
  title: string;
  details: string;
  type: string;
  latitude?: string | null;
  longitude?: string | null;
  isDefault: boolean;
}

export default function Addresses() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    details: '',
    type: 'محل تجاري',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ['addresses', user?.id],
    queryFn: () => addressesAPI.getAll(user!.id) as Promise<Address[]>,
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => addressesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setIsAddOpen(false);
      setShowMap(false);
      setNewAddress({ title: '', details: '', type: 'محل تجاري', latitude: null, longitude: null });
      toast({ title: "تم إضافة العنوان بنجاح" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => addressesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast({ title: "تم حذف العنوان" });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (addressId: number) => addressesAPI.setDefault(user!.id, addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast({ title: "تم تعيين العنوان الافتراضي" });
    },
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    setNewAddress({ ...newAddress, latitude: lat, longitude: lng });
  };

  const handleAddAddress = () => {
    if (!user) return;
    createMutation.mutate({
      userId: user.id,
      title: newAddress.title,
      details: newAddress.details,
      type: newAddress.type,
      latitude: newAddress.latitude?.toString(),
      longitude: newAddress.longitude?.toString(),
      isDefault: addresses.length === 0,
    });
  };

  if (!isAuthenticated) {
    return (
      <MobileLayout hideHeader>
        <div className="flex flex-col items-center justify-center h-[80vh] p-4">
          <MapPin className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">سجل دخولك أولاً</h2>
          <p className="text-gray-500 text-center mb-6">يجب تسجيل الدخول لعرض عناوينك</p>
          <Link href="/login">
            <Button className="rounded-xl px-8">تسجيل الدخول</Button>
          </Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl font-bold">عناويني</h1>
          <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) setShowMap(false); }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80 p-0 h-auto font-bold">
                <Plus className="w-4 h-4 ml-1" />
                إضافة جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة عنوان جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>عنوان الموقع</Label>
                  <Input 
                    placeholder="مثال: الفرع الرئيسي" 
                    value={newAddress.title}
                    onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                    data-testid="input-address-title"
                  />
                </div>
                <div>
                  <Label>التفاصيل</Label>
                  <Input 
                    placeholder="الحي، الشارع، رقم المبنى" 
                    value={newAddress.details}
                    onChange={(e) => setNewAddress({ ...newAddress, details: e.target.value })}
                    data-testid="input-address-details"
                  />
                </div>
                <div>
                  <Label>نوع الموقع</Label>
                  <div className="flex gap-2 mt-2">
                    {['محل تجاري', 'مستودع', 'مكتب'].map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={newAddress.type === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewAddress({ ...newAddress, type })}
                        className="rounded-full"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>الموقع على الخريطة</Label>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowMap(!showMap)}
                      className="text-primary h-auto p-0"
                    >
                      <Map className="w-4 h-4 ml-1" />
                      {showMap ? 'إخفاء الخريطة' : 'تحديد الموقع'}
                    </Button>
                  </div>
                  
                  {showMap && (
                    <Suspense fallback={<div className="h-[300px] bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center"><span className="text-gray-500">جاري تحميل الخريطة...</span></div>}>
                      <LocationPicker
                        initialLat={newAddress.latitude || undefined}
                        initialLng={newAddress.longitude || undefined}
                        onLocationSelect={handleLocationSelect}
                        height="300px"
                      />
                    </Suspense>
                  )}
                  
                  {!showMap && newAddress.latitude && newAddress.longitude && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-700">تم تحديد الموقع</p>
                        <p className="text-xs text-green-600" dir="ltr">
                          {newAddress.latitude.toFixed(6)}, {newAddress.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full rounded-xl" 
                  onClick={handleAddAddress}
                  disabled={!newAddress.title || !newAddress.details || createMutation.isPending}
                  data-testid="button-save-address"
                >
                  {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ العنوان'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="p-4 space-y-4">
          {isLoading ? (
            [1, 2].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
            ))
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Home className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">لم تضف أي عناوين بعد</p>
            </div>
          ) : (
            addresses.map((address) => (
              <Card key={address.id} className={`p-4 border-none shadow-sm ${address.isDefault ? 'ring-2 ring-primary ring-offset-2' : ''}`} data-testid={`address-card-${address.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-5 h-5 ${address.isDefault ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h3 className="font-bold">{address.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {address.latitude && address.longitude && (
                      <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Map className="w-3 h-3" />
                        موقع محدد
                      </span>
                    )}
                    {address.isDefault && (
                      <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                        الافتراضي
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mr-7 mb-4 leading-relaxed">
                  {address.details}
                  <br />
                  <span className="text-xs opacity-70">نوع الموقع: {address.type}</span>
                </p>

                <div className="flex gap-2 mr-7">
                  {!address.isDefault && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs flex-1 text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5"
                        onClick={() => deleteMutation.mutate(address.id)}
                        data-testid={`button-delete-${address.id}`}
                      >
                        <Trash2 className="w-3 h-3 ml-1" />
                        حذف
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs flex-1 text-primary hover:text-primary hover:bg-primary/5"
                        onClick={() => setDefaultMutation.mutate(address.id)}
                        data-testid={`button-set-default-${address.id}`}
                      >
                        <Check className="w-3 h-3 ml-1" />
                        تعيين كافتراضي
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
