import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Gift, Copy, Share2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Referral() {
  const { toast } = useToast();
  const referralCode = 'SARY-9988';

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "تم نسخ الكود",
      description: "يمكنك الآن مشاركته مع أصدقائك",
      className: "bg-primary text-white border-none",
    });
  };

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header with Pattern */}
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
               احصل على رصيد 50000 ليرة لكل صديق يسجل ويطلب عن طريقك
             </p>
           </div>
        </div>

        <div className="px-4 -mt-12 relative z-20 space-y-6">
          {/* Code Card */}
          <Card className="p-6 border-none shadow-xl bg-white rounded-3xl text-center">
            <p className="text-sm text-muted-foreground mb-4 font-bold">كود الدعوة الخاص بك</p>
            <div className="bg-gray-50 border-2 border-dashed border-primary/20 rounded-2xl p-4 flex items-center justify-between mb-6">
              <span className="text-2xl font-black tracking-widest text-primary font-mono">{referralCode}</span>
              <Button size="sm" variant="secondary" onClick={copyCode} className="h-8 text-xs font-bold">
                <Copy className="w-3 h-3 ml-1" />
                نسخ
              </Button>
            </div>
            <Button className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 gap-2">
              <Share2 className="w-5 h-5" />
              مشاركة الرابط
            </Button>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 border-none shadow-sm bg-white rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="bg-green-100 p-2 rounded-full mb-2">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-2xl font-bold">12</span>
              <span className="text-xs text-muted-foreground mt-1">صديق مسجل</span>
            </Card>
            <Card className="p-4 border-none shadow-sm bg-white rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="bg-yellow-100 p-2 rounded-full mb-2">
                <Gift className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold">600</span>
              <span className="text-xs text-muted-foreground mt-1">رصيد مكتسب (ل.س)</span>
            </Card>
          </div>

          {/* How it works */}
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
                   <p className="text-xs text-muted-foreground mt-1">ستحصل فوراً على 50000 ليرة رصيد في محفظتك.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
