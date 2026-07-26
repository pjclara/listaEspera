import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { LoaderCircle } from 'lucide-react';

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

            <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] px-6 text-[#1b1b18] dark:bg-[#0a0a0a]">
                
                {/* Hero */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight dark:text-[#EDEDEC]">
                        CirurFlow
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Gestão inteligente da lista de espera cirúrgica
                    </p>
                </div>

                {/* Card */}
                <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#161615] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                    <h2 className="mb-1 text-xl font-medium dark:text-[#EDEDEC]">
                        Iniciar sessão
                    </h2>
                    <p className="mb-6 text-sm text-muted-foreground">
                        Introduza o seu email e password para entrar
                    </p>

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
                        <div className="mt-4 text-center text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="mt-10 text-xs text-muted-foreground">
                    © {new Date().getFullYear()} SurgTuga. Todos os direitos reservados.
                </footer>
            </div>
        </>
    );
}
