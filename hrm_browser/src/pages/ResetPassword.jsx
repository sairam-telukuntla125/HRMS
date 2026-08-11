import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [error, setError] = React.useState('');
    const [saving, setSaving] = React.useState(false);
    const token = searchParams.get('token');

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        if (!token) return setError('This password reset link is invalid. Request a new one.');
        if (password !== confirmPassword) return setError('Passwords do not match.');

        setSaving(true);
        try {
            const response = await api.post('/auth/reset-password', { token, password });
            setMessage(response.data?.message || 'Password reset successfully. You can now sign in.');
            setPassword('');
            setConfirmPassword('');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to reset your password. Please request a new link.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
            <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-black/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-xl font-bold text-white">N</div>
                <h1 className="mt-6 text-3xl font-extrabold text-slate-950">Choose a new password</h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">Use at least six characters. Once saved, use the new password to sign in to your employee portal.</p>

                <form onSubmit={submit} className="mt-7 space-y-5">
                    <div>
                        <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-slate-700">New password</label>
                        <input id="new-password" required minLength="6" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100" />
                    </div>
                    <div>
                        <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-slate-700">Confirm new password</label>
                        <input id="confirm-password" required minLength="6" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100" />
                    </div>
                    {message && <p role="status" className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message} <Link to="/login" className="font-bold underline">Sign in</Link></p>}
                    {error && <p role="alert" className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-700">{error}</p>}
                    <button type="submit" disabled={saving || Boolean(message)} className="w-full rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Saving password...' : 'Save new password'}</button>
                </form>
                <Link to="/login" className="mt-6 block text-center text-sm font-semibold text-slate-600 hover:text-slate-950">Back to sign in</Link>
            </section>
        </main>
    );
}
