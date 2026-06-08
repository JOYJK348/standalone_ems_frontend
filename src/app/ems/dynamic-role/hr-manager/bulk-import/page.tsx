"use client";

import { useState, useEffect } from "react";
import HRManagerLayout from "@/components/layout/HRManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Loader2, FileText, Download } from "lucide-react";
import api from "@/lib/api";

export default function BulkImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [importType, setImportType] = useState<"students" | "tutors">(
        "students",
    );
    const [importHistory, setImportHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchImportHistory();
    }, []);

    const fetchImportHistory = async () => {
        try {
            const res = await api.get("/ems/hr/bulk-import");
            if (res.data.success)
                setImportHistory(res.data.data?.imports || []);
        } catch {}
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a CSV file");
            return;
        }
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", importType);

            const res = await api.post("/ems/hr/bulk-import", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data.success) {
                toast.success(
                    `Import completed: ${res.data.data?.imported || 0} records imported`,
                );
                setFile(null);
                fetchImportHistory();
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Import failed");
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const headers =
            importType === "students"
                ? ["first_name", "last_name", "email", "phone", "course_code"]
                : [
                      "first_name",
                      "last_name",
                      "email",
                      "phone",
                      "employee_code",
                  ];

        const csv = headers.join(",") + "\n";
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${importType}_template.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <HRManagerLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="mb-6">
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-800 bg-clip-text text-transparent">
                            Bulk Import
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Import students and tutors from CSV files
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Import Form */}
                        <div>
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                                        Upload CSV
                                    </h2>

                                    <div className="flex gap-4 mb-4">
                                        <Button
                                            variant={
                                                importType === "students"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            onClick={() =>
                                                setImportType("students")
                                            }
                                            className={
                                                importType === "students"
                                                    ? "bg-indigo-600"
                                                    : ""
                                            }
                                        >
                                            Students
                                        </Button>
                                        <Button
                                            variant={
                                                importType === "tutors"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            onClick={() =>
                                                setImportType("tutors")
                                            }
                                            className={
                                                importType === "tutors"
                                                    ? "bg-indigo-600"
                                                    : ""
                                            }
                                        >
                                            Tutors
                                        </Button>
                                    </div>

                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-4 hover:border-indigo-400 transition-colors">
                                        <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-600 mb-2">
                                            {file
                                                ? file.name
                                                : "Drop CSV file here or click to browse"}
                                        </p>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="csv-upload"
                                        />
                                        <label
                                            htmlFor="csv-upload"
                                            className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold tracking-wide h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all"
                                        >
                                            Browse Files
                                        </label>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={downloadTemplate}
                                            className="flex-1"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Template
                                        </Button>
                                        <Button
                                            onClick={handleUpload}
                                            disabled={!file || uploading}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-4 w-4 mr-2" />{" "}
                                                    Upload
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Import History */}
                        <div>
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                                        Import History
                                    </h2>
                                    {importHistory.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                            No imports yet
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {importHistory.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {item.type} Import
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {item.file} ·{" "}
                                                            {item.date}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-green-600">
                                                            {item.imported}{" "}
                                                            imported
                                                        </p>
                                                        {item.failed > 0 && (
                                                            <p className="text-xs text-red-500">
                                                                {item.failed}{" "}
                                                                failed
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </HRManagerLayout>
        </div>
    );
}
