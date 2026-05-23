import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const buttonVariants = {
  variant: {
    default: "btn-primary",
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "hover:bg-swiftr-100 text-slate-700 transition",
    outline: "border border-swiftr-200 bg-white hover:bg-swiftr-50 transition",
  },
  size: {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          "rounded-lg font-medium transition",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";