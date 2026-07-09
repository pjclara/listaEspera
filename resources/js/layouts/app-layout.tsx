import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { props: pageProps } = usePage();
    const { toast: serverToast } = usePage().props;
    useEffect(() => {
        if (serverToast) {
            const { type = 'success', title, description } = serverToast;
            toast[type](title, { description });
        }
    }, [serverToast]);
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            <div>
                <>
                    {children}
                    <Toaster richColors position="top-right" />
                </>
            </div>
        </AppLayoutTemplate>
    );
};
