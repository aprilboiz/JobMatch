import Link from "next/link"
import { Briefcase } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-background border-t py-12">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transform rotate-3">
                                <Briefcase className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold">JobMatch</span>
                        </div>
                        <p className="text-muted-foreground">
                            Connecting talent with opportunity. Your career journey starts here.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">For Job Seekers</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>
                                <Link href="/jobs" className="hover:text-foreground transition-colors">
                                    Browse Jobs
                                </Link>
                            </li>
                            <li>
                                <Link href="/companies" className="hover:text-foreground transition-colors">
                                    Companies
                                </Link>
                            </li>
                            <li>
                                <Link href="/career-advice" className="hover:text-foreground transition-colors">
                                    Career Advice
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">For Employers</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>
                                <Link href="/post-job" className="hover:text-foreground transition-colors">
                                    Post a Job
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="hover:text-foreground transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/resources" className="hover:text-foreground transition-colors">
                                    Resources
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Support</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>
                                <Link href="/help" className="hover:text-foreground transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-foreground transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
                    <p>&copy; 2024 JobMatch. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
} 