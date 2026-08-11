import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import Button from './ui/Button';
import StatusBadge from './ui/StatusBadge';

const MONTHS = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' },   { value: 4, label: 'April' },
    { value: 5, label: 'May' },     { value: 6, label: 'June' },
    { value: 7, label: 'July' },    { value: 8, label: 'August' },
    { value: 9, label: 'September' },{ value: 10, label: 'October' },
    { value: 11, label: 'November' },{ value: 12, label: 'December' },
];

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

const EMPTY_FORM = {
    userId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    basic: '', allowances: '', deductions: '', bonus: '', overtimeRate: '15',
};

const BreakdownRow = ({ label, value, highlight, sub }) => (
    <div className={`flex justify-between py-1.5 ${highlight ? 'font-semibold text-slate-900' : 'text-slate-600'} ${sub ? 'pl-4 text-sm' : ''}`}>
        <span>{label}</span>
        <span className={highlight ? 'text-primary-700' : ''}>{value}</span>
    </div>
);

export default function PayrollManager({ employees }) {
    const [form, setForm]         = useState(EMPTY_FORM);
    const [preview, setPreview]   = useState(null);
    const [previewing, setPreviewing] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState('');
    const [history, setHistory]   = useState([]);
    const [histFilter, setHistFilter] = useState({ userId: '', year: new Date().getFullYear() });
    const debounceRef = useRef(null);

    const fetchHistory = useCallback(async () => {
        try {
            const res = await api.get('/payroll/all');
            setHistory(res.data.data || []);
        } catch { /* silent */ }
    }, []);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    // Auto-fill salary/allowances when employee changes
    const handleEmployeeChange = (userId) => {
        set('userId', userId);
        setPreview(null);
        setError('');
        setSuccess('');
        if (!userId) return;
        const emp = employees.find(e => e._id === userId);
        if (emp) {
            setForm(f => ({
                ...f,
                userId,
                basic: emp.salary ? String(emp.salary) : '',
                allowances: emp.allowances ? String(emp.allowances) : '',
            }));
        }
    };

    // Debounced live preview whenever key fields change
    useEffect(() => {
        if (!form.userId || !form.month || !form.year) { setPreview(null); return; }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setPreviewing(true);
            setError('');
            try {
                const params = {
                    userId: form.userId, month: form.month, year: form.year,
                    ...(form.basic        && { basic: form.basic }),
                    ...(form.allowances   && { allowances: form.allowances }),
                    ...(form.deductions   && { deductions: form.deductions }),
                    ...(form.bonus        && { bonus: form.bonus }),
                    ...(form.overtimeRate && { overtimeRate: form.overtimeRate }),
                };
                const res = await api.get('/payroll/preview', { params });
                setPreview(res.data.data);
            } catch (e) {
                setPreview(null);
                setError(e.response?.data?.message || 'Preview failed');
            } finally {
                setPreviewing(false);
            }
        }, 600);
        return () => clearTimeout(debounceRef.current);
    }, [form.userId, form.month, form.year, form.basic, form.allowances, form.deductions, form.bonus, form.overtimeRate]);

    const handleGenerate = async () => {
        if (!preview) return;
        if (preview.isDuplicate) {
            setError(`Payroll for ${preview.monthName} ${preview.year} already processed for ${preview.name}.`);
            return;
        }
        setGenerating(true);
        setError('');
        setSuccess('');
        try {
            await api.post('/payroll', {
                userId: form.userId, month: form.month, year: form.year,
                basic: preview.basicSalary, allowances: preview.allowanceVal,
                deductions: preview.deductionVal, bonus: preview.bonusVal,
                overtimeRate: preview.overtimeRate,
            });
            setSuccess(`Payslip for ${preview.name} (${preview.monthName} ${preview.year}) generated and saved.`);
            setForm(EMPTY_FORM);
            setPreview(null);
            fetchHistory();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to generate payroll');
        } finally {
            setGenerating(false);
        }
    };

    const filteredHistory = history.filter(p => {
        const matchUser = !histFilter.userId || p.userId?._id === histFilter.userId || p.userId === histFilter.userId;
        const matchYear = !histFilter.year  || p.year === Number(histFilter.year);
        return matchUser && matchYear;
    });

    const selectedEmp = employees.find(e => e._id === form.userId);

    return (
        <section className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* ── Form ── */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                    <h2 className="text-lg font-semibold">Generate Payroll</h2>

                    {error   && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-md">{error}</div>}
                    {success && <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-md">{success}</div>}

                    {/* Employee */}
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Employee</label>
                        <select
                            value={form.userId}
                            onChange={e => handleEmployeeChange(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-white text-sm"
                        >
                            <option value="">Select employee…</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name} — {emp.department || 'N/A'}</option>
                            ))}
                        </select>
                        {selectedEmp && (
                            <p className="text-xs text-slate-400 mt-1">
                                ID: {selectedEmp._id.slice(-6).toUpperCase()} · {selectedEmp.designation || 'N/A'}
                            </p>
                        )}
                    </div>

                    {/* Month / Year */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Month</label>
                            <select value={form.month} onChange={e => set('month', Number(e.target.value))} className="w-full px-3 py-2 border rounded-md bg-white text-sm">
                                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Year</label>
                            <input type="number" value={form.year} onChange={e => set('year', e.target.value)}
                                min="2020" max="2099" className="w-full px-3 py-2 border rounded-md text-sm" />
                        </div>
                    </div>

                    {/* Salary overrides */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Basic Salary ($) <span className="text-slate-400">auto-filled</span></label>
                            <input type="number" min="0" value={form.basic} onChange={e => set('basic', e.target.value)}
                                placeholder={selectedEmp?.salary || '0'} className="w-full px-3 py-2 border rounded-md text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Allowances ($) <span className="text-slate-400">auto-filled</span></label>
                            <input type="number" min="0" value={form.allowances} onChange={e => set('allowances', e.target.value)}
                                placeholder={selectedEmp?.allowances || '0'} className="w-full px-3 py-2 border rounded-md text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Deductions ($)</label>
                            <input type="number" min="0" value={form.deductions} onChange={e => set('deductions', e.target.value)}
                                placeholder="0" className="w-full px-3 py-2 border rounded-md text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Bonus ($)</label>
                            <input type="number" min="0" value={form.bonus} onChange={e => set('bonus', e.target.value)}
                                placeholder="0" className="w-full px-3 py-2 border rounded-md text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Overtime Rate ($/hr)</label>
                            <input type="number" min="0" value={form.overtimeRate} onChange={e => set('overtimeRate', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm" />
                        </div>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={!preview || preview.isDuplicate || generating || previewing}
                        className="w-full"
                    >
                        {generating ? 'Generating…' : 'Confirm & Generate Payslip PDF'}
                    </Button>
                </div>

                {/* ── Live Preview ── */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold mb-4">Live Breakdown Preview</h2>

                    {previewing && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full" />
                            Calculating…
                        </div>
                    )}

                    {!previewing && !preview && (
                        <p className="text-sm text-slate-400">Select an employee and period to see the live breakdown.</p>
                    )}

                    {!previewing && preview && (
                        <div className="space-y-1 text-sm">
                            {/* Employee info */}
                            <div className="bg-slate-50 rounded-lg p-3 mb-3 space-y-0.5">
                                <p className="font-semibold text-slate-800">{preview.name}</p>
                                <p className="text-xs text-slate-500">ID: {preview.employeeId} · {preview.department} · {preview.designation}</p>
                                <p className="text-xs text-slate-500">{preview.monthName} {preview.year}</p>
                                {preview.isDuplicate && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                                        ⚠ Already processed — duplicate blocked
                                    </span>
                                )}
                            </div>

                            {/* Attendance */}
                            <div className="border-b pb-2 mb-2">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Attendance</p>
                                <BreakdownRow label="Total Working Days" value={preview.totalWorkingDays} />
                                <BreakdownRow label="Present Days"       value={preview.presentDays}      sub />
                                <BreakdownRow label="Leave Days"         value={preview.leaveDays}         sub />
                                <BreakdownRow label="Absent Days"        value={preview.absentDays}        sub />
                                <BreakdownRow label="Overtime Hours"     value={`${preview.overtimeHours} hrs`} sub />
                            </div>

                            {/* Earnings */}
                            <div className="border-b pb-2 mb-2">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Earnings</p>
                                <BreakdownRow label="Basic Salary"   value={fmt(preview.basicSalary)}  />
                                <BreakdownRow label="Allowances"     value={fmt(preview.allowanceVal)} sub />
                                <BreakdownRow label="Bonus"          value={fmt(preview.bonusVal)}     sub />
                                <BreakdownRow label={`Overtime Pay (${preview.overtimeRate}/hr)`} value={fmt(preview.overtimePay)} sub />
                                <BreakdownRow label="Gross Salary"   value={fmt(preview.grossSalary)}  highlight />
                            </div>

                            {/* Deductions & Net */}
                            <div>
                                <BreakdownRow label="Deductions"  value={`-${fmt(preview.deductionVal)}`} />
                                <div className="mt-2 pt-2 border-t">
                                    <BreakdownRow label="Net Salary" value={fmt(preview.netSalary)} highlight />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Payroll History ── */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Payroll History</h2>
                    <div className="flex gap-2">
                        <select value={histFilter.userId} onChange={e => setHistFilter(f => ({ ...f, userId: e.target.value }))}
                            className="px-3 py-1.5 border rounded-md text-sm bg-white">
                            <option value="">All Employees</option>
                            {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                        </select>
                        <input type="number" value={histFilter.year} onChange={e => setHistFilter(f => ({ ...f, year: e.target.value }))}
                            placeholder="Year" className="w-24 px-3 py-1.5 border rounded-md text-sm" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-slate-600">
                        <thead className="bg-slate-100 text-slate-700 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-2">Employee</th>
                                <th className="px-4 py-2">Dept</th>
                                <th className="px-4 py-2">Period</th>
                                <th className="px-4 py-2 text-right">Basic</th>
                                <th className="px-4 py-2 text-right">Present</th>
                                <th className="px-4 py-2 text-right">Leave</th>
                                <th className="px-4 py-2 text-right">OT Hrs</th>
                                <th className="px-4 py-2 text-right">Allowances</th>
                                <th className="px-4 py-2 text-right">Deductions</th>
                                <th className="px-4 py-2 text-right">Gross</th>
                                <th className="px-4 py-2 text-right">Net Salary</th>
                                <th className="px-4 py-2">Payslip</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.length === 0 && (
                                <tr><td colSpan={12} className="text-center py-6 text-slate-400">No payroll records found.</td></tr>
                            )}
                            {filteredHistory.map(p => (
                                <tr key={p._id} className="border-b hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                        {p.userId?.name || '—'}
                                        <span className="block text-xs text-slate-400">{p.employeeId}</span>
                                    </td>
                                    <td className="px-4 py-3">{p.snapshot?.department || p.userId?.department || '—'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {MONTHS.find(m => m.value === p.month)?.label} {p.year}
                                    </td>
                                    <td className="px-4 py-3 text-right">{fmt(p.basic)}</td>
                                    <td className="px-4 py-3 text-right">{p.presentDays ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">{p.leaveDays ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">{p.overtimeHours ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">{fmt(p.allowances)}</td>
                                    <td className="px-4 py-3 text-right text-red-600">-{fmt(p.deductions)}</td>
                                    <td className="px-4 py-3 text-right">{fmt(p.grossSalary)}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-primary-700">{fmt(p.netSalary)}</td>
                                    <td className="px-4 py-3">
                                        {p.payslipPath
                                            ? <a href={`http://localhost:3005${p.payslipPath}`} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-xs">PDF</a>
                                            : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
