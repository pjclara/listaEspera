import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { props: pageProps } = usePage();
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            <div>
                {pageProps.flash?.success && <div className="mb-4 bg-green-500 p-2 text-white">{pageProps.flash.success}</div>}

            {children}
        </div>
    </AppLayoutTemplate>
    );
}
