import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import API, { Coupon, CouponCreate, CouponUpdate } from '@/services/api';
import { Loader2, Trash, Pencil } from 'lucide-react';

const CouponManager: React.FC = () => {
    const { toast } = useToast();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<{ code: string; discount_amount: string; discount_percent: string; valid_from: string; valid_to: string; }>(
        { code: '', discount_amount: '', discount_percent: '', valid_from: '', valid_to: '' }
    );
    const [saving, setSaving] = useState(false);

    const loadCoupons = async () => {
        try {
            setLoading(true);
            const list = await API.getCoupons();
            setCoupons(list);
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to load coupons', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCoupons(); }, []);

    const resetForm = () => setForm({ code: '', discount_amount: '', discount_percent: '', valid_from: '', valid_to: '' });

    const handleCreate = async () => {
        if (!form.code) return;
        const payload: CouponCreate = {
            code: form.code.trim(),
            active: true
        };
        if (form.discount_amount) payload.discount_amount = parseInt(form.discount_amount) * 100; // rupees→paise
        if (form.discount_percent) payload.discount_percent = parseFloat(form.discount_percent);
        if (form.valid_from) payload.valid_from = new Date(form.valid_from).toISOString();
        if (form.valid_to) payload.valid_to = new Date(form.valid_to).toISOString();

        try {
            setSaving(true);
            await API.createCoupon(payload);
            toast({ title: 'Coupon created' });
            resetForm();
            loadCoupons();
        } catch (err: any) {
            toast({ title: 'Error', description: err.response?.data?.detail || 'Failed' , variant: 'destructive'});
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (code: string) => {
        if (!window.confirm(`Delete coupon ${code}?`)) return;
        try {
            await API.deleteCoupon(code);
            toast({ title: 'Deleted' });
            loadCoupons();
        } catch { toast({ title: 'Error', description: 'Delete failed', variant: 'destructive'}); }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Coupon Manager</h1>

            {/* Create coupon form */}
            <Card>
                <CardContent className="space-y-4 p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input placeholder="Code" value={form.code} onChange={e=>setForm({...form, code: e.target.value})} />
                        <Input placeholder="Discount amount (₹)" value={form.discount_amount} onChange={e=>setForm({...form, discount_amount: e.target.value, discount_percent: ''})} />
                        <Input placeholder="Discount percent (0-100)" value={form.discount_percent} onChange={e=>setForm({...form, discount_percent: e.target.value, discount_amount: ''})} />
                        <Input type="date" placeholder="Valid From" value={form.valid_from} onChange={e=>setForm({...form, valid_from: e.target.value})} />
                        <Input type="date" placeholder="Valid To" value={form.valid_to} onChange={e=>setForm({...form, valid_to: e.target.value})} />
                    </div>
                    <Button onClick={handleCreate} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Coupon'}</Button>
                </CardContent>
            </Card>

            {/* List */}
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            coupons.length === 0 ? (
                <p className="text-gray-400">No coupons found.</p>
            ) : (
            <div className="space-y-4">
                {coupons.map(c => (
                    <div key={c.id} className="border p-4 rounded flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{c.code}</p>
                            <p className="text-sm text-gray-600">Discount: {c.discount_percent ? `${c.discount_percent}%` : `₹${(c.discount_amount||0)/100}`} | Valid: {c.valid_from ? new Date(c.valid_from).toLocaleDateString() : '—'} → {c.valid_to ? new Date(c.valid_to).toLocaleDateString() : '—'}</p>
                        </div>
                        <div className="flex gap-3">
                            {/* Future: edit */}
                            <Button size="icon" variant="outline" onClick={()=>handleDelete(c.code)}><Trash className="w-4 h-4" /></Button>
                        </div>
                    </div>
                ))}
            </div>
            ))}
        </div>
    );
};

export default CouponManager; 
