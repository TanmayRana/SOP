"use client";

import * as React from "react";
import { FileText } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import { useLocation } from "react-router-dom";
import { NavMain } from "./NavMain";

export function AppSidebar({
  links,
  ...props
}: {
  links?: any;
} & React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const location = useLocation();
  const path = location.pathname;

  const pathSlice = path.split("/")[1];

  console.log("state=", state);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className={`
            group flex items-center gap-3 rounded-xl px-3 py-2
            transition-all duration-200 ease-in-out
            hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
            data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground
            ${state === "collapsed" ? "justify-center px-0" : ""}
          `}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span
              className={`font-semibold text-foreground ${state === "collapsed" ? "hidden" : ""}`}
            >
              SOP Agent
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={links} />
      </SidebarContent>
      <SidebarRail ref={buttonRef} />
    </Sidebar>
  );
}
