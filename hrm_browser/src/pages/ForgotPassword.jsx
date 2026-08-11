import React from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
    const [email, setEmail] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [error, setError] = React.useState('');
    const [sending, setSending] = React.useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        setSending(true);
        try {
            const response = await api.post('/auth/forgot-password', { email });
            setMessage(response.data?.message || 'Check your inbox for a password reset link.');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to send the reset email. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
            <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-black/5">
                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-950">← Back to sign in</Link>
                <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-xl font-bold text-white">N</div>
                <h1 className="mt-6 text-3xl font-extrabold text-slate-950">Reset your password</h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">Enter the email address where you want to receive the password reset link.</p>

                <form onSubmit={submit} className="mt-7 space-y-5">
                    <div>
                        <label htmlFor="reset-email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
                        <input id="reset-email" required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-100" />
                    </div>
                    {message && <p role="status" className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p>}
                    {error && <p role="alert" className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-700">{error}</p>}
                    <button type="submit" disabled={sending} className="w-full rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">{sending ? 'Sending link...' : 'Send reset link'}</button>
                </form>
            </section>
        </main>
    );
}
