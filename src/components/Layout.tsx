import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Menu } from "lucide-react"

interface LayoutProps {
  children: React.ReactNode
  title?: string
  action?: React.ReactNode
}

export function Layout({ children, title, action }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Global Header */}
          <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex h-14 items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="p-2 rounded-lg hover:bg-muted hover:text-foreground transition-colors" />
                {title && (
                  <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                )}
              </div>
              {action && (
                <div className="flex items-center gap-2">
                  {action}
                </div>
              )}
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}