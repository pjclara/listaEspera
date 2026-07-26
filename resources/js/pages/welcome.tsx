import { Head, Link, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="CirurFlow" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] px-6 text-[#1b1b18] dark:bg-[#0a0a0a]">
                {/* Logo / Nome */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-semibold tracking-tight dark:text-[#EDEDEC]">
                        CirurFlow
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Gestão inteligente da lista de espera cirúrgica
                    </p>
                </div>

                {/* Card */}
                <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#161615] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                    <h2 className="mb-4 text-lg font-medium dark:text-[#EDEDEC]">
                        Bem-vindo
                    </h2>

                    <p className="mb-6 text-sm text-gray-600 leading-relaxed dark:text-gray-400">
                        Acompanhe, filtre, exporte e analise toda a informação da lista de espera cirúrgica com rapidez e precisão.
                    </p>

                    {/* Botões */}
                    <div className="flex flex-col gap-3">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-md bg-blue-600 px-4 py-2 text-center text-white transition hover:bg-blue-700"
                            >
                                Ir para o Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-center text-sm transition hover:bg-gray-100 dark:border-gray-600 dark:text-[#EDEDEC] dark:hover:bg-[#222]"
                                >
                                    Iniciar sessão
                                </Link>


                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-10 text-xs text-gray-500 dark:text-gray-600">
                    © {new Date().getFullYear()} SurgTuga. Todos os direitos reservados.
                </footer>
            </div>
        </>
    );
}
