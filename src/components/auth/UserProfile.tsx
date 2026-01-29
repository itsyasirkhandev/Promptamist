
'use client';

import { useUser } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { LogOut } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function UserProfile() {
  const { user, profile, isLoaded, logout } = useUser();

  const handleSignOut = async () => {
    await logout();
  };

  // If we have a profile from server-side hydration, we can show it immediately
  // even if the full Firebase Auth 'user' object isn't ready yet.
  const displayData = profile || user;

  if (!isLoaded && !displayData) {
    return (
        <div className="flex items-center space-x-2 p-1 sm:px-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="hidden sm:flex flex-col space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-2 w-20" />
            </div>
        </div>
    );
  }

  if (!displayData) {
    return null;
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const displayName = displayData.displayName || (displayData as any).email?.split('@')[0] || 'User';
  const email = displayData.email || '';
  const photoURL = displayData.photoURL || undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-auto w-full justify-start p-1 sm:px-2 space-x-2">
           <Avatar className="h-8 w-8">
            <AvatarImage src={photoURL} alt={displayName} />
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start group-data-[collapsible=offcanvas]:hidden group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-semibold text-foreground truncate max-w-[100px]">{displayName}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">{email}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={!user}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

    