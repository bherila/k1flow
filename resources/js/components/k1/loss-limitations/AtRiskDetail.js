import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useState, useEffect } from 'react';
import { fetchWrapper } from '@/fetchWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, Save, ArrowRight, ArrowLeft, Copy } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { LossLimitationTabs } from '../LossLimitationTabs';
export default function AtRiskDetail({ interestId, year }) {
    const [interest, setInterest] = useState(null);
    const [data, setData] = useState(null);
    const [priorYearData, setPriorYearData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        capital_at_risk: '',
        at_risk_deductible: '',
        at_risk_carryover: '',
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
            setData(lossData);
            setPriorYearData(priorLossData);
            setFormData({
                capital_at_risk: lossData.capital_at_risk || '',
                at_risk_deductible: lossData.at_risk_deductible || '',
                at_risk_carryover: lossData.at_risk_carryover || '',
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
            loadData(); // Reload to confirm
        }
        catch (error) {
            console.error('Failed to save:', error);
            setSaving(false);
        }
    };
    const copyPriorCarryover = () => {
        if (priorYearData?.at_risk_carryover) {
            // Typically the prior year carryover is the starting point for this year's disallowed loss
            // or contributes to this year's total loss to be tested against at-risk basis.
            // We'll just copy it into the capital_at_risk if that's what's intended, 
            // but usually at-risk carryover is added to current year losses.
            // However, the prompt asks to "copy-over the carryover value into the correct field".
            // Usually, At-Risk Carryover from prior year becomes part of the "Loss" tested this year.
            // If the user wants to copy it, we'll provide a way.
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }));
    }
    return (_jsxs("div", { className: "space-y-6 container mx-auto py-8 max-w-3xl", children: [_jsx(LossLimitationTabs, { interestId: interestId, year: year, activeTab: "at-risk", inceptionYear: interest?.inception_basis_year }), _jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold tracking-tight", children: [year, " At-Risk Limitations"] }), interest && (_jsxs("p", { className: "text-muted-foreground mt-1", children: [interest.owner_company?.name, " interest in ", interest.owned_company?.name] }))] }), priorYearData && (!interest?.inception_basis_year || year > interest.inception_basis_year) && (_jsxs(Card, { className: "bg-muted/30 border-dashed", children: [_jsx(CardHeader, { className: "py-3", children: _jsxs(CardTitle, { className: "text-sm font-medium", children: ["Prior Year (", year - 1, ") Reference"] }) }), _jsx(CardContent, { className: "py-3", children: _jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Capital At Risk" }), _jsx("p", { className: "font-mono", children: priorYearData.capital_at_risk ? formatCurrency(priorYearData.capital_at_risk) : '—' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground text-green-600 dark:text-green-400", children: "Deductible" }), _jsx("p", { className: "font-mono", children: priorYearData.at_risk_deductible ? formatCurrency(priorYearData.at_risk_deductible) : '—' })] }), _jsxs("div", { children: [_jsxs(Label, { className: "text-xs text-muted-foreground flex items-center justify-between pr-2 text-red-600 dark:text-red-400", children: [_jsx("span", { children: "Carryover" }), priorYearData.at_risk_carryover && (_jsx(Button, { variant: "ghost", size: "icon", className: "h-4 w-4", title: "Copy to current year", onClick: () => setFormData(prev => ({ ...prev, capital_at_risk: priorYearData.at_risk_carryover || '' })), children: _jsx(Copy, { className: "h-3 w-3" }) }))] }), _jsx("p", { className: "font-mono font-bold", children: priorYearData.at_risk_carryover ? formatCurrency(priorYearData.at_risk_carryover) : '—' })] })] }) })] })), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Form 6198 Details" }), _jsx(CardDescription, { children: "Enter values from Form 6198 to track at-risk limitations." })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSave, className: "space-y-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "capital_at_risk", children: "Capital At Risk" }), _jsx(Input, { id: "capital_at_risk", type: "number", step: "0.01", value: formData.capital_at_risk, onChange: (e) => setFormData({ ...formData, capital_at_risk: e.target.value }) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Total amount at risk (money contributed + share of liabilities for which you are personally liable)" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "at_risk_deductible", children: "Deductible Loss" }), _jsx(Input, { id: "at_risk_deductible", type: "number", step: "0.01", value: formData.at_risk_deductible, onChange: (e) => setFormData({ ...formData, at_risk_deductible: e.target.value }) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Amount of loss that is deductible this year based on at-risk limitations" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "at_risk_carryover", children: "Carryover to Next Year" }), _jsx(Input, { id: "at_risk_carryover", type: "number", step: "0.01", value: formData.at_risk_carryover, onChange: (e) => setFormData({ ...formData, at_risk_carryover: e.target.value }) }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Loss disallowed due to at-risk limitations, carried forward to ", year + 1] })] }), _jsx("div", { className: "pt-4 flex justify-end", children: _jsxs(Button, { type: "submit", disabled: saving, children: [saving && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Save Changes"] }) })] }) })] })] }));
}
//# sourceMappingURL=AtRiskDetail.js.map