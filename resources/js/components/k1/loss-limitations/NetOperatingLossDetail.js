import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useState, useEffect } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { LossLimitationTabs } from '../LossLimitationTabs';
export default function NetOperatingLossDetail({ interestId, year }) {
    const [interest, setInterest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [priorYearData, setPriorYearData] = useState(null);
    const [formData, setFormData] = useState({
        nol_deduction_used: '',
        nol_carryforward: '',
        nol_80_percent_limit: '',
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
                nol_deduction_used: lossData.nol_deduction_used || '',
                nol_carryforward: lossData.nol_carryforward || '',
                nol_80_percent_limit: lossData.nol_80_percent_limit || '',
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
    return (_jsxs("div", { className: "space-y-6 container mx-auto py-8 max-w-3xl", children: [_jsx(LossLimitationTabs, { interestId: interestId, year: year, activeTab: "net-operating-loss", inceptionYear: interest?.inception_basis_year }), _jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold tracking-tight", children: [year, " Net Operating Loss"] }), interest && (_jsxs("p", { className: "text-muted-foreground mt-1", children: [interest.owner_company?.name, " interest in ", interest.owned_company?.name] }))] }), priorYearData && (!interest?.inception_basis_year || year > interest.inception_basis_year) && (_jsxs(Card, { className: "bg-muted/30", children: [_jsxs(CardHeader, { className: "py-3 flex flex-row items-center justify-between space-y-0", children: [_jsxs(CardTitle, { className: "text-sm font-medium", children: ["Prior Year (", year - 1, ") Reference"] }), _jsxs("a", { href: `/ownership/${interestId}/net-operating-loss/${year - 1}`, className: "text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors", children: [_jsx(ExternalLink, { className: "h-3 w-3" }), "Edit ", year - 1, " NOL"] })] }), _jsx(CardContent, { className: "py-3", children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsxs(Label, { className: "text-xs text-muted-foreground", children: ["Used in ", year - 1] }), _jsx("p", { className: "font-mono", children: priorYearData.nol_deduction_used ? formatCurrency(priorYearData.nol_deduction_used) : '—' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "EBL carried-over as NOL" }), _jsx("p", { className: "font-mono font-bold text-blue-600 dark:text-blue-400", children: priorYearData.excess_business_loss_carryover ? formatCurrency(priorYearData.excess_business_loss_carryover) : '—' }), _jsx("div", { className: "pt-0.5", children: _jsxs("a", { href: `/ownership/${interestId}/excess-business-loss/${year - 1}`, className: "text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 whitespace-nowrap overflow-hidden", children: ["Go to ", year - 1, " EBL", _jsx(ArrowRight, { className: "h-2.5 w-2.5" })] }) })] }), _jsxs("div", { children: [_jsxs(Label, { className: "text-xs text-muted-foreground", children: ["NOL Carryforward to ", year] }), _jsx("p", { className: "font-mono font-bold text-blue-600 dark:text-blue-400", children: priorYearData.nol_carryforward ? formatCurrency(priorYearData.nol_carryforward) : '—' })] }), _jsxs("div", { children: [_jsxs(Label, { className: "text-xs text-muted-foreground", children: ["80% Limit ", year - 1] }), _jsx("p", { className: "font-mono", children: priorYearData.nol_80_percent_limit ? formatCurrency(priorYearData.nol_80_percent_limit) : '—' })] })] }) })] })), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "NOL Details" }), _jsx(CardDescription, { children: "Net Operating Loss tracking and limitations." })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSave, className: "space-y-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "nol_deduction_used", children: "NOL Deduction Used" }), _jsx(Input, { id: "nol_deduction_used", type: "number", step: "0.01", value: formData.nol_deduction_used, onChange: (e) => setFormData({ ...formData, nol_deduction_used: e.target.value }) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Amount of NOL deduction used to offset income this year" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "nol_80_percent_limit", children: "80% Income Limit" }), _jsx(Input, { id: "nol_80_percent_limit", type: "number", step: "0.01", value: formData.nol_80_percent_limit, onChange: (e) => setFormData({ ...formData, nol_80_percent_limit: e.target.value }) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "For post-2017 NOLs, deduction is limited to 80% of taxable income (in years after 2020)" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "nol_carryforward", children: "NOL Carryforward" }), _jsx(Input, { id: "nol_carryforward", type: "number", step: "0.01", value: formData.nol_carryforward, onChange: (e) => setFormData({ ...formData, nol_carryforward: e.target.value }) }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Remaining NOL carried forward to ", year + 1] })] }), _jsx("div", { className: "pt-4 flex justify-end", children: _jsxs(Button, { type: "submit", disabled: saving, children: [saving && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Save Changes"] }) })] }) })] })] }));
}
//# sourceMappingURL=NetOperatingLossDetail.js.map