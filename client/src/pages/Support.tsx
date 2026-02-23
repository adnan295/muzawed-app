import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MessageCircle, HelpCircle, Clock, Loader2, Send, CheckCircle2, Ticket, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Support() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const { data: settings = [], isLoading } = useQuery<any[]>({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await fetch('/api/site-settings');
      if (!res.ok) return [];
      return res.json();
    }
  });

  const { data: userTickets = [] } = useQuery<any[]>({
    queryKey: ['user-tickets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/tickets/user/${user.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user?.id,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });
      if (!res.ok) throw new Error('فشل في إنشاء التذكرة');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال الرسالة",
        description: "سنرد عليك في أقرب وقت ممكن",
      });
      setSubject('');
      setCategory('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['user-tickets'] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إرسال الرسالة",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!user?.id || !subject || !category || !description) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;
    createTicketMutation.mutate({
      ticketNumber,
      userId: user.id,
      category,
      subject,
      description,
      priority: 'medium',
      status: 'open',
    });
  };

  const getSetting = (key: string, defaultValue: string = '') => {
    const setting = settings.find((s: any) => s.key === key);
    return setting?.value || defaultValue;
  };

  const supportPhone = getSetting('support_phone', '+963 XXX XXX XXX');
  const supportEmail = getSetting('support_email', 'support@mazoud.sy');
  const supportWhatsapp = getSetting('support_whatsapp', '+963 XXX XXX XXX');
  const supportHours = getSetting('support_hours', 'السبت - الخميس: 9 صباحاً - 6 مساءً');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'مفتوحة';
      case 'in_progress': return 'قيد المعالجة';
      case 'resolved': return 'تم الحل';
      case 'closed': return 'مغلقة';
      default: return status;
    }
  };

  return (
    <MobileLayout hideHeader hideNav>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-primary p-6 pb-12 rounded-b-[2rem] text-white shadow-lg text-center relative">
          <button onClick={() => window.history.back()} className="absolute top-4 right-4 p-1 text-white">
            <ChevronRight className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold mb-2" data-testid="text-support-title">مركز المساعدة</h1>
          <p className="text-white/80 text-sm">كيف يمكننا مساعدتك اليوم؟</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="px-4 -mt-8 relative z-20 space-y-6">
            <Card className="p-4 border-none shadow-md bg-white rounded-2xl">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <a
                  href={`https://wa.me/${supportWhatsapp.replace(/[^0-9+]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center py-3 gap-2 hover:bg-gray-50 rounded-xl transition-colors"
                  data-testid="link-support-whatsapp"
                >
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">واتساب</span>
                </a>
                <a
                  href={`tel:${supportPhone.replace(/\s/g, '')}`}
                  className="flex flex-col items-center py-3 gap-2 hover:bg-gray-50 rounded-xl transition-colors"
                  data-testid="link-support-phone"
                >
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">اتصال</span>
                </a>
                <a
                  href={`mailto:${supportEmail}`}
                  className="flex flex-col items-center py-3 gap-2 hover:bg-gray-50 rounded-xl transition-colors"
                  data-testid="link-support-email"
                >
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">إيميل</span>
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-gray-50 p-2 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>{supportHours}</span>
              </div>
            </Card>

            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                الأسئلة الشائعة
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="item-1" className="bg-white rounded-xl border border-gray-100 px-4">
                  <AccordionTrigger className="hover:no-underline font-semibold text-sm">كيف يمكنني تتبع طلبي؟</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">
                    يمكنك تتبع طلبك من خلال الذهاب إلى صفحة "طلباتي" في القائمة السفلية، واختيار الطلب الحالي لمعرفة حالته وموقع المندوب.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="bg-white rounded-xl border border-gray-100 px-4">
                  <AccordionTrigger className="hover:no-underline font-semibold text-sm">ما هي طرق الدفع المتاحة؟</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">
                    نوفر الدفع نقداً عند الاستلام والدفع الآجل للعملاء المؤهلين حسب مستوى العضوية.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="bg-white rounded-xl border border-gray-100 px-4">
                  <AccordionTrigger className="hover:no-underline font-semibold text-sm">هل يوجد حد أدنى للطلب؟</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">
                    نعم، الحد الأدنى للطلب يختلف حسب المنتج. يرجى مراجعة تفاصيل كل منتج لمعرفة الحد الأدنى.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {isAuthenticated && userTickets.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  تذاكر الدعم السابقة
                </h3>
                <div className="space-y-2">
                  {userTickets.slice(0, 3).map((ticket: any) => (
                    <Card key={ticket.id} className="p-3 border-none shadow-sm bg-white rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground">{ticket.ticketNumber}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${getStatusColor(ticket.status)}`}>
                          {getStatusLabel(ticket.status)}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {isAuthenticated ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" />
                  أرسل لنا رسالة
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">نوع المشكلة *</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-gray-50 border-gray-200" data-testid="select-support-category">
                        <SelectValue placeholder="اختر نوع المشكلة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="order">مشكلة في طلب</SelectItem>
                        <SelectItem value="payment">مشكلة في الدفع</SelectItem>
                        <SelectItem value="product">استفسار عن منتج</SelectItem>
                        <SelectItem value="technical">مشكلة تقنية</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">الموضوع *</label>
                    <Input 
                      placeholder="اكتب عنوان المشكلة" 
                      className="bg-gray-50 border-gray-200" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      data-testid="input-support-subject" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">التفاصيل *</label>
                    <Textarea 
                      placeholder="اكتب تفاصيل مشكلتك هنا..." 
                      className="bg-gray-50 border-gray-200 min-h-[100px]" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      data-testid="textarea-support-message" 
                    />
                  </div>
                  <Button 
                    className="w-full font-bold" 
                    onClick={handleSubmit}
                    disabled={createTicketMutation.isPending || !subject || !category || !description}
                    data-testid="button-send-support"
                  >
                    {createTicketMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    ) : (
                      <Send className="w-4 h-4 ml-2" />
                    )}
                    إرسال
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
                <p className="text-sm text-muted-foreground">سجل دخولك لإرسال رسالة للدعم الفني</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
