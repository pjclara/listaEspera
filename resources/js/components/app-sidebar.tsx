import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    Calendar,
    CalendarDays,
    CalendarRange,
} from 'lucide-react';
import AppLogo from './app-logo';

/**
 * Itens principais do menu lateral.
 * Cada objeto representa uma opção da sidebar.
 */
const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Listas de Espera',
        url: '/waiting-lists',
        icon: LayoutGrid,
    },
    {
        title: 'Slots',
        url: '/slots',
        icon: LayoutGrid,
        permissions: ['slots.view'], // Apenas visível para utilizadores com estas permissões
    },
    {
        title: 'Agenda',
        icon: Calendar,
        permissions: ['slots.view', 'agenda.view'], // Apenas visível para utilizadores com estas permissões
        children: [
            {
                title: 'Slots',
                url: '/agenda',
                icon: LayoutGrid,
                
            },
            {
                title: 'Semana',
                url: '/agenda/semana',
                icon: CalendarDays,
            },
            {
                title: 'Mês',
                url: '/agenda/mensal',
                icon: CalendarRange,
            },
        ],
    },
    {
        title: 'Utilizadores',
        url: '/users',
        icon: LayoutGrid,
        permissions: ['users.view'],
    },
    {
        title: 'Equipas',
        url: '/teams',
        icon: LayoutGrid,
        permissions: ['teams.view'],
    },
    {
        title: 'Roles & Permissões',
        url: '/access-control',
        icon: LayoutGrid,
        permissions: ['roles.view'],
    },
];

/**
 * Itens apresentados no rodapé da sidebar.
 * Neste momento está vazio, mas pode conter opções
 * como Definições, Ajuda ou Sobre.
 */
const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar
            collapsible="icon" // Permite recolher a sidebar mostrando apenas os ícones
            variant="inset" // Variante visual da sidebar
        >
            {/* Cabeçalho */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            {/* Ao clicar no logótipo vai para o Dashboard */}
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Conteúdo principal */}
            <SidebarContent>
                {/* Renderiza automaticamente os itens do menu */}
                <NavMain items={mainNavItems} />
            </SidebarContent>

            {/* Rodapé */}
            <SidebarFooter>
                {/* Menu inferior */}
                <NavFooter
                    items={footerNavItems}
                    className="mt-auto"
                />

                {/* Informações do utilizador */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}