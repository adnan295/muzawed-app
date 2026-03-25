import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Phone, Check, X } from 'lucide-react';

export default function AccountDeletionRequestsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approved' | 'rejected'>('approved');

  const { data: requests = [] } = useQuery<any[]>({
    queryKey: ['account-deletion-requests', statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/admin/account-deletion-requests?status=${statusFilter}`);
      return res.json();
    }
  });

  const handleAction = async () => {
    if (!selectedRequest) return;
    try {
      const res = await fetch(`/api/admin/account-deletion-requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: actionType, reviewedBy: 1, reviewNotes }),
      });
      if (!res.ok) throw new Error('فشل في تحديث الطلب');
      toast({ title: actionType === 'approved' ? 'تمت الموافقة على طلب الحذف' : 'تم رفض طلب الحذف', className: 'bg-green-600 text-white' });
      queryClient.invalidateQueries({ queryKey: ['account-deletion-requests'] });
      setIsActionDialogOpen(false);
      setSelectedRequest(null);
      setReviewNotes('');
    } catch (error: any) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">قيد المراجعة</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800">تمت الموافقة</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800">مرفوض</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center gap-3 mb-4">
        <Trash2 className="w-6 h-6 text-red-500" />
        <h3 className="text-xl font-bold">طلبات حذف الحسابات</h3>
      </div>

      <div className="flex gap-2 mb-4">
        {['pending', 'approved', 'rejected'].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            className="rounded-xl"
            onClick={() => setStatusFilter(s)}
            data-testid={`filter-deletion-${s}`}
          >
            {s === 'pending' ? 'قيد المراجعة' : s === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
          </Button>
        ))}
      </div>

      {requests.length === 0 ? (
        <Card className="p-8 text-center rounded-2xl">
          <Trash2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">لا توجد طلبات حذف {statusFilter === 'pending' ? 'قيد المراجعة' : ''}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req: any) => (
            <Card key={req.id} className="p-4 rounded-2xl" data-testid={`deletion-request-${req.id}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="font-mono text-sm font-bold">{req.phone}</span>
                    {getStatusBadge(req.status)}
                  </div>
                  {req.reason && (
                    <p className="text-sm text-gray-600 mb-2">السبب: {req.reason}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(req.createdAt).toLocaleDateString('ar-SY')} - {new Date(req.createdAt).toLocaleTimeString('ar-SY')}
                  </p>
                  {req.reviewNotes && (
                    <p className="text-xs text-gray-500 mt-1">ملاحظات المراجعة: {req.reviewNotes}</p>
                  )}
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="rounded-xl bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setSelectedRequest(req);
                        setActionType('approved');
                        setIsActionDialogOpen(true);
                      }}
                      data-testid={`approve-deletion-${req.id}`}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-xl"
                      onClick={() => {
                        setSelectedRequest(req);
                        setActionType('rejected');
                        setIsActionDialogOpen(true);
                      }}
                      data-testid={`reject-deletion-${req.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="rounded-2xl max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approved' ? 'الموافقة على حذف الحساب' : 'رفض طلب الحذف'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-sm">رقم الهاتف: <span className="font-bold">{selectedRequest.phone}</span></p>
                {selectedRequest.reason && <p className="text-sm text-gray-600 mt-1">السبب: {selectedRequest.reason}</p>}
              </div>
            )}
            <Textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="ملاحظات المراجعة (اختياري)..."
              className="rounded-xl"
              dir="rtl"
              data-testid="textarea-review-notes"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAction}
                className={`rounded-xl flex-1 ${actionType === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                data-testid="button-confirm-action"
              >
                {actionType === 'approved' ? 'تأكيد الموافقة' : 'تأكيد الرفض'}
              </Button>
              <Button variant="outline" onClick={() => setIsActionDialogOpen(false)} className="rounded-xl" data-testid="button-cancel-action">
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
