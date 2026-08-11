import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export default function Login() {

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const { login, user, loading } = useAuth();
    const navigate = useNavigate();

    const [errorMsg, setErrorMsg] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);

    React.useEffect(() => {

        if (!loading && user) {

            const path =
                user.role === "admin"
                    ? "/admin"
                    : user.role === "hr"
                    ? "/hr"
                    : "/employee";

            navigate(path, { replace: true });
        }

    }, [user, loading, navigate]);

    const onSubmit = async (data) => {

        try {

            setErrorMsg("");

            const res = await api.post("/auth/login", data);

            const userData = res.data?.data?.user;
            const accessToken = res.data?.data?.accessToken;
            const refreshToken = res.data?.data?.refreshToken;

            if (!userData || !accessToken || !refreshToken) {
                throw new Error("Missing authentication data");
            }

            login(userData, {
                accessToken,
                refreshToken,
            });

            const next =
                userData.role === "admin"
                    ? "/admin"
                    : userData.role === "hr"
                    ? "/hr"
                    : "/employee";

            navigate(next, { replace: true });

        } catch (err) {

            setErrorMsg(
                err.response?.data?.message ||
                "Login failed. Please check your credentials and try again."
            );

        }
    };

    const ROLES = [
        {
            label: "Admin",
            color: "bg-violet-50 text-violet-600 border-violet-100",
        },
        {
            label: "HR",
            color: "bg-blue-50 text-blue-600 border-blue-100",
        },
        {
            label: "Employee",
            color: "bg-indigo-50 text-indigo-600 border-indigo-100",
        },
    ];

    return (

        <div className="min-h-screen bg-white">

            {/* =====================================================
                NAVBAR
            ===================================================== */}

            <nav className="border-b border-slate-100 bg-white">

                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

                    {/* Logo */}

                    <Link
                        to="/"
                        className="flex items-center gap-3"
                    >

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-xl font-bold text-white shadow-lg shadow-black/10">
                            N
                        </div>

                        <div>

                            <h1 className="text-base font-extrabold tracking-tight text-slate-900">
                                NEUZEN AI
                            </h1>

                            <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400">
                                HRMS
                            </p>

                        </div>

                    </Link>

                    {/* Back Home */}

                    <Link
                        to="/"
                        className="group flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
                    >

                        <span className="transition-transform group-hover:-translate-x-1">
                            ←
                        </span>

                        Back to home

                    </Link>

                </div>

            </nav>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden px-6 py-14">

                {/* Background decoration */}

                <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-slate-100 blur-3xl" />

                <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-slate-100 blur-3xl" />


                <div className="relative z-10 grid w-full max-w-6xl items-center gap-16 lg:grid-cols-2">


                    {/* =================================================
                        LEFT SIDE
                    ================================================= */}

                    <div className="hidden lg:block">

                        <div className="max-w-xl">

                            {/* Badge */}

                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">

                                <span className="h-2 w-2 rounded-full bg-slate-950" />

                                <span className="text-xs font-semibold text-slate-700">
                                    Secure HRMS Portal
                                </span>

                            </div>


                            {/* Heading */}

                            <h2 className="text-5xl font-extrabold leading-tight tracking-tight text-slate-950">

                                Manage your workforce.

                                <span className="block text-slate-950">
                                    Smarter. Simpler.
                                </span>

                            </h2>


                            <p className="mt-6 max-w-lg text-base leading-8 text-slate-500">
                                Access your NEUZEN AI HRMS workspace to manage
                                employees, attendance, leaves, payroll,
                                onboarding and team collaboration.
                            </p>


                            {/* Benefits */}

                            <div className="mt-9 space-y-4">

                                {[
                                    "Secure role-based access",
                                    "Real-time HR operations",
                                    "Centralized employee management",
                                    "Attendance and payroll automation",
                                ].map((item) => (

                                    <div
                                        key={item}
                                        className="flex items-center gap-3"
                                    >

                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50">

                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                className="text-emerald-600"
                                            >
                                                <path d="M20 6L9 17l-5-5" />
                                            </svg>

                                        </div>

                                        <span className="text-sm font-medium text-slate-600">
                                            {item}
                                        </span>

                                    </div>

                                ))}

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        LOGIN CARD
                    ================================================= */}

                    <div className="w-full max-w-md justify-self-center">


                        {/* Mobile heading */}

                        <div className="mb-8 text-center lg:hidden">

                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-bold text-white shadow-lg shadow-black/10">
                                N
                            </div>

                            <h1 className="text-3xl font-extrabold text-slate-950">
                                Welcome back
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Sign in to your NEUZEN AI HRMS account
                            </p>

                        </div>


                        {/* Card */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-9">


                            {/* Card Header */}

                            <div className="mb-7">

                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">

                                    <svg
                                        width="13"
                                        height="13"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="text-slate-950"
                                    >
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>

                                    <span className="text-xs font-semibold text-slate-700">
                                        Secure Portal Access
                                    </span>

                                </div>


                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
                                    Welcome back
                                </h1>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Sign in to continue to your HRMS workspace.
                                </p>

                            </div>


                            {/* Error */}

                            {errorMsg && (

                                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">

                                    <svg
                                        width="17"
                                        height="17"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="mt-0.5 flex-shrink-0"
                                    >
                                        <circle cx="12" cy="12" r="10" />

                                        <path d="M12 8v4" />

                                        <path d="M12 16h.01" />

                                    </svg>

                                    <span>
                                        {errorMsg}
                                    </span>

                                </div>

                            )}


                            {/* =================================================
                                FORM
                            ================================================= */}

                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-5"
                            >


                                {/* Email */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Email address
                                    </label>

                                    <input
                                        {...register("email")}
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@company.com"
                                        className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                                            errors.email
                                                ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                                                : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                        }`}
                                    />

                                    {errors.email && (

                                        <p className="mt-1.5 text-xs font-medium text-red-500">
                                            {errors.email.message}
                                        </p>

                                    )}

                                </div>


                                {/* Password */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            {...register("password")}
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            className={`w-full rounded-xl border bg-white px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                                                errors.password
                                                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                                                    : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                            }`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-700"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>

                                    {errors.password && (

                                        <p className="mt-1.5 text-xs font-medium text-red-500">
                                            {errors.password.message}
                                        </p>

                                    )}

                                </div>


                                {/* Sign In */}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {isSubmitting
                                        ? "Signing in..."
                                        : "Sign in"
                                    }

                                    {!isSubmitting && (
                                        <span className="transition-transform group-hover:translate-x-1">
                                            →
                                        </span>
                                    )}

                                </button>

                            </form>

                            <Link to="/forgot-password" className="mt-4 block text-right text-sm font-semibold text-slate-600 hover:text-slate-950">
                                Forgot password?
                            </Link>


                            {/* Divider */}

                            <div className="my-7 flex items-center gap-4">

                                <div className="h-px flex-1 bg-slate-100" />

                                <span className="text-[11px] font-medium text-slate-400">
                                    ROLE-BASED ACCESS
                                </span>

                                <div className="h-px flex-1 bg-slate-100" />

                            </div>


                            {/* Roles */}

                            <div className="flex flex-wrap justify-center gap-2">

                                {ROLES.map((role) => (

                                    <span
                                        key={role.label}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${role.color}`}
                                    >
                                        {role.label}
                                    </span>

                                ))}

                            </div>

                        </div>


                        {/* Footer */}

                        <p className="mt-6 text-center text-xs text-slate-400">
                            © {new Date().getFullYear()} NEUZEN AI HRMS · All rights reserved
                        </p>

                    </div>

                </div>

            </main>

        </div>
    );
}
