import * as React from "react"
import { cn } from "@/lib/utils"

/*
 * 1:1 with the reference text input (`do-ip` + shadcn classes): 36px, radius 6, 1px line border, 13.5px,
 * padding 7/11, placeholder ink-faint, focus = navy border + 3px navy-soft ring, disabled = surface-2 fill
 * (no opacity), invalid = red border + 15% red ring on focus.
 */
/** Ô nhập một dòng. Nhận mọi thuộc tính của thẻ `input`; đặt `aria-invalid` để hiện trạng thái lỗi. */
export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full coarse:h-11 coarse:text-base min-w-0 rounded-md border border-input bg-background px-[11px] py-[7px] text-control text-foreground shadow-none transition-[color,background-color,border-color,box-shadow] duration-[120ms] outline-none placeholder:text-subtle-foreground file:border-0 file:bg-transparent file:text-control file:font-medium focus-visible:border-primary focus-visible:shadow-focus-field disabled:cursor-default disabled:bg-secondary disabled:text-subtle-foreground aria-invalid:border-destructive aria-invalid:focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--destructive)_16%,transparent)]",
        className,
      )}
      {...props}
    />
  )
}
