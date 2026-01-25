import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-6 w-6", className)}
      viewBox="0 0 49 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24.5 48C37.4787 48 48.5 37.0193 48.5 24C48.5 10.9807 37.4787 0 24.5 0C11.5213 0 0.5 10.9807 0.5 24C0.5 37.0193 11.5213 48 24.5 48Z"
        fill="hsl(var(--primary))"
      />
      <path
        d="M21.5 16H27.5C29.9853 16 32 18.0147 32 20.5C32 22.9853 29.9853 25 27.5 25H21.5V16Z"
        fill="hsl(var(--primary-foreground))"
      />
      <path
        d="M21.5 24V32"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
