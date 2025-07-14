"use client"

import { SWRConfig } from "swr"
import type { SWRConfiguration } from "swr"

const fetcher: SWRConfiguration["fetcher"] = (resource, init) =>
    fetch(resource as string, init).then((res) => res.json())

export function SWRProvider({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                fetcher,
                revalidateOnFocus: false,
            }}
        >
            {children}
        </SWRConfig>
    )
} 