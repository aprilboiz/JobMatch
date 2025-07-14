"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import Image from "next/image"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

type AvatarImageProps = {
  src: string
  alt?: string
  className?: string
}

function AvatarImage({ className, src, alt }: AvatarImageProps) {
  return (
    <Image
      src={src}
      alt={alt ?? "Avatar"}
      width={32}
      height={32}
      unoptimized
      className={cn("aspect-square size-full object-cover", className)}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
