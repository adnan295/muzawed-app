import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Gift, Copy, Share2, Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export default function Referral() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    if (user?.id) {
      setReferralCode(`MAZOUD-${user.id.toString().padStart(4, '0')}`);
    }
  }, [user?.id]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['referral-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { totalReferred: 0, completedReferrals: 0, totalEarned: '0' };
      const res = await fetch(`/api/referrals/stats/${user.id}`);
      if (!res.ok) return { totalReferred: 0, completedReferrals: 0, totalEarned: '0' };
      return res.json();
    },
    enabled: !!user?.id,
  });

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "تم نسخ الكود",
      description: "يمكنك الآن مشاركته مع أصدقائك",
      className: "bg-primary text-white border-none",
    });
  };

  const shareReferral = async () => {
    const shareText = `انضم إلى مزود - منصة الجملة الأولى في سوريا واحصل على خصم على أول طلب!\n\nاستخدم كود الدعوة: ${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'دعوة للانضمام إلى مزود',
          text: shareText,
        });
      } catch (err) {
        copyCode();
      }
    } else {
      copyCode();
    }
  };

  if (!isAuthenticated) {
    return (
      <MobileLayout hideHeader hideNav>
        <div className="flex flex-col items-center justify-center h-[80vh] p-6 text-center">
          <Gift className="w-16 h-16 text-primary mb-4" />
          <h2 className="text-xl font-bold mb-2">سجل دخولك أولاً</h2>
          <p className="text-muted-foreground">يرجى تسجيل الدخول للوصول لبرنامج الإحالة</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideHeader hideNav>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-primary p-6 pb-20 rounded-b-[3rem] text-white shadow-lg relative overflow-hidden text-center">
           <div className="absolute top-0 left-0 w-full h-full opacity-10" 
                style={{ backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2.5px)', backgroundSize: '20px 20px' }}>
           </div>
           
           <div className="relative z-10 mt-4">
             <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/10">
               <Gift className="w-10 h-10 text-white" />
             </div>
             <h1 className="text-2xl font-bold mb-2">ادعُ أصدقاءك</h1>
             <p className="text-purple-100 text-sm max-w-xs mx-auto">
               احصل على رصيد 50,000 ليرة لكل صديق يسجل ويطلب عن طريقك
             </p>
           </div>
        </div>

        <div className="px-4 -mt-12 relative z-20 space-y-6">
          <Card className="p-6 border-none shadow-xl bg-white rounded-3xl text-center">
            <p className="text-sm text-muted-foreground mb-4 font-bold">كود الدعوة الخاص بك</p>
            <div className="bg-gray-50 border-2 border-dashed border-primary/20 rounded-2xl p-4 flex items-center justify-between mb-6">
              <span className="text-2xl font-black tracking-widest text-primary font-mono">{referralCode}</span>
              <Button size="sm" variant="secondary" onClick={copyCode} className="h-8 text-xs font-bold" data-testid="button-copy-code">
                <Copy className="w-3 h-3 ml-1" />
                نسخ
              </Button>
            </div>
            <Button 
              className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 gap-2"
              onClick={shareReferral}
              data-testid="button-share-referral"
            >
              <Share2 className="w-5 h-5" />
              مشاركة الرابط
            </Button>
          </Card>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 border-none shadow-sm bg-white rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="bg-green-100 p-2 rounded-full mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-2xl font-bold" data-testid="text-total-referred">{stats?.totalReferred || 0}</span>
                <span className="text-xs text-muted-foreground mt-1">صديق مسجل</span>
              </Card>
              <Card className="p-4 border-none shadow-sm bg-white rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="bg-yellow-100 p-2 rounded-full mb-2">
                  <Gift className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-2xl font-bold" data-testid="text-total-earned">{parseInt(stats?.totalEarned || '0').toLocaleString('ar-SY')}</span>
                <span className="text-xs text-muted-foreground mt-1">رصيد مكتسب (ل.س)</span>
              </Card>
            </div>
          )}

          <div>
            <h3 className="font-bold text-sm mb-3 px-1">كيف تعمل؟</h3>
            <div className="space-y-4">
               <div className="flex gap-4 items-start">
                 <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                 <div>
                   <h4 className="font-bold text-sm">شارك الكود</h4>
                   <p className="text-xs text-muted-foreground mt-1">أرسل كود الدعوة لأصدقائك من أصحاب المحلات والمتاجر.</p>
                 </div>
               </div>
               <div className="flex gap-4 items-start">
                 <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                 <div>
                   <h4 className="font-bold text-sm">هم يسجلون ويطلبون</h4>
                   <p className="text-xs text-muted-foreground mt-1">عند تسجيلهم واستخدام الكود في أول طلب لهم.</p>
                 </div>
               </div>
               <div className="flex gap-4 items-start">
                 <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                 <div>
                   <h4 className="font-bold text-sm">أنت تكسب!</h4>
                   <p className="text-xs text-muted-foreground mt-1">ستحصل فوراً على 50,000 ليرة رصيد.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
