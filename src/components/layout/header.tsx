"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Trophy,
  User,
  Calendar,
  LogOut,
  Flag,
  Flame,
  Settings,
  HelpCircle,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: Trophy,
  },
  {
    label: "Races",
    href: "/races",
    icon: Flag,
  },
  {
    label: "My Bets",
    href: "/my-bets",
    icon: Flame,
    authRequired: true,
  },
  {
    label: "How It Works",
    href: "/how-it-works",
    icon: HelpCircle,
  },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-red-500" />
            <span className="font-bold inline-block">F1 Fantasy Betting</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => {
              // Skip items that require auth if not authenticated
              if (item.authRequired && !isAuthenticated) {
                return null;
              }

              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                    isActive
                      ? "text-foreground"
                      : "text-foreground/60"
                  }`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted" />
          ) : isAuthenticated && session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image ?? ""}
                      alt={session.user.name ?? "User"}
                    />
                    <AvatarFallback>
                      {session.user.name?.[0] ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-bets" className="flex w-full cursor-pointer">
                    <Flame className="mr-2 h-4 w-4" />
                    <span>My Bets</span>
                  </Link>
                </DropdownMenuItem>
                {session.user.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex w-full cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => signIn()} variant="default" size="sm">
              <User className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
