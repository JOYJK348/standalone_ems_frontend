'use client';

import { useRef, useState } from 'react';
import { FileText, Download, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFPreviewProps {
    title: string;
    children: React.ReactNode;
    filename?: string;
}

export function PDFPreview({ title, children, filename = 'document' }: PDFPreviewProps) {
    const [open, setOpen] = useState(false);
    const [generating, setGenerating] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        setGenerating(true);
        setTimeout(() => {
            window.print();
            setGenerating(false);
        }, 300);
    };

    const handleDownload = () => {
        setGenerating(true);
        setTimeout(() => {
            const printWindow = window.open('', '_blank');
            if (!printWindow) { setGenerating(false); return; }
            const content = contentRef.current?.innerHTML || '';
            printWindow.document.write(`
                <html>
                <head>
                    <title>${title}</title>
                    <style>
                        @page { margin: 20mm; size: A4; }
                        body { font-family: 'Courier New', monospace; font-size: 11px; color: #000; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                        th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
                        th { background: #f0f0f0; font-weight: bold; }
                        h2 { font-size: 16px; margin: 20px 0 5px; border-bottom: 2px solid #000; padding-bottom: 4px; }
                        h3 { font-size: 13px; margin: 15px 0 5px; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .header h1 { font-size: 18px; margin: 0; }
                        .header p { font-size: 11px; color: #555; margin: 4px 0; }
                        .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #888; border-top: 1px solid #ccc; padding-top: 10px; }
                        .label { color: #555; }
                        .value { font-weight: bold; }
                        .row { display: flex; justify-content: space-between; padding: 3px 0; }
                        .print-only { display: block; }
                        .no-print { display: none; }
                        .badge { display: inline-block; border: 1px solid #000; padding: 1px 6px; font-size: 9px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <p>Government of India — Practice Lab Simulation</p>
        <p>Generated: ${new Date().toLocaleString('en-IN')}</p>
    </div>
    ${content}
    <div class="footer">
        <p>This is a practice simulation document. Not for official use.</p>
        <p>Agaran EdTech — Finance Practice Lab</p>
    </div>
    <script>window.onload = function() { window.print(); window.close(); }</script>
</body>
</html>
`);
printWindow.document.close();
setGenerating(false);
}, 500);
};

return (
<>
{/* Trigger Button */}
<Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-xs">
<FileText className="h-3.5 w-3.5 mr-1" />PDF Preview
</Button>

{/* Modal */}
{open && (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="font-bold text-sm">{title} — Preview</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrint} disabled={generating} className="text-xs">
                        {generating ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <FileText className="h-3.5 w-3.5 mr-1" />}
                        Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload} disabled={generating} className="text-xs">
                        {generating ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1" />}
                        Download
                    </Button>
                    <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-gray-200 rounded-lg">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white" ref={contentRef}>
                <div className="max-w-[210mm] mx-auto" style={{ fontFamily: "'Courier New', monospace", fontSize: '11px' }}>
                    {children}
                </div>
            </div>
        </div>
    </div>
)}
</>
);
}
