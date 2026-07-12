import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import { ChevronRight } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { NavItem } from "@/types";

export function NavMain({ items }: { items: NavItem[] }) {
    const page = usePage();
    const userPermissions = (page.props?.auth?.permissions ?? []) as string[];

    const canViewItem = (item: NavItem) => {
        if (!item.permissions?.length) {
            return true;
        }

        return item.permissions.some((permission) => userPermissions.includes(permission));
    };

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>

            <SidebarMenu>
                {items.filter(canViewItem).map((item) => {
                    if (item.children) {
                        return (
                            <Collapsible key={item.title} defaultOpen>
                                <SidebarMenuItem>

                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton>

                                            {item.icon && <item.icon />}

                                            <span>{item.title}</span>

                                            <ChevronRight className="ml-auto h-4 w-4" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>

                                        <SidebarMenuSub>

                                            {item.children.map((child) => (
                                                <SidebarMenuSubItem key={child.title}>

                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={page.url === child.url}
                                                    >
                                                        <Link href={child.url!}>
                                                            {child.icon && <child.icon />}
                                                            <span>{child.title}</span>
                                                        </Link>

                                                    </SidebarMenuSubButton>

                                                </SidebarMenuSubItem>
                                            ))}

                                        </SidebarMenuSub>

                                    </CollapsibleContent>

                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={page.url === item.url}
                            >
                                <Link href={item.url!}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}