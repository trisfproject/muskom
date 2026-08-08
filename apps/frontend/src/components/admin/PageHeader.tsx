import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  centered?: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      className,
      title,
      description,
      badge,
      breadcrumb,
      actions,
      children,
      centered = false,
      titleClassName,
      descriptionClassName,
      ...props
    },
    ref
  ) => {
    const actionSlot = actions ?? children;

    return (
      <div
        ref={ref}
        className={cn(
          "mb-6 sm:mb-8 flex flex-col gap-4",
          actionSlot ? "sm:flex-row sm:items-center sm:justify-between" : "",
          centered && "text-center items-center",
          className
        )}
        {...props}
      >
        <div className={cn("min-w-0 space-y-1 sm:space-y-1.5", centered && "mx-auto max-w-2xl")}>
          {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
          <div className="flex flex-wrap items-center gap-3">
            <h1
              className={cn(
                "text-2xl sm:text-[26px] sm:leading-[34px] lg:text-[28px] lg:leading-[36px] font-bold tracking-tight pg-text",
                titleClassName
              )}
            >
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {description && (
            <p
              className={cn(
                "text-sm sm:text-[15px] leading-relaxed sm:leading-6 pg-muted font-normal",
                descriptionClassName
              )}
            >
              {description}
            </p>
          )}
        </div>
        {actionSlot && (
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto shrink-0">
            {actionSlot}
          </div>
        )}
      </div>
    );
  }
);

PageHeader.displayName = "PageHeader";
