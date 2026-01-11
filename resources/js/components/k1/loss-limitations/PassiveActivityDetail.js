import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useState, useEffect } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, ArrowRight, ArrowLeft, Copy } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { LossLimitationTabs } from '../LossLimitationTabs';
export default function PassiveActivityDetail({ interestId, year }) {
    const [interest, setInterest] = useState(null);
    const [priorYearData, setPriorYearData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        passive_activity_loss: '',
        passive_loss_allowed: '',
        passive_loss_carryover: '',
    });
    useEffect(() => {
        loadData();
    }, [interestId, year]);
    const loadData = async () => {
        try {
            const [interestData, lossData, priorLossData] = await Promise.all([
                fetchWrapper.get(`/api/ownership-interests/${interestId}`),
                fetchWrapper.get(`/api/ownership-interests/${interestId}/losses/${year}`),
                fetchWrapper.get(`/api/ownership-interests/${interestId}/losses/${year - 1}`).catch(() => null)
            ]);
            setInterest(interestData);
            setPriorYearData(priorLossData);
            setFormData({
                passive_activity_loss: lossData.passive_activity_loss || '',
                passive_loss_allowed: lossData.passive_loss_allowed || '',
                passive_loss_carryover: lossData.passive_loss_carryover || '',
            });
        }
        catch (error) {
            console.error('Failed to load data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSave = async (e) => {
        if (e)
            e.preventDefault();
        setSaving(true);
        try {
            await fetchWrapper.put(`/api/ownership-interests/${interestId}/losses/${year}`, formData);
            setSaving(false);
            loadData();
        }
        catch (error) {
            console.error('Failed to save:', error);
            setSaving(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }));
    }
    return (_jsxs("div", { className: "space-y-6 container mx-auto py-8 max-w-3xl", children: [_jsx(LossLimitationTabs, { interestId: interestId, year: year, activeTab: "passive-activity-loss", inceptionYear: interest?.inception_basis_year }), _jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold tracking-tight", children: [year, " Passive Activity Limitations"] }), interest && (_jsxs("p", { className: "text-muted-foreground mt-1", children: [interest.owner_company?.name, " interest in ", interest.owned_company?.name] }))] }), priorYearData && (!interest?.inception_basis_year || year > interest.inception_basis_year) && (_jsxs(Card, { className: "bg-muted/30 border-dashed", children: [_jsx(CardHeader, { className: "py-3", children: _jsxs(CardTitle, { className: "text-sm font-medium", children: ["Prior Year (", year - 1, ") Reference"] }) }), _jsx(CardContent, { className: "py-3", children: _jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Total Loss" }), _jsx("p", { className: "font-mono", children: priorYearData.passive_activity_loss ? formatCurrency(priorYearData.passive_activity_loss) : '—' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground text-green-600 dark:text-green-400", children: "Allowed" }), _jsx("p", { className: "font-mono", children: priorYearData.passive_loss_allowed ? formatCurrency(priorYearData.passive_loss_allowed) : '—' })] }), _jsxs("div", { children: [_jsxs(Label, { className: "text-xs text-muted-foreground flex items-center justify-between pr-2 text-red-600 dark:text-red-400", children: [_jsx("span", { children: "Carryover" }), priorYearData.passive_loss_carryover && (_jsx(Button, { variant: "ghost", size: "icon", className: "h-4 w-4", title: "Copy to current year", onClick: () => setFormData(prev => ({ ...prev, passive_activity_loss: priorYearData.passive_loss_carryover || '' })), children: _jsx(Copy, { className: "h-3 w-3" }) }))] }), _jsx("p", { className: "font-mono font-bold", children: priorYearData.passive_loss_carryover ? formatCurrency(priorYearData.passive_loss_carryover) : '—' })] })] }) })] })), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Form 8582 Details" }), _jsx(CardDescription, { children: "Enter values from Form 8582 to track passive activity loss limitations." })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSave, className: "space-y-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "passive_activity_loss", children: "Total Passive Activity Loss" }), _jsx(Input, { id: "passive_activity_loss", type: "number", step: "0.01", value: formData.passive_activity_loss, onChange: (e) => setFormData({ ...formData, passive_activity_loss: e.target.value }) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Total loss from this passive activity for the year" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "passive_loss_allowed", children: "Allowed Loss" }), _jsx(Input, { id: "passive_loss_allowed", type: "number", step: "0.01", value: formData.passive_loss_allowed, onChange: (e) => setFormData({ ...formData, passive_loss_allowed: e.target.value }) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Amount of loss that is allowed (deductible) this year" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "passive_loss_carryover", children: "Carryover to Next Year" }), _jsx(Input, { id: "passive_loss_carryover", type: "number", step: "0.01", value: formData.passive_loss_carryover, onChange: (e) => setFormData({ ...formData, passive_loss_carryover: e.target.value }) }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Unallowed loss carried forward to ", year + 1] })] }), _jsx("div", { className: "pt-4 flex justify-end", children: _jsxs(Button, { type: "submit", disabled: saving, children: [saving && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Save Changes"] }) })] }) })] })] }));
}
//# sourceMappingURL=PassiveActivityDetail.js.map