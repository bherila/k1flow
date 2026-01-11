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
import Form461Worksheet from './Form461Worksheet';
export default function ExcessBusinessLossDetail({ interestId, year }) {
    const [interest, setInterest] = useState(null);
    const [priorYearData, setPriorYearData] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        excess_business_loss: '',
        excess_business_loss_carryover: '',
    });
    const isDirty = data ? (formData.excess_business_loss !== (data.excess_business_loss || '') ||
        formData.excess_business_loss_carryover !== (data.excess_business_loss_carryover || '')) : false;
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
            setData(lossData);
            setPriorYearData(priorLossData);
            setFormData({
                excess_business_loss: lossData.excess_business_loss || '',
                excess_business_loss_carryover: lossData.excess_business_loss_carryover || '',
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
    return (_jsxs("div", { className: "space-y-6 container mx-auto py-8 max-w-3xl", children: [_jsx(LossLimitationTabs, { interestId: interestId, year: year, activeTab: "excess-business-loss", inceptionYear: interest?.inception_basis_year }), _jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold tracking-tight", children: [year, " Excess Business Loss"] }), interest && (_jsxs("p", { className: "text-muted-foreground mt-1", children: [interest.owner_company?.name, " interest in ", interest.owned_company?.name] }))] }), priorYearData && (!interest?.inception_basis_year || year > interest.inception_basis_year) && (_jsxs(Card, { className: "bg-muted/30 border-dashed", children: [_jsx(CardHeader, { className: "py-3", children: _jsxs(CardTitle, { className: "text-sm font-medium", children: ["Prior Year (", year - 1, ") Reference"] }) }), _jsx(CardContent, { className: "py-3", children: _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Excess Business Loss" }), _jsx("p", { className: "font-mono", children: priorYearData.excess_business_loss ? formatCurrency(priorYearData.excess_business_loss) : '—' })] }), _jsxs("div", { children: [_jsxs(Label, { className: "text-xs text-muted-foreground flex items-center justify-between pr-2 text-blue-600 dark:text-blue-400", children: [_jsxs("span", { children: ["Carryover to ", year, " (as NOL)"] }), priorYearData.excess_business_loss_carryover && (_jsx(Button, { variant: "ghost", size: "icon", className: "h-4 w-4", title: "Copy to current year (if needed)", onClick: () => setFormData(prev => ({ ...prev, excess_business_loss: priorYearData.excess_business_loss_carryover || '' })), children: _jsx(Copy, { className: "h-3 w-3" }) }))] }), _jsx("p", { className: "font-mono font-bold", children: priorYearData.excess_business_loss_carryover ? formatCurrency(priorYearData.excess_business_loss_carryover) : '—' })] })] }) })] })), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Section 461(l) Details" }), _jsx(CardDescription, { children: "Excess business loss disallowed under Section 461(l)." })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSave, className: "space-y-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "excess_business_loss", children: "Excess Business Loss" }), _jsx(Input, { id: "excess_business_loss", type: "number", step: "0.01", value: formData.excess_business_loss, onChange: (e) => setFormData({ ...formData, excess_business_loss: e.target.value }) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Total excess business loss calculated on Form 461" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "excess_business_loss_carryover", children: "Carryover to Next Year" }), _jsx(Input, { id: "excess_business_loss_carryover", type: "number", step: "0.01", value: formData.excess_business_loss_carryover, onChange: (e) => setFormData({ ...formData, excess_business_loss_carryover: e.target.value }) }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["This amount is treated as a Net Operating Loss (NOL) in ", year + 1] })] }), _jsxs("div", { className: "pt-4 flex justify-between items-center", children: [_jsxs(Button, { type: "button", variant: "outline", className: "gap-2", onClick: () => window.location.href = `/ownership/${interestId}/net-operating-loss/${year + 1}`, children: ["Go to ", year + 1, " Net Operating Loss", _jsx(ArrowRight, { className: "h-4 w-4" })] }), _jsxs(Button, { type: "submit", disabled: saving || !isDirty, className: "gap-2", children: [saving ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : _jsx(Save, { className: "h-4 w-4" }), "Save Changes"] })] })] }) })] }), _jsx(Form461Worksheet, { interestId: interestId, year: year, onCalculationUpdate: (ebl) => {
                    // Optional: auto-update the top form if the calculation changes?
                    // For now just letting the user see the result.
                } })] }));
}
//# sourceMappingURL=ExcessBusinessLossDetail.js.map