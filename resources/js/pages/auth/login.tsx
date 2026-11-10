import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { LoaderCircle, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login" />

            <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-foreground">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(243_75%_59%/0.12),transparent_60%)]" />

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="mb-8 flex flex-col items-center text-center"
                >
                    <div className="bg-primary text-primary-foreground mb-4 flex size-12 items-center justify-center rounded-2xl shadow-lg shadow-primary/30">
                        <Stethoscope className="size-6" />
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight">CirurFlow</h1>
                    <p className="text-muted-foreground mt-2 text-sm">Gestão inteligente da lista de espera cirúrgica</p>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                    className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/5"
                >
                    <h2 className="mb-1 text-xl font-semibold">Iniciar sessão</h2>
                    <p className="text-muted-foreground mb-6 text-sm">Introduza o seu email e password para entrar</p>

                    <form className="flex flex-col gap-6" onSubmit={submit}>
                        <div className="grid gap-6">
                            {/* Email */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={route('password.request')}
                                            className="ml-auto text-sm"
                                        >
                                            Recuperar password
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>


                            {/* Submit */}
                            <Button type="submit" className="mt-4 w-full" disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Entrar
                            </Button>
                        </div>

                    </form>

                    {status && (
                        <div className="text-success mt-4 text-center text-sm font-medium">
                            {status}
                        </div>
                    )}
                </motion.div>

                {/* Footer */}
                <footer className="text-muted-foreground mt-10 text-xs">
                    © {new Date().getFullYear()} SurgTuga. Todos os direitos reservados.
                </footer>
            </div>
        </>
    );
}
