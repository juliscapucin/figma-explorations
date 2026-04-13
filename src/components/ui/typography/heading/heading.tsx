import * as React from "react";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & {
    tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    variant?: "display" | "headline" | "title";
    children: React.ReactNode;
  };

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/src/lib/utils";

const headingVariants = cva("focus-visible:outline-none", {
  variants: {
    variant: {
      display:
        "text-display-small md:text-display-medium lg:text-display-large leading-display-small md:leading-display-medium lg:leading-display-large font-black",
      headline:
        "text-headline-small md:text-headline-medium lg:text-headline-large font-black leading-headline-small md:leading-headline-medium lg:leading-headline-large",
      title:
        "text-title-small md:text-title-medium lg:text-title-large leading-title-small md:leading-title-medium lg:leading-title-large font-medium",
    },
  },
  defaultVariants: {
    variant: "headline",
  },
});

const TypographyHeading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ tag, className, variant, children, ...props }, ref) => {
    const Tag = tag;

    return (
      <Tag className={cn(headingVariants({ variant, className }))} ref={ref} {...props}>
        {children}
      </Tag>
    );
  },
);

TypographyHeading.displayName = "Heading";

export { TypographyHeading, headingVariants };
