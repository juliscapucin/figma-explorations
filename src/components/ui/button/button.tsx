import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/src/lib/utils";

const textSize = {
  xs: "text-label-small leading-label-small tracking-label-small",
  sm: "text-label-small leading-label-small tracking-label-small",
  md: "text-label-medium leading-label-medium tracking-label-medium",
  lg: "text-label-medium leading-label-medium tracking-label-medium",
};

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl border-2 border-transparent font-p-p-frama font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none cursor-pointer uppercase",
  {
    variants: {
      variant: {
        primary:
          "bg-button-primary-background text-button-primary-foreground hover:bg-button-primary-hover-background active:bg-button-primary-active-background data-[state=hover]:bg-button-primary-hover-background data-[state=active]:bg-button-primary-active-background data-[state=active-hover]:bg-button-primary-active-background disabled:bg-button-primary-disabled-background disabled:text-button-primary-disabled-foreground",
        secondary:
          "border-button-secondary-border bg-button-secondary-background text-button-secondary-foreground hover:bg-button-secondary-hover-background active:bg-button-secondary-active-background data-[state=hover]:bg-button-secondary-hover-background data-[state=active]:bg-button-secondary-active-background data-[state=active-hover]:bg-button-secondary-active-background disabled:bg-button-secondary-disabled-background disabled:text-button-secondary-disabled-foreground disabled:border-muted-foreground",
        ghost:
          "border-button-ghost-border bg-button-ghost-background text-button-ghost-foreground hover:bg-button-ghost-hover-background active:bg-button-ghost-active-background data-[state=hover]:bg-button-ghost-hover-background data-[state=active]:bg-button-ghost-active-background data-[state=active-hover]:bg-button-ghost-active-background disabled:bg-button-ghost-disabled-background disabled:text-button-ghost-disabled-foreground disabled:border-muted-foreground",
      },
      size: {
        xs: "h-6 px-2",
        sm: "h-8 px-4",
        md: "h-10 px-4",
        lg: "h-12 px-6",
      },
      state: {
        default: "",
        hover: "",
        active: "",
        "active-hover": "",
        disabled: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      state: "default",
    },
  },
);

export type ButtonState = "default" | "hover" | "active" | "active-hover" | "disabled";

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, state = "default", disabled, type, children, ...props }, ref) => {
    const isDisabled = disabled || state === "disabled";

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        data-state={state}
        disabled={isDisabled}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        <span className={cn(textSize[size as keyof typeof textSize])}>{children}</span>
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
