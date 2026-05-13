import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { usePublicQuery } from "../hooks/usePublicQuery";
import { getPublicScheduleEvents } from "../services/publicApi";
import "./Schedule.css";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toISODateKey(year, monthIndex, day) {
  const yyyy = String(year);
  const mm = String(monthIndex + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function getDatePartsFromKey(dateKey) {
  const [year, month, day] = String(dateKey || "")
    .split("-")
    .map(Number);

  return {
    year,
    monthIndex: month - 1,
    day,
  };
}

function formatDisplayDate(dateKey) {
  if (!dateKey) return "";

  const [year, month, day] = String(dateKey).split("-");

  if (!year || !month || !day) return dateKey;

  return `${day}-${month}-${year}`;
}

function normaliseEventDate(dateValue) {
  if (!dateValue) return "";

  const value = String(dateValue);

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return toISODateKey(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate(),
  );
}

function normaliseEventTime(timeValue) {
  if (!timeValue) return "";

  return String(timeValue).slice(0, 5);
}

function compareTimes(a, b) {
  return normaliseEventTime(a.time).localeCompare(normaliseEventTime(b.time));
}

function Schedule() {
  const initialSelectedDate = "2026-05-25";
  const initialDateParts = getDatePartsFromKey(initialSelectedDate);

  const [currentMonth, setCurrentMonth] = useState(initialDateParts.monthIndex);
  const [currentYear, setCurrentYear] = useState(initialDateParts.year);
  const [selectedDateKey, setSelectedDateKey] = useState(initialSelectedDate);

  const {
    data: events = [],
    loading,
    error,
  } = usePublicQuery(getPublicScheduleEvents, [], ["schedule_events"]);

  const normalisedEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      date: normaliseEventDate(event.date),
      time: normaliseEventTime(event.time),
    }));
  }, [events]);

  const eventDateSet = useMemo(() => {
    return new Set(normalisedEvents.map((event) => event.date).filter(Boolean));
  }, [normalisedEvents]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    return [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  }, [currentMonth, currentYear]);

  const selectedEvents = useMemo(() => {
    return normalisedEvents
      .filter((event) => event.date === selectedDateKey)
      .sort(compareTimes);
  }, [normalisedEvents, selectedDateKey]);

  const monthEvents = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0",
    )}`;

    return normalisedEvents.filter((event) =>
      String(event.date).startsWith(monthPrefix),
    );
  }, [normalisedEvents, currentMonth, currentYear]);

  const goToPreviousMonth = () => {
    setCurrentMonth((previousMonth) => {
      if (previousMonth === 0) {
        setCurrentYear((previousYear) => previousYear - 1);
        return 11;
      }

      return previousMonth - 1;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((previousMonth) => {
      if (previousMonth === 11) {
        setCurrentYear((previousYear) => previousYear + 1);
        return 0;
      }

      return previousMonth + 1;
    });
  };

  const handleMonthChange = (event) => {
    setCurrentMonth(Number(event.target.value));
  };

  const handleYearChange = (event) => {
    setCurrentYear(Number(event.target.value));
  };

  const selectDay = (day) => {
    const dateKey = toISODateKey(currentYear, currentMonth, day);
    setSelectedDateKey(dateKey);
  };

  const selectedDateParts = getDatePartsFromKey(selectedDateKey);

  return (
    <main className="schedule-page">
      <section className="schedule-shell">
        <header className="schedule-header">
          <div>
            <h1 className="schedule-title">JUKSKEI</h1>
            <p className="schedule-kicker">Tournament Program</p>
          </div>
        </header>

        <section className="schedule-hero">
          <div>
            <p className="schedule-eyebrow">Event Calendar</p>
            <h2 className="page-heading">Match Schedule</h2>
            <p className="schedule-hero-text">
              Browse tournament dates and view daily events.
            </p>
          </div>

          <div className="schedule-summary-card">
            <span>{monthEvents.length}</span>
            <p>events this month</p>
          </div>
        </section>

        <section className="schedule-layout">
          <div className="calendar-card">
            <div className="calendar-controls">
              <button
                className="icon-btn"
                onClick={goToPreviousMonth}
                type="button"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>

              <select
                className="calendar-select"
                value={currentMonth}
                onChange={handleMonthChange}
                aria-label="Select month"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                className="calendar-select year-select"
                value={currentYear}
                onChange={handleYearChange}
                aria-label="Select year"
              >
                {Array.from({ length: 11 }, (_, index) => 2024 + index).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ),
                )}
              </select>

              <button
                className="icon-btn"
                onClick={goToNextMonth}
                type="button"
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="calendar-weekdays">
              {weekdays.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>

            <div className="calendar-grid">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <span key={`empty-${index}`} />;
                }

                const dateKey = toISODateKey(currentYear, currentMonth, day);
                const isSelected =
                  selectedDateParts.year === currentYear &&
                  selectedDateParts.monthIndex === currentMonth &&
                  selectedDateParts.day === day;

                const hasEvents = eventDateSet.has(dateKey);

                return (
                  <button
                    key={dateKey}
                    className={`calendar-day ${isSelected ? "active-day" : ""}`}
                    onClick={() => selectDay(day)}
                    type="button"
                    aria-label={`Select ${formatDisplayDate(dateKey)}`}
                  >
                    {day}

                    {hasEvents && <span className="event-indicator" />}
                  </button>
                );
              })}
            </div>
          </div>

          <section className="events-panel">
            <div className="selected-date-row">
              <div>
                <p className="today-label">SELECTED DATE</p>
                <h3>{formatDisplayDate(selectedDateKey)}</h3>
              </div>

              <span className="selected-count">
                {selectedEvents.length}{" "}
                {selectedEvents.length === 1 ? "event" : "events"}
              </span>
            </div>

            <div className="schedule-list">
              {loading ? (
                <p className="empty-events">Loading events...</p>
              ) : error ? (
                <p className="empty-events">{error}</p>
              ) : selectedEvents.length === 0 ? (
                <p className="empty-events">No events for this date.</p>
              ) : (
                selectedEvents.map((item) => (
                  <article key={item.id} className="schedule-card">
                    <div className={`schedule-dot ${item.color}`} />

                    <div className="schedule-card-content">
                      <p className="schedule-time">{item.time || "Time TBC"}</p>

                      <p className="schedule-match">{item.title}</p>

                      {item.location && (
                        <p className="schedule-location">{item.location}</p>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </section>

        <BottomNav />
      </section>
    </main>
  );
}

export default Schedule;
