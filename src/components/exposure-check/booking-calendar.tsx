"use client";

import Script from "next/script";
import { useMemo } from "react";

import { CALENDAR_URL } from "@/lib/content";

/**
 * Embedded GHL booking widget, prefilled with the contact's details.
 * GHL's form_embed.js resizes the iframe to fit the calendar.
 */
export function BookingCalendar({
  firstName,
  lastName,
  email,
  company,
}: {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
}) {
  const { src, frameId } = useMemo(() => {
    const url = new URL(CALENDAR_URL);
    const prefill: Record<string, string | undefined> = {
      first_name: firstName,
      last_name: lastName,
      full_name: [firstName, lastName].filter(Boolean).join(" ") || undefined,
      email,
      company_name: company,
    };
    for (const [key, value] of Object.entries(prefill)) if (value) url.searchParams.set(key, value);
    const calendarId = url.pathname.split("/").filter(Boolean).pop() ?? "calendar";
    return { src: url.toString(), frameId: `${calendarId}_embed` };
  }, [firstName, lastName, email, company]);

  return (
    <>
      <iframe
        src={src}
        id={frameId}
        title="Book your complimentary compliance review"
        scrolling="no"
        className="block min-h-[720px] w-full overflow-hidden border-0"
      />
      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="afterInteractive" />
    </>
  );
}
