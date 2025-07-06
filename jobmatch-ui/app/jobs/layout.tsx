import { RouteGuard } from "@/components/route-guard";

export default function JobsLayout({ children }: { children: React.ReactNode }) {
    return (
        <RouteGuard requireAuth={true}>
            {children}
        </RouteGuard>
    )
}