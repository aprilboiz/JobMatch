"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, LogOut, LayoutDashboard, Briefcase, Search, Bell, Building2, FileText, Settings, Users, PlusCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { usePathname, useRouter } from "next/navigation"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
    const [avatarError, setAvatarError] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const { user, isAuthenticated, logout, isLoading } = useAuth()
    const pathname = usePathname()
    const router = useRouter()

    // Reset avatar error when user changes
    useEffect(() => {
        setAvatarError(false)
    }, [user?.id])

    // Check if we're on auth pages
    const isAuthPage = pathname === "/login" || pathname === "/register"

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/jobs?keyword=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    // Get navigation links based on user role
    const getNavigationLinks = () => {
        if (!isAuthenticated) {
            return [
                { href: "/jobs", label: "Jobs", icon: Briefcase },
                { href: "/companies", label: "Companies", icon: Building2 },
            ]
        }

        if (user?.role?.roleName === "RECRUITER") {
            return [
                { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
                { href: "/jobs/create", label: "Post Job", icon: PlusCircle },
            ]
        }

        // CANDIDATE
        return [
            { href: "/jobs", label: "Jobs", icon: Briefcase },
            { href: "/companies", label: "Companies", icon: Building2 },
            { href: "/applications", label: "Applications", icon: FileText },
        ]
    }

    const navigationLinks = getNavigationLinks()

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg transform rotate-3">
                            <Briefcase className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                            JobMatch
                        </span>
                    </Link>

                    {/* Main Navigation Links - Only show when authenticated */}
                    {isAuthenticated && (
                        <div className="hidden md:flex items-center space-x-6">
                            {navigationLinks.map((link) => {
                                const Icon = link.icon
                                const isActive = pathname === link.href ||
                                    (link.href === "/jobs" && pathname.startsWith("/jobs")) ||
                                    (link.href === "/manage-jobs" && pathname.startsWith("/manage-jobs")) ||
                                    (link.href === "/applications" && pathname.startsWith("/applications"))

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{link.label}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    {/* Search Bar - Only show when authenticated and not on auth pages */}
                    {isAuthenticated && !isAuthPage && (
                        <form onSubmit={handleSearch} className="hidden sm:flex">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search jobs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-64"
                                />
                            </div>
                        </form>
                    )}

                    {isLoading ? (
                        <Button variant="ghost" disabled>
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        </Button>
                    ) : isAuthenticated ? (
                        <div className="flex items-center space-x-2">
                            {/* Notifications */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="h-4 w-4" />
                                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80">
                                    <div className="p-4">
                                        <h4 className="font-semibold mb-2">Notifications</h4>
                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">
                                                No new notifications
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Mobile Menu for Navigation Links */}
                            <div className="md:hidden">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <LayoutDashboard className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <div className="p-2">
                                            {navigationLinks.map((link) => {
                                                const Icon = link.icon
                                                return (
                                                    <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        className="flex items-center space-x-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent"
                                                    >
                                                        <Icon className="h-4 w-4" />
                                                        <span>{link.label}</span>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* User Menu */}
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
                                                    <Link href="/settings" className="flex flex-row items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer">
                                                        <Settings className="mr-2 h-4 w-4" />
                                                        Settings
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
                        </div>
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