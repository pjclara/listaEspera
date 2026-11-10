import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { PageTransition } from '@/components/motion/page-transition';
import { type BreadcrumbItem } from '@/types';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <div className="flex min-h-full flex-col">
                    <div className="flex flex-1 flex-col">
                        <AppSidebarHeader breadcrumbs={breadcrumbs} />
                        <div className="flex-1">
                            <PageTransition>{children}</PageTransition>
                        </div>
                    </div>
                    <footer className="text-muted-foreground px-6 py-4 text-right text-xs">
                        © {new Date().getFullYear()} SurgTuga. Todos os direitos reservados.
                    </footer>
                </div>
            </AppContent>
        </AppShell>
    );
}
