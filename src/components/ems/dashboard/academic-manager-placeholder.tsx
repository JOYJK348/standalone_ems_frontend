"use client";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LucideIcon } from "lucide-react";
import Link from "next/link";

interface PlaceholderPageProps {
    title: string;
    description: string;
    icon: LucideIcon;
}

export function AcademicManagerPlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <Link href="/ems/academic-manager/dashboard">
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>

                    <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        {title}
                    </h1>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <Icon className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                            <p className="text-gray-600 mb-6">{description}</p>
                            <p className="text-sm text-gray-500">
                                This page is under development. Full functionality coming soon.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </AcademicManagerLayout>
        </div>
    );
}
