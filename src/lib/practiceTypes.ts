export interface PracticeScenario {
    id: number;
    module_type: 'GST' | 'TDS' | 'INCOME_TAX';
    difficulty: 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD';
    title: string;
    description: string;
    setup_data: Record<string, any>;
    expected_hints: string[];
    is_active: boolean;
}

export interface HsnCode {
    id: number;
    hsn_code: string;
    description: string;
    gst_rate: number;
    category: string;
}

export interface TdsSection {
    id: number;
    section_code: string;
    description: string;
    tds_rate: number;
    threshold_amount: number;
    applicable_to: string;
    example_hint: string;
}

export interface TaxSlab {
    id: number;
    regime: 'NEW' | 'OLD';
    min_income: number;
    max_income: number;
    rate: number;
    cess_rate: number;
    fy_year: string;
}

export const MODULE_NAMES: Record<string, string> = {
    GST: 'GST GSTR-1',
    TDS: 'TDS Form 26Q',
    INCOME_TAX: 'ITR-1 Sahaj'
};

export const DIFFICULTY_LABELS: Record<string, string> = {
    BEGINNER: 'Beginner Friendly',
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard'
};

export const DIFFICULTY_COLORS: Record<string, string> = {
    BEGINNER: 'bg-green-100 text-green-800',
    EASY: 'bg-blue-100 text-blue-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HARD: 'bg-red-100 text-red-800'
};

export interface InvoiceEntry {
    id: string;
    invoice_number: string;
    invoice_date: string;
    invoice_type: 'B2B' | 'B2C';
    customer_name: string;
    customer_gstin: string;
    hsn_code: string;
    item_description: string;
    quantity: string;
    unit_price: string;
    taxable_value: string;
    gst_rate: string;
    cgst: string;
    sgst: string;
    igst: string;
    total_amount: string;
}

export interface DeducteeEntry {
    id: string;
    deductee_name: string;
    deductee_pan: string;
    section_code: string;
    payment_amount: string;
    tds_rate: string;
    tds_deducted: string;
    tds_deposited: string;
}

export function createEmptyInvoice(invoice_type: 'B2B' | 'B2C'): InvoiceEntry {
    return {
        id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        invoice_date: new Date().toISOString().split('T')[0],
        invoice_type,
        customer_name: '',
        customer_gstin: '',
        hsn_code: '',
        item_description: '',
        quantity: '1',
        unit_price: '',
        taxable_value: '',
        gst_rate: '',
        cgst: '0',
        sgst: '0',
        igst: '0',
        total_amount: '0'
    };
}

export function createEmptyDeductee(): DeducteeEntry {
    return {
        id: `ded_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        deductee_name: '',
        deductee_pan: '',
        section_code: '',
        payment_amount: '',
        tds_rate: '',
        tds_deducted: '0',
        tds_deposited: '0'
    };
}

export interface HsnSummaryRow {
    hsn_code: string;
    description: string;
    gst_rate: number;
    taxable_value: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
}

export const INDIAN_STATES = [
    { code: '35', name: 'Andaman & Nicobar Islands' },
    { code: '28', name: 'Andhra Pradesh' },
    { code: '12', name: 'Arunachal Pradesh' },
    { code: '18', name: 'Assam' },
    { code: '10', name: 'Bihar' },
    { code: '04', name: 'Chandigarh' },
    { code: '22', name: 'Chhattisgarh' },
    { code: '26', name: 'Dadra & Nagar Haveli' },
    { code: '25', name: 'Daman & Diu' },
    { code: '07', name: 'Delhi' },
    { code: '30', name: 'Goa' },
    { code: '24', name: 'Gujarat' },
    { code: '06', name: 'Haryana' },
    { code: '02', name: 'Himachal Pradesh' },
    { code: '01', name: 'Jammu & Kashmir' },
    { code: '20', name: 'Jharkhand' },
    { code: '29', name: 'Karnataka' },
    { code: '32', name: 'Kerala' },
    { code: '38', name: 'Ladakh' },
    { code: '31', name: 'Lakshadweep' },
    { code: '23', name: 'Madhya Pradesh' },
    { code: '27', name: 'Maharashtra' },
    { code: '14', name: 'Manipur' },
    { code: '17', name: 'Meghalaya' },
    { code: '15', name: 'Mizoram' },
    { code: '13', name: 'Nagaland' },
    { code: '21', name: 'Odisha' },
    { code: '34', name: 'Puducherry' },
    { code: '03', name: 'Punjab' },
    { code: '08', name: 'Rajasthan' },
    { code: '11', name: 'Sikkim' },
    { code: '33', name: 'Tamil Nadu' },
    { code: '36', name: 'Telangana' },
    { code: '16', name: 'Tripura' },
    { code: '09', name: 'Uttar Pradesh' },
    { code: '05', name: 'Uttarakhand' },
    { code: '19', name: 'West Bengal' }
];
