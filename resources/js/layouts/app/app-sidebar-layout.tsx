import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <div className="flex min-h-full flex-col">
                    <div className="flex-1 flex flex-col">
                        <AppSidebarHeader breadcrumbs={breadcrumbs} />
                        <div className="flex-1">{children}</div>
                    </div>
                    <footer className="py-4 px-4 text-right text-[12px] text-gray-400">
                        © {new Date().getFullYear()} SurgTuga. Todos os direitos reservados.
                    </footer>
                </div>
            </AppContent>
        </AppShell>
    );
}
