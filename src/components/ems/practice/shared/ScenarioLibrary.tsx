'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, Calculator, IndianRupee, BookOpen, ArrowRight, Loader2, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import type { PracticeScenario } from '@/lib/practiceTypes';
import { MODULE_NAMES, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/practiceTypes';

const MODULE_ICONS: Record<string, any> = {
    GST: FileText,
    TDS: Calculator,
    INCOME_TAX: IndianRupee
};

const MODULE_COLORS: Record<string, string> = {
    GST: 'green',
    TDS: 'orange',
    INCOME_TAX: 'blue'
};

const MODULE_ROUTES: Record<string, string> = {
    GST: '/ems/student/practice-lab/gst',
    TDS: '/ems/student/practice-lab/tds',
    INCOME_TAX: '/ems/student/practice-lab/income-tax'
};

export function ScenarioLibrary() {
    const router = useRouter();
    const [scenarios, setScenarios] = useState<PracticeScenario[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterModule, setFilterModule] = useState<string>('ALL');

    useEffect(() => {
        api.get('/ems/practice/scenarios').then(res => {
            setScenarios(res.data?.data || []);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        let list = scenarios;
        if (filterModule !== 'ALL') list = list.filter(s => s.module_type === filterModule);
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(s =>
                s.title.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q) ||
                s.module_type.toLowerCase().includes(q)
            );
        }
        return list;
    }, [scenarios, filterModule, search]);

    if (loading) {
        return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }

    if (scenarios.length === 0) {
        return (
            <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
                <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-500">No scenarios in library yet</p>
                    <p className="text-sm text-gray-400">Scenarios will appear once added by admin</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search scenarios by title, description, or module..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'GST', 'TDS', 'INCOME_TAX'].map(m => (
                        <button
                            key={m}
                            onClick={() => setFilterModule(m)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${filterModule === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {m === 'ALL' ? 'All' : MODULE_NAMES[m] || m}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-600">
                        <tr>
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">Module</th>
                            <th className="p-3 text-left">Title</th>
                            <th className="p-3 text-left hidden md:table-cell">Description</th>
                            <th className="p-3 text-center">Difficulty</th>
                            <th className="p-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filtered.map((s, idx) => {
                            const Icon = MODULE_ICONS[s.module_type] || FileText;
                            const color = MODULE_COLORS[s.module_type] || 'gray';
                            return (
                                <motion.tr
                                    key={s.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="p-3 text-gray-400 text-xs">{idx + 1}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg bg-${color}-100`}>
                                                <Icon className={`h-4 w-4 text-${color}-600`} />
                                            </div>
                                            <span className="font-bold text-xs">{MODULE_NAMES[s.module_type]}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 font-medium">{s.title}</td>
                                    <td className="p-3 text-gray-500 text-xs hidden md:table-cell max-w-xs truncate">{s.description}</td>
                                    <td className="p-3 text-center">
                                        <Badge className={DIFFICULTY_COLORS[s.difficulty]}>
                                            {DIFFICULTY_LABELS[s.difficulty] || s.difficulty}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => router.push(MODULE_ROUTES[s.module_type])}
                                            className="text-xs"
                                        >
                                            Practice <ArrowRight className="h-3 w-3 ml-1" />
                                        </Button>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                    <p className="font-bold">No scenarios match your search</p>
                    <p className="text-xs">Try different keywords or clear filters</p>
                </div>
            )}
        </div>
    );
}
