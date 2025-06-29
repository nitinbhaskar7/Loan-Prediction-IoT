import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-card text-card-foreground rounded-xl shadow-lg border border-border p-8 w-full max-w-md mx-auto",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = ({ className, ...props }) => (
  <div className={cn("mb-6 text-center", className)} {...props} />
);
const CardTitle = ({ className, ...props }) => (
  <h2 className={cn("text-2xl font-bold mb-2", className)} {...props} />
);
const CardDescription = ({ className, ...props }) => (
  <p className={cn("text-muted-foreground mb-4", className)} {...props} />
);
const CardContent = ({ className, ...props }) => (
  <div className={cn("mb-6", className)} {...props} />
);
const CardFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col gap-2", className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
