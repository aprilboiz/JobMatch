"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { User, LogOut, LayoutDashboard, Briefcase } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function Navigation() {
    const [avatarError, setAvatarError] = useState(false)
    const { user, isAuthenticated, logout, isLoading } = useAuth()
    const pathname = usePathname()

    // Reset avatar error when user changes
    useEffect(() => {
        setAvatarError(false)
    }, [user?.id])

    // Check if we're on auth pages
    const isAuthPage = pathname === "/login" || pathname === "/register"

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg transform rotate-3">
                            <Briefcase className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                            JobMatch
                        </span>
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    {isLoading ? (
                        <Button variant="ghost" disabled>
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        </Button>
                    ) : isAuthenticated ? (
                        <NavigationMenu>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className="flex items-center space-x-2 bg-transparent hover:bg-accent">
                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                                            {user?.avatarUrl && !avatarError ? (
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={user.fullName || "User"}
                                                    className="w-full h-full object-cover"
                                                    onError={() => setAvatarError(true)}
                                                    onLoad={() => setAvatarError(false)}
                                                />
                                            ) : (
                                                <User className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <span className="hidden sm:inline">{user?.fullName || user?.email}</span>
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="w-56 p-2">
                                            <div className="px-2 py-1.5 text-sm font-semibold">My Account</div>
                                            <div className="h-px bg-border my-1" />

                                            <NavigationMenuLink asChild>
                                                <Link href="/profile" className="flex flex-row items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer">
                                                    <User className="mr-2 h-4 w-4" />
                                                    Profile
                                                </Link>
                                            </NavigationMenuLink>

                                            <NavigationMenuLink asChild>
                                                <Link href="/dashboard" className="flex flex-row items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer">
                                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                                    Dashboard
                                                </Link>
                                            </NavigationMenuLink>

                                            <NavigationMenuLink asChild>
                                                <Link href="/applications" className="flex flex-row items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer">
                                                    <Briefcase className="mr-2 h-4 w-4" />
                                                    My Applications
                                                </Link>
                                            </NavigationMenuLink>

                                            <div className="h-px bg-border my-1" />

                                            <button
                                                onClick={logout}
                                                className="flex items-center w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer text-red-600 hover:text-red-600"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    ) : !isAuthPage ? (
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" asChild>
                                <Link href="/login">Sign In</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/register">Get Started</Link>
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
        </nav>
    )
} 