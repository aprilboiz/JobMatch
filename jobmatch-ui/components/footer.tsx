import Link from "next/link"
import { Briefcase } from "lucide-react"

interface FooterProps {
    locale: string;
    t: (key: string) => string;
}

export function Footer({ locale, t }: FooterProps) {
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
                            {t('message.welcome')}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">{t('nav.jobs')}</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>
                                <Link href={`/${locale}/jobs`} className="hover:text-foreground transition-colors">
                                    {t('nav.jobs')}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/dashboard`} className="hover:text-foreground transition-colors">
                                    {t('nav.dashboard')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">{t('nav.company')}</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>
                                <Link href={`/${locale}/about-us`} className="hover:text-foreground transition-colors">
                                    {t('nav.aboutUs')}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/contact`} className="hover:text-foreground transition-colors">
                                    {t('nav.contact')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">{t('nav.legal')}</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>
                                <Link href={`/${locale}/terms`} className="hover:text-foreground transition-colors">
                                    {t('nav.terms')}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/privacy`} className="hover:text-foreground transition-colors">
                                    {t('nav.privacy')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} JobMatch. {t('copyright.text')}</p>
                </div>
            </div>
        </footer>
    )
} 