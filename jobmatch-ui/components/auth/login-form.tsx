"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Briefcase, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { t } from '@/lib/i18n-client'
import type { Dictionary } from "@/lib/types"

interface LoginFormProps {
    locale: string;
    dictionary: Dictionary;
}

export default function LoginForm({ locale, dictionary }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { login, isLoading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    const registered = searchParams.get("registered")
    const redirectTo = searchParams.get("redirect") || ""

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)

        try {
            await login(email, password, redirectTo)
            // Redirection is handled in the login function
        } catch (err) {
            setError(err instanceof Error ? err.message : t(dictionary, "auth.loginFailed"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-gradient-to-br from-background via-muted/20 to-muted/40 flex items-center justify-center p-4 min-h-96">
            <div className="w-full max-w-md">
                <Card className="shadow-lg">
                    <CardHeader className="text-center pb-6">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg transform rotate-3">
                                <Briefcase className="h-7 w-7 text-primary-foreground" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">{t(dictionary, "auth.welcomeBack")}</CardTitle>
                        <CardDescription>{t(dictionary, "auth.signInAccount")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {registered === "true" && (
                            <Alert className="border-green-200 bg-green-50">
                                <AlertDescription className="text-green-800">
                                    {t(dictionary, "auth.registerSuccess")}
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">{t(dictionary, "auth.email")}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t(dictionary, "auth.enterEmail")}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">{t(dictionary, "auth.password")}</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder={t(dictionary, "auth.enterPassword")}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting || isLoading}
                            >
                                {isSubmitting || isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t(dictionary, "button.signingIn")}
                                    </>
                                ) : (
                                    t(dictionary, "button.signIn")
                                )}
                            </Button>
                        </form>

                        <div className="text-center">
                            <p className="text-muted-foreground">
                                {t(dictionary, "auth.dontHaveAccount")}{" "}
                                <Button variant="link" className="px-0" asChild>
                                    <Link
                                        href={`/${locale}/register${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                                    >
                                        {t(dictionary, "button.signUp")}
                                    </Link>
                                </Button>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 