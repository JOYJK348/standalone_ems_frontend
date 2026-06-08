'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, FileText, Calculator, Building2, MapPin, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';

interface GSTFormData {
    gstin: string;
    business_name: string;
    invoice_number: string;
    invoice_date: string;
    customer_name: string;
    customer_gstin: string;
    place_of_supply: string;
    taxable_value: string;
    gst_rate: string;
    cgst: string;
    sgst: string;
    igst: string;
    total_amount: string;
}

interface GSTPracticePortalProps {
    allocationId: number;
    onSuccess: () => void;
}

const STEPS = [
    { id: 1, title: 'Supplier Details', icon: Building2 },
    { id: 2, title: 'Invoice Details', icon: FileText },
    { id: 3, title: 'Customer Details', icon: Building2 },
    { id: 4, title: 'Tax Calculation', icon: Calculator },
    { id: 5, title: 'Review & Submit', icon: CheckCircle2 }
];

const STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal'
];

export function GSTPracticePortal({ allocationId, onSuccess }: GSTPracticePortalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<GSTFormData>({
        gstin: '',
        business_name: '',
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        invoice_date: new Date().toISOString().split('T')[0],
        customer_name: '',
        customer_gstin: '',
        place_of_supply: '',
        taxable_value: '',
        gst_rate: '',
        cgst: '0',
        sgst: '0',
        igst: '0',
        total_amount: '0'
    });

    const validateGSTIN = (gstin: string): boolean => {
        return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin);
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 1:
                if (!formData.gstin) newErrors.gstin = 'GSTIN is required';
                else if (!validateGSTIN(formData.gstin)) newErrors.gstin = 'Invalid GSTIN format (e.g., 29ABCDE1234F1Z5)';
                if (!formData.business_name) newErrors.business_name = 'Business name is required';
                break;
            case 2:
                if (!formData.invoice_number) newErrors.invoice_number = 'Invoice number is required';
                if (!formData.invoice_date) newErrors.invoice_date = 'Invoice date is required';
                break;
            case 3:
                if (!formData.customer_name) newErrors.customer_name = 'Customer name is required';
                if (formData.customer_gstin && !validateGSTIN(formData.customer_gstin)) {
                    newErrors.customer_gstin = 'Invalid GSTIN format';
                }
                if (!formData.place_of_supply) newErrors.place_of_supply = 'Place of supply is required';
                break;
            case 4:
                if (!formData.taxable_value || parseFloat(formData.taxable_value) <= 0) {
                    newErrors.taxable_value = 'Valid taxable value is required';
                }
                if (!formData.gst_rate) newErrors.gst_rate = 'GST rate is required';

                const taxable = parseFloat(formData.taxable_value || '0');
                const rate = parseFloat(formData.gst_rate || '0');
                const supplierState = formData.gstin.substring(0, 2);
                const customerState = formData.customer_gstin ? formData.customer_gstin.substring(0, 2) : '';
                const isInterState = customerState && supplierState !== customerState;

                if (isInterState) {
                    const expectedIGST = (taxable * rate) / 100;
                    if (Math.abs(parseFloat(formData.igst) - expectedIGST) > 0.01) {
                        newErrors.igst = `IGST should be ₹${expectedIGST.toFixed(2)}`;
                    }
                } else {
                    const expectedCGST = (taxable * rate) / 200;
                    const expectedSGST = (taxable * rate) / 200;
                    if (Math.abs(parseFloat(formData.cgst) - expectedCGST) > 0.01) {
                        newErrors.cgst = `CGST should be ₹${expectedCGST.toFixed(2)}`;
                    }
                    if (Math.abs(parseFloat(formData.sgst) - expectedSGST) > 0.01) {
                        newErrors.sgst = `SGST should be ₹${expectedSGST.toFixed(2)}`;
                    }
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const updateField = (field: keyof GSTFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === 'taxable_value' || field === 'gst_rate' || field === 'customer_gstin') {
            const taxable = field === 'taxable_value' ? parseFloat(value || '0') : parseFloat(formData.taxable_value || '0');
            const rate = field === 'gst_rate' ? parseFloat(value || '0') : parseFloat(formData.gst_rate || '0');
            const supplierState = formData.gstin.substring(0, 2);
            const customerGSTIN = field === 'customer_gstin' ? value : formData.customer_gstin;
            const customerState = customerGSTIN ? customerGSTIN.substring(0, 2) : '';
            const isInterState = customerState && supplierState !== customerState;

            if (isInterState) {
                const igst = (taxable * rate) / 100;
                setFormData(prev => ({
                    ...prev,
                    [field]: value,
                    cgst: '0',
                    sgst: '0',
                    igst: igst.toFixed(2),
                    total_amount: (taxable + igst).toFixed(2)
                }));
            } else {
                const cgst = (taxable * rate) / 200;
                const sgst = (taxable * rate) / 200;
                setFormData(prev => ({
                    ...prev,
                    [field]: value,
                    cgst: cgst.toFixed(2),
                    sgst: sgst.toFixed(2),
                    igst: '0',
                    total_amount: (taxable + cgst + sgst).toFixed(2)
                }));
            }
        }

        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
        } else {
            toast.error('Please fix the errors before proceeding');
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(4)) {
            toast.error('Please fix all errors');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/ems/practice/student/gst/entry', {
                allocationId,
                ...formData,
                taxable_value: parseFloat(formData.taxable_value),
                gst_rate: parseFloat(formData.gst_rate),
                cgst: parseFloat(formData.cgst),
                sgst: parseFloat(formData.sgst),
                igst: parseFloat(formData.igst),
                total_amount: parseFloat(formData.total_amount)
            });
            toast.success('GST Return submitted successfully!');
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-80">GSTR-1 - Sales Return</p>
                            <h3 className="text-xl font-bold">Step {currentStep} of {STEPS.length}</h3>
                        </div>
                        <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                            {Math.round(progress)}% Complete
                        </Badge>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <motion.div className="bg-white h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between">
                {STEPS.map((step) => {
                    const Icon = step.icon;
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;
                    return (
                        <div key={step.id} className="flex flex-col items-center flex-1">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' :
                                    isCurrent ? 'bg-green-600 text-white ring-4 ring-green-200' :
                                        'bg-gray-200 text-gray-400'
                                }`}>
                                {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                            </div>
                            <p className={`text-xs mt-2 font-bold text-center ${isCurrent ? 'text-green-600' : 'text-gray-500'}`}>
                                {step.title}
                            </p>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <Card className="border-0 shadow-xl">
                        <CardHeader className="bg-gray-50 border-b">
                            <CardTitle className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    {(() => { const Icon = STEPS[currentStep - 1].icon; return <Icon className="h-5 w-5 text-green-600" />; })()}
                                </div>
                                <p className="text-lg">{STEPS[currentStep - 1].title}</p>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                                        <Info className="h-5 w-5 text-green-600 shrink-0" />
                                        <div className="text-sm text-green-900">
                                            <p className="font-bold">Supplier Information</p>
                                            <p>Enter your business GSTIN and name as registered</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">GSTIN *</Label>
                                        <Input placeholder="e.g., 29ABCDE1234F1Z5" value={formData.gstin} onChange={(e) => updateField('gstin', e.target.value.toUpperCase())} className={`font-mono ${errors.gstin ? 'border-red-500' : ''}`} maxLength={15} />
                                        {errors.gstin && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.gstin}</p>}
                                        <p className="text-xs text-gray-500">15-character GSTIN format</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Business Name *</Label>
                                        <Input placeholder="e.g., ABC Enterprises" value={formData.business_name} onChange={(e) => updateField('business_name', e.target.value)} className={errors.business_name ? 'border-red-500' : ''} />
                                        {errors.business_name && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.business_name}</p>}
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Invoice Number *</Label>
                                            <Input value={formData.invoice_number} onChange={(e) => updateField('invoice_number', e.target.value)} className={`font-mono ${errors.invoice_number ? 'border-red-500' : ''}`} />
                                            {errors.invoice_number && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.invoice_number}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Invoice Date *</Label>
                                            <Input type="date" value={formData.invoice_date} onChange={(e) => updateField('invoice_date', e.target.value)} className={errors.invoice_date ? 'border-red-500' : ''} />
                                            {errors.invoice_date && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.invoice_date}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Customer Name *</Label>
                                        <Input placeholder="e.g., XYZ Pvt Ltd" value={formData.customer_name} onChange={(e) => updateField('customer_name', e.target.value)} className={errors.customer_name ? 'border-red-500' : ''} />
                                        {errors.customer_name && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.customer_name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Customer GSTIN (Optional)</Label>
                                        <Input placeholder="e.g., 33XYZAB5678G1Z2" value={formData.customer_gstin} onChange={(e) => updateField('customer_gstin', e.target.value.toUpperCase())} className={`font-mono ${errors.customer_gstin ? 'border-red-500' : ''}`} maxLength={15} />
                                        {errors.customer_gstin && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.customer_gstin}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Place of Supply *</Label>
                                        <select value={formData.place_of_supply} onChange={(e) => updateField('place_of_supply', e.target.value)} className={`w-full h-10 px-3 border rounded-md ${errors.place_of_supply ? 'border-red-500' : ''}`}>
                                            <option value="">-- Select State --</option>
                                            {STATES.map(state => <option key={state} value={state}>{state}</option>)}
                                        </select>
                                        {errors.place_of_supply && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.place_of_supply}</p>}
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Taxable Value (₹) *</Label>
                                            <Input type="number" placeholder="10000" value={formData.taxable_value} onChange={(e) => updateField('taxable_value', e.target.value)} className={errors.taxable_value ? 'border-red-500' : ''} step="0.01" />
                                            {errors.taxable_value && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.taxable_value}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">GST Rate *</Label>
                                            <select value={formData.gst_rate} onChange={(e) => updateField('gst_rate', e.target.value)} className={`w-full h-10 px-3 border rounded-md ${errors.gst_rate ? 'border-red-500' : ''}`}>
                                                <option value="">-- Select Rate --</option>
                                                <option value="5">5%</option>
                                                <option value="12">12%</option>
                                                <option value="18">18%</option>
                                                <option value="28">28%</option>
                                            </select>
                                            {errors.gst_rate && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.gst_rate}</p>}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 border-2 rounded-lg p-6">
                                        <h4 className="font-bold mb-4 flex items-center gap-2"><Calculator className="h-5 w-5" />Tax Breakdown</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div><p className="text-gray-500">CGST</p><p className="font-bold text-lg">₹{parseFloat(formData.cgst).toLocaleString('en-IN')}</p></div>
                                            <div><p className="text-gray-500">SGST</p><p className="font-bold text-lg">₹{parseFloat(formData.sgst).toLocaleString('en-IN')}</p></div>
                                            <div><p className="text-gray-500">IGST</p><p className="font-bold text-lg">₹{parseFloat(formData.igst).toLocaleString('en-IN')}</p></div>
                                            <div className="col-span-2 border-t pt-4"><p className="text-gray-500">Total Amount</p><p className="font-bold text-2xl text-green-600">₹{parseFloat(formData.total_amount).toLocaleString('en-IN')}</p></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 inline mr-2" />
                                        <span className="font-bold">Review your GST return carefully</span>
                                    </div>
                                    {[
                                        { title: 'Supplier', data: { GSTIN: formData.gstin, Name: formData.business_name } },
                                        { title: 'Invoice', data: { Number: formData.invoice_number, Date: formData.invoice_date } },
                                        { title: 'Customer', data: { Name: formData.customer_name, GSTIN: formData.customer_gstin || 'N/A', 'Place of Supply': formData.place_of_supply } },
                                        { title: 'Tax', data: { 'Taxable Value': `₹${parseFloat(formData.taxable_value).toLocaleString('en-IN')}`, 'GST Rate': `${formData.gst_rate}%`, CGST: `₹${formData.cgst}`, SGST: `₹${formData.sgst}`, IGST: `₹${formData.igst}`, Total: `₹${formData.total_amount}` } }
                                    ].map((section, i) => (
                                        <Card key={i} className="border-2">
                                            <CardHeader className="bg-gray-50 pb-3">
                                                <CardTitle className="text-sm flex justify-between">
                                                    <span>{section.title} Details</span>
                                                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(i + 1)}>Edit</Button>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    {Object.entries(section.data).map(([key, val]) => (
                                                        <div key={key}><p className="text-gray-500">{key}</p><p className="font-bold">{val}</p></div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-between gap-4">
                <Button variant="outline" onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))} disabled={currentStep === 1} className="px-8">
                    <ArrowLeft className="h-4 w-4 mr-2" />Previous
                </Button>
                {currentStep < STEPS.length ? (
                    <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700 px-8">
                        Next<ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700 px-8">
                        {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : <><CheckCircle2 className="h-4 w-4 mr-2" />Submit GST Return</>}
                    </Button>
                )}
            </div>
        </div>
    );
}
