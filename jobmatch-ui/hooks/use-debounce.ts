import { useState, useEffect } from "react"

// Debounce hook to delay API calls
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
        // Using JSON.stringify to ensure deep comparison for objects
    }, [JSON.stringify(value), delay])

    return debouncedValue
} 