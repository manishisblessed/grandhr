import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Moon,
  Sun,
  Search,
  LogOut,
  User as UserIcon,
  Settings,
  Download,
  Smartphone,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getInitials } from '../../lib/utils';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

export function Topbar({ title, search = true, actions }) {
  const navigate = useNavigate();
  const { user, signOut, isHR } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const install = useInstallPrompt();
  const mobileAppPath = isHR ? '/hr/mobile-app' : '/employee/mobile-app';

  const fullName = user?.employee
    ? `${user.employee.firstName ?? ''} ${user.employee.lastName ?? ''}`.trim()
    : user?.email || 'User';

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border/60 bg-card/30 backdrop-blur-xl">
      <div className="flex h-full items-center gap-3 px-4 md:px-6">
        {title ? (
          <h1 className="font-display text-lg font-semibold tracking-tight mr-2">
            {title}
          </h1>
        ) : null}

        {search && (
          <div className="hidden md:flex items-center max-w-md w-full relative">
            <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search employees, documents…"
              className="pl-9 bg-background/60"
            />
          </div>
        )}

        <div className="flex-1" />

        {actions}

        {install.available && !install.installed ? (
          <Button
            variant="gradient"
            size="sm"
            onClick={() => install.install()}
            className="hidden md:inline-flex gap-1.5 h-9"
          >
            <Download className="size-3.5" />
            Install app
          </Button>
        ) : null}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(mobileAppPath)}
          aria-label="Mobile app & notifications"
          className="rounded-full hidden md:inline-flex"
        >
          <Smartphone className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-full"
        >
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="rounded-full relative"
          onClick={() => navigate('/hr/notifications')}
        >
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full pr-2 hover:bg-muted/60 transition-colors">
              <Avatar className="size-9">
                <AvatarImage src={user?.employee?.avatarUrl} />
                <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
              </Avatar>
              <span className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-sm font-semibold">{fullName}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {user?.role}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>{fullName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/hr/dashboard')}>
              <UserIcon className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/hr/settings')}>
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await signOut();
                navigate('/hr/login');
              }}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
