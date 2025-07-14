import { getDictionary, t } from '@/lib/i18n';
import dynamic from "next/dynamic"
import type { Metadata } from "next"

export const revalidate = 3600 // ISR every hour

// Dynamically import the interactive hero section (client component)
const HomeHero = dynamic(() => import("@/components/home-hero"))

export const metadata: Metadata = {
  title: "JobMatch - Find Your Dream Job",
  description:
    "Connect with top companies and discover opportunities that match your skills, experience, and career goals.",
}

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  // Mock data – ideally fetched server-side for real app
  const featuredJobs = [
    {
      id: 1,
      title: "Senior Java Developer",
      company: "TechNova Solutions",
      location: "San Francisco, CA (Hybrid)",
      salary: "$90,000 - $120,000",
      type: "FULL_TIME",
      description: "We are looking for an experienced Java Developer to join our team...",
      postedDate: "2 days ago",
      applicants: 24,
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "TechNova Solutions",
      location: "San Francisco, CA (Hybrid)",
      salary: "$85,000",
      type: "FULL_TIME",
      description: "Join our design team to create intuitive user experiences...",
      postedDate: "1 day ago",
      applicants: 18,
    },
    {
      id: 3,
      title: "Financial Software Developer",
      company: "Quantum Financial",
      location: "New York, NY (Hybrid)",
      salary: "$100,000 - $140,000",
      type: "FULL_TIME",
      description: "Seeking a developer with experience in financial systems...",
      postedDate: "3 days ago",
      applicants: 31,
    },
  ]

  const stats = [
    { label: t(dictionary, "stats.activeJobs"), value: "1,250+", icon: "Briefcase" },
    { label: t(dictionary, "stats.companies"), value: "350+", icon: "Building2" },
    { label: t(dictionary, "stats.candidates"), value: "15,000+", icon: "Users" },
    { label: t(dictionary, "stats.successRate"), value: "94%", icon: "Star" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40">
      <HomeHero dictionary={dictionary} featuredJobs={featuredJobs} stats={stats} />
    </div>
  )
}
