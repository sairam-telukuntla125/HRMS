import React, { useRef, useState } from 'react';
import api from '../services/api';
import Button from './ui/Button';

const EMPTY_FORM = { name: '', email: '', password: '', department: '', designation: '', doj: '' };

const OnboardEmployeeForm = ({ onSuccess }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [credentials, setCredentials] = useState(null);
    const submitInFlight = useRef(false);

    const submit = async (event) => {
        event.preventDefault();
        if (submitInFlight.current) return;

        submitInFlight.current = true;
        setSaving(true);
        setError('');
        try {
            await api.post('/onboarding/employees', form);
            setCredentials({ email: form.email, password: form.password });
            setForm(EMPTY_FORM);
            setOpen(false);
            onSuccess?.();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to create the employee account. Please try again.');
        } finally {
            submitInFlight.current = false;
            setSaving(false);
        }
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Onboard a new employee</h3>
                    <p className="mt-1 text-sm text-slate-500">Create the employee account and send their welcome notification.</p>
                </div>
                <Button variant="secondary" onClick={() => { setOpen((value) => !value); setError(''); }}>
                    {open ? 'Close form' : 'Onboard employee'}
                </Button>
            </div>

            {credentials && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                    <p><strong>Account created.</strong> The employee can sign in with <strong>{credentials.email}</strong> and temporary password <code className="rounded bg-white px-1.5 py-0.5 text-slate-900">{credentials.password}</code>.</p>
                    <button type="button" onClick={() => setCredentials(null)} className="font-semibold">Dismiss</button>
                </div>
            )}

            {open && (
                <form onSubmit={submit} className="mt-5 grid gap-3 md:grid-cols-2">
                    {[['name', 'Full name', 'text'], ['email', 'Work email', 'email'], ['password', 'Temporary password (minimum 6 characters)', 'password'], ['department', 'Department', 'text'], ['designation', 'Designation', 'text'], ['doj', 'Joining date', 'date']].map(([name, placeholder, type]) => (
                        <input
                            key={name}
                            required={name !== 'doj'}
                            minLength={name === 'password' ? 6 : undefined}
                            autoComplete={name === 'password' ? 'new-password' : undefined}
                            type={type}
                            placeholder={placeholder}
                            value={form[name]}
                            onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500"
                        />
                    ))}
                    {error && <p role="alert" className="md:col-span-2 text-sm text-red-600">{error}</p>}
                    <div className="md:col-span-2"><Button type="submit" disabled={saving}>{saving ? 'Onboarding...' : 'Create employee account'}</Button></div>
                </form>
            )}
        </section>
    );
};

export default OnboardEmployeeForm;
