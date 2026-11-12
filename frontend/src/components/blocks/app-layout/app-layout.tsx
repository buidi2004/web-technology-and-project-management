import * as React from "react"
import { House } from "lucide-react"
import { AppShell, type AppShellProps } from "@/components/blocks/shell"

export interface AppLayoutLeaf { label: string; to: string }
export interface AppLayoutGroup {
  id: string
  label: string
  icon: React.ReactNode
  /** Heading printed above this group in the expanded menu. */
  section?: string
  items: AppLayoutLeaf[]
}
export interface AppLayoutShortcut { to: string; label: string; icon: React.ReactNode; badge?: number }

type PassedToShell = "brand" | "brandWide" | "toolbar" | "userMenu" | "railBottom" | "user" | "searchPlaceholder" | "chatPanel" | "chatLabel" | "className"

export interface AppLayoutProps extends Pick<AppShellProps, PassedToShell> {
  nav: AppLayoutGroup[]
  /** Current route as your router reports it (the path, with its query when `to` has one). Matched exactly against `items[].to`. */
  route: string
  /** Called with a route when the user picks a menu item, shortcut or tab, and when the active tab is closed (then with the last remaining tab). Perform the navigation here. */
  onNavigate: (to: string) => void
  /** Real URL of a route, so middle-click and "open in new tab" work. Defaults to the route itself; add your router's base path here (basename, basePath). */
  href?: (to: string) => string
  shortcuts?: AppLayoutShortcut[]
  /** First tab: pinned, icon only, not closable. Read once, when the layout mounts. Defaults to "/". */
  homeRoute?: string
  homeIcon?: React.ReactNode
  /** Whether a route is a real screen that deserves a tab. Defaults to "listed in `nav`". */
  isKnown?: (route: string) => boolean
  /** Tab title for a route that is not listed in `nav`. */
  routeTitle?: (route: string) => string | undefined
  defaultMenuExpanded?: boolean
  children: React.ReactNode
}

/**
 * App frame: side menu, top bar, user menu and open-page tabs on top of AppShell. It never touches a router:
 * give it the current `route` and perform the navigation in `onNavigate`.
 */
export function AppLayout({ nav, route, onNavigate, href = (to) => to, shortcuts = [], homeRoute = "/", homeIcon = <House />, isKnown, routeTitle, defaultMenuExpanded = false, children, ...shell }: AppLayoutProps) {
  const [menuExpanded, setMenuExpanded] = React.useState(defaultMenuExpanded)
  const [tabs, setTabs] = React.useState<string[]>([homeRoute])
  const groups = React.useMemo(() => nav.filter((g) => g.items.length > 0), [nav])
  const items = React.useMemo(() => groups.flatMap((g) => g.items), [groups])
  const known = isKnown ? isKnown(route) : items.some((i) => i.to === route)
  React.useEffect(() => { if (known) setTabs((t) => (t.includes(route) ? t : [...t, route])) }, [route, known])

  const groupOf = (to: string) => groups.find((g) => g.items.some((i) => i.to === to))
  const titleOf = (to: string) => items.find((i) => i.to === to)?.label ?? routeTitle?.(to) ?? to
  const closeTab = (to: string) => {
    const next = tabs.filter((t) => t !== to)
    if (to === route) onNavigate(next[next.length - 1] ?? homeRoute)
    setTabs(next.length ? next : [homeRoute])
  }

  return (
    <AppShell
      {...shell}
      shortcuts={shortcuts.map((s) => ({ id: s.to, label: s.label, icon: s.icon, badge: s.badge, href: href(s.to) }))}
      onShortcutSelect={onNavigate}
      nav={groups.map((g) => g.items.length === 1
        ? { id: g.id, label: g.label, icon: g.icon, section: g.section, href: href(g.items[0]!.to) }
        : { id: g.id, label: g.label, icon: g.icon, section: g.section, items: g.items.map((i) => ({ id: i.to, label: i.label, href: href(i.to) })) })}
      menuExpanded={menuExpanded}
      onMenuExpandedChange={setMenuExpanded}
      activeNav={groupOf(route)?.id}
      activeNavItem={route}
      onNavChange={(id) => { const g = groups.find((x) => x.id === id); if (g) onNavigate(g.items[0]!.to) }}
      onNavItemSelect={(_, to) => onNavigate(to)}
      tabs={tabs.map((t) => ({ id: t, label: titleOf(t), icon: t === homeRoute ? homeIcon : groupOf(t)?.icon, iconOnly: t === homeRoute, closable: t !== homeRoute }))}
      activeTab={route}
      onTabChange={onNavigate}
      onTabClose={closeTab}
    >
      <div className="min-h-0 flex-1 overflow-hidden rounded-lg">{children}</div>
    </AppShell>
  )
}
