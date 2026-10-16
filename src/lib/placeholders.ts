/** Placeholders are visible while developing, hidden in production unless explicitly enabled. */
export const showPlaceholders =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_PLACEHOLDERS === "true";
