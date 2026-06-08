"use client";

import React, { useState, useEffect } from "react";
import {
    Check, X, ChevronDown, ChevronRight,
    Users, CalendarCheck, Wallet, Handshake, GraduationCap, CircleDollarSign,
    Loader2
} from "lucide-react";

interface Module {
    key: string;
    name: string;
    description: string;
    menus: Menu[];
}

interface Menu {
    id: number;
    menu_key: string;
    menu_name: string;
    display_name: string;
    icon?: string;
    children?: Menu[];
}

interface CustomPlanConfig {
    enabled_modules: string[];
    allowed_menu_ids: number[];
    max_users: number;
    max_branches: number;
    max_departments: number;
    max_designations: number;
}

interface CustomPlanBuilderProps {
    modules: Module[];
    coreMenus: Menu[];
    onConfigChange: (config: CustomPlanConfig) => void;
    initialConfig?: Partial<CustomPlanConfig>;
}

const MODULE_ICONS: Record<string, React.ComponentType<any>> = {
    HR: Users,
    ATTENDANCE: CalendarCheck,
    PAYROLL: Wallet,
    CRM: Handshake,
    LMS: GraduationCap,
    FINANCE: CircleDollarSign
};

export default function CustomPlanBuilder({
    modules,
    coreMenus,
    onConfigChange,
    initialConfig
}: CustomPlanBuilderProps) {
    const [selectedModules, setSelectedModules] = useState<Set<string>>(
        new Set(initialConfig?.enabled_modules || [])
    );
    const [selectedMenus, setSelectedMenus] = useState<Set<number>>(
        new Set(initialConfig?.allowed_menu_ids || [])
    );
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [limits, setLimits] = useState({
        max_users: initialConfig?.max_users || 10,
        max_branches: initialConfig?.max_branches || 1,
        max_departments: initialConfig?.max_departments || 5,
        max_designations: initialConfig?.max_designations || 5
    });

    // Emit changes
    useEffect(() => {
        onConfigChange({
            enabled_modules: Array.from(selectedModules),
            allowed_menu_ids: Array.from(selectedMenus),
            ...limits
        });
    }, [selectedModules, selectedMenus, limits]);

    // Toggle module selection
    const toggleModule = (moduleKey: string) => {
        const newSelected = new Set(selectedModules);
        const module = modules.find(m => m.key === moduleKey);

        if (newSelected.has(moduleKey)) {
            newSelected.delete(moduleKey);
            // Remove all menus from this module
            if (module) {
                const removeMenuIds = (menus: Menu[]) => {
                    menus.forEach(menu => {
                        selectedMenus.delete(menu.id);
                        if (menu.children) removeMenuIds(menu.children);
                    });
                };
                removeMenuIds(module.menus);
                setSelectedMenus(new Set(selectedMenus));
            }
        } else {
            newSelected.add(moduleKey);
            // Auto-select all menus from this module
            if (module) {
                const addMenuIds = (menus: Menu[]) => {
                    menus.forEach(menu => {
                        selectedMenus.add(menu.id);
                        if (menu.children) addMenuIds(menu.children);
                    });
                };
                addMenuIds(module.menus);
                setSelectedMenus(new Set(selectedMenus));
            }
        }

        setSelectedModules(newSelected);
    };

    // Toggle single menu selection
    const toggleMenu = (menuId: number, moduleKey: string) => {
        const newSelected = new Set(selectedMenus);

        if (newSelected.has(menuId)) {
            newSelected.delete(menuId);
        } else {
            newSelected.add(menuId);
            // Auto-enable module if not already
            if (!selectedModules.has(moduleKey)) {
                setSelectedModules(new Set([...selectedModules, moduleKey]));
            }
        }

        setSelectedMenus(newSelected);
    };

    // Toggle module expansion
    const toggleExpanded = (moduleKey: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleKey)) {
            newExpanded.delete(moduleKey);
        } else {
            newExpanded.add(moduleKey);
        }
        setExpandedModules(newExpanded);
    };

    // Render menu tree
    const renderMenuTree = (menus: Menu[], moduleKey: string, depth = 0) => {
        return menus.map(menu => (
            <div key={menu.id} style={{ marginLeft: depth * 20 }}>
                <label className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-50 rounded cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selectedMenus.has(menu.id)}
                        onChange={() => toggleMenu(menu.id, moduleKey)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{menu.display_name || menu.menu_name}</span>
                </label>
                {menu.children && menu.children.length > 0 && (
                    <div className="ml-4 border-l-2 border-slate-100">
                        {renderMenuTree(menu.children, moduleKey, depth + 1)}
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div className="space-y-6">
            {/* MODULE SELECTION */}
            <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
                    Select Modules
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {modules.map(mod => {
                        const Icon = MODULE_ICONS[mod.key] || Users;
                        const isSelected = selectedModules.has(mod.key);

                        return (
                            <div
                                key={mod.key}
                                onClick={() => toggleModule(mod.key)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                                    {isSelected ? (
                                        <Check className="w-4 h-4 text-blue-600" />
                                    ) : (
                                        <div className="w-4 h-4 rounded border-2 border-slate-300" />
                                    )}
                                </div>
                                <p className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                                    {mod.name}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">{mod.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MENU SELECTION */}
            {selectedModules.size > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span>
                        Configure Menu Access
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                        Select specific menus and sub-menus to enable for this plan
                    </p>

                    <div className="space-y-2">
                        {modules
                            .filter(mod => selectedModules.has(mod.key))
                            .map(mod => {
                                const Icon = MODULE_ICONS[mod.key] || Users;
                                const isExpanded = expandedModules.has(mod.key);
                                const menuCount = mod.menus.reduce((acc, m) => {
                                    let count = 1;
                                    if (m.children) count += m.children.length;
                                    return acc + count;
                                }, 0);
                                const selectedCount = mod.menus.reduce((acc, m) => {
                                    let count = selectedMenus.has(m.id) ? 1 : 0;
                                    if (m.children) {
                                        count += m.children.filter(c => selectedMenus.has(c.id)).length;
                                    }
                                    return acc + count;
                                }, 0);

                                return (
                                    <div key={mod.key} className="border border-slate-200 rounded-lg overflow-hidden">
                                        <div
                                            onClick={() => toggleExpanded(mod.key)}
                                            className="flex items-center justify-between p-3 bg-slate-50 cursor-pointer hover:bg-slate-100"
                                        >
                                            <div className="flex items-center gap-3">
                                                {isExpanded ? (
                                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                )}
                                                <Icon className="w-5 h-5 text-blue-600" />
                                                <span className="font-medium text-slate-800">{mod.name}</span>
                                            </div>
                                            <span className="text-xs text-slate-500">
                                                {selectedCount}/{menuCount} menus
                                            </span>
                                        </div>

                                        {isExpanded && (
                                            <div className="p-3 bg-white">
                                                {renderMenuTree(mod.menus, mod.key)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* LIMITS */}
            <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">3</span>
                    Set Resource Limits
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-slate-600">Max Users</label>
                        <input
                            type="number"
                            min="1"
                            max="1000"
                            value={limits.max_users}
                            onChange={e => setLimits({ ...limits, max_users: parseInt(e.target.value) || 10 })}
                            className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">0 = Unlimited</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-600">Max Branches</label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={limits.max_branches}
                            onChange={e => setLimits({ ...limits, max_branches: parseInt(e.target.value) || 1 })}
                            className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-600">Max Departments</label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={limits.max_departments}
                            onChange={e => setLimits({ ...limits, max_departments: parseInt(e.target.value) || 5 })}
                            className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-600">Max Designations</label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={limits.max_designations}
                            onChange={e => setLimits({ ...limits, max_designations: parseInt(e.target.value) || 5 })}
                            className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* SUMMARY */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <h4 className="text-sm font-bold text-blue-900 mb-2">Configuration Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span className="text-slate-600">Modules:</span>
                        <span className="ml-2 font-semibold text-blue-700">
                            {selectedModules.size} selected
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-600">Menus:</span>
                        <span className="ml-2 font-semibold text-blue-700">
                            {selectedMenus.size} selected
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-600">Users:</span>
                        <span className="ml-2 font-semibold">
                            {limits.max_users === 0 ? 'Unlimited' : limits.max_users}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-600">Branches:</span>
                        <span className="ml-2 font-semibold">
                            {limits.max_branches === 0 ? 'Unlimited' : limits.max_branches}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
