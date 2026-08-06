/**
 * UpcomingHolidaysSection.tsx
 * Controls: the "Upcoming Holidays" cards on the homepage.
 * Live data comes from the database; falls back to src/data/holidayData.ts
 * when the backend isn't connected. Hidden if there is nothing to show.
 */
import { CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PremiumButton } from "@/components/shared/PremiumButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useHolidayEvents } from "@/hooks/useHolidayEvents";
import { holidayCopy, fallbackHolidays } from "@/data/holidayData";
import { useSiteContent } from "@/hooks/useEditableContent";

export function UpcomingHolidaysSection() {
  const { events } = useHolidayEvents({ upcomingOnly: true });
  const live = events.slice(0, 3);
  const holidays = live.length > 0 ? live : fallbackHolidays.slice(0, 3);

  if (holidays.length === 0) return null;

  return (
    <section className="container py-20">
      <SectionHeader
        badge={holidayCopy.badge}
        badgeIcon={CalendarDays}
        title={holidayCopy.title}
        subtitle={holidayCopy.subtitle}
      />
      <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {holidays.map((h) => (
          <Link
            key={h.id}
            to="/holiday-calendar"
            className="luxury-card p-6 flex flex-col items-start gap-3 hover:-translate-y-1 transition-transform"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-stencil text-[10px] text-gold tracking-widest uppercase">
                {new Date(h.holiday_date + "T00:00:00").toLocaleDateString(undefined, { month: "short" })}
              </span>
              <span className="luxury-menu-title text-3xl leading-none">
                {new Date(h.holiday_date + "T00:00:00").getDate()}
              </span>
            </div>
            <div className="luxury-menu-title text-xl">{h.holiday_name}</div>
            <StatusBadge label={h.business_status ?? "Open"} tone="gold" />
            {h.banner_message && <p className="luxury-subtitle text-xs">{h.banner_message}</p>}
          </Link>
        ))}
      </div>
      <div className="text-center mt-8">
        <PremiumButton variant="small" to="/holiday-calendar">
          {siteContent.callToAction.fullHolidayCalendar}
        </PremiumButton>
      </div>
    </section>
  );
}
