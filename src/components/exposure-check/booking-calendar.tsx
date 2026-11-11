"use client";

import { useMemo } from "react";

import { CALENDAR_URL } from "@/lib/content";

/**
 * Embedded Calendly scheduling page, prefilled with the contact's name and email.
 * A plain iframe (what Calendly's widget.js would inject) so it also works when
 * the result is shown again after "Start over", without re-running a script.
 */
export function BookingCalendar({
  firstName,
  lastName,
  email,
}: {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
}) {
  const src = useMemo(() => {
    const url = new URL(CALENDAR_URL);
    const prefill: Record<string, string | undefined> = {
      first_name: firstName,
      last_name: lastName,
      name: [firstName, lastName].filter(Boolean).join(" ") || undefined,
      email,
    };
    for (const [key, value] of Object.entries(prefill)) if (value) url.searchParams.set(key, value);
    url.searchParams.set("embed_type", "Inline");
    url.searchParams.set("hide_gdpr_banner", "1");
    return url.toString();
  }, [firstName, lastName, email]);

  return (
    <iframe
      src={src}
      title="Book your complimentary compliance review"
      className="block h-[1050px] w-full border-0 sm:h-[760px]"
    />
  );
}
