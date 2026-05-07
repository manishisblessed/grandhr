import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar({ items = [], header = 'GrandHR', collapsed: controlled, onToggle }) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = controlled ?? internalCollapsed;
  const toggle = () => {
    if (onToggle) onToggle(!collapsed);
    else setInternalCollapsed((c) => !c);
  };
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 264 }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      className={cn(
        'sticky top-0 h-screen flex-shrink-0 z-40',
        'border-r border-border/60 bg-card/40 backdrop-blur-xl'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/60">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img 
              src="/logo.jpeg" 
              alt="GrandHR Logo" 
              className="size-9 shrink-0 rounded-xl object-cover shadow-glow"
            />
            {!collapsed && (
              <span className="text-base font-display font-bold tracking-tight whitespace-nowrap">
                {header}
              </span>
            )}
          </div>
          <button
            onClick={toggle}
            className="size-8 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-6">
          {items.map((group, gi) => (
            <div key={group.label || gi} className="space-y-1">
              {!collapsed && group.label ? (
                <p className="px-3 mb-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  {group.label}
                </p>
              ) : null}
              {group.items.map((item) => (
                <SidebarItem
                  key={item.to}
                  item={item}
                  collapsed={collapsed}
                  active={location.pathname === item.to || location.pathname.startsWith(item.to + '/')}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-border/60">
          {!collapsed && (
            <p className="text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} GrandHR
            </p>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

function SidebarItem({ item, collapsed, active }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
          'hover:bg-muted/60 hover:text-foreground',
          (isActive || active)
            ? 'text-foreground'
            : 'text-muted-foreground'
        )
      }
    >
      {(active) && (
        <motion.span
          layoutId="sidebar-active-pill"
          className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-primary/15 to-accent/15 ring-1 ring-primary/25"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
      {item.icon ? <item.icon className="size-[18px] shrink-0" /> : null}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="whitespace-nowrap overflow-hidden"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && item.badge ? (
        <span className="ml-auto rounded-full bg-primary/15 text-primary px-1.5 py-0.5 text-[10px] font-bold">
          {item.badge}
        </span>
      ) : null}
    </NavLink>
  );
}
