// Centralized UI helpers for dashboard consistency
import { cn } from "@/lib/utils";

// Consistent status badge tones across dashboards (light and dark)
export const STATUS_BADGE_TONE: Record<string, string> = {
  pending:
    "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200",
  confirmed:
    "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200",
  completed:
    "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200",
  canceled:
    "bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200",
  rescheduled:
    "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200",
};

// Neutral list item container used for rows within cards
export const listItemContainer =
  "border border-border/50 rounded-lg p-3 sm:p-4 bg-background/50 hover:bg-background/80 transition-colors";

// Hover affordance for KPI/metric cards to keep interaction consistent
export const metricCardHover = "transition-all duration-200 hover:shadow-lg hover:scale-[1.02]";

// Helper to combine base container with additional classes
export function listItem(classes?: string): string {
  return cn(listItemContainer, classes);
}


