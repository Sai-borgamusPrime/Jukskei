import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BottomNav from "../components/BottomNav";
import SignOutButton from "../components/SignOutButton/SignOutButton";
import useTheme from "../hooks/useTheme";
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

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function displayDate(date) {
  return date.toLocaleDateString("en-GB").replaceAll("/", "-");
}

function Schedule() {
  const today = new Date(2026, 4, 24);
  useTheme();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today);

  const {
    data: events = [],
    loading,
    error,
  } = usePublicQuery(getPublicScheduleEvents, [], ["schedule_events"]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    return [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
  }, [currentMonth, currentYear]);

  const selectedDateKey = formatDate(selectedDate);

  const selectedEvents = events
    .filter((event) => event.date === selectedDateKey)
    .sort((a, b) => a.time.localeCompare(b.time));

  const monthEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getMonth() === currentMonth &&
      eventDate.getFullYear() === currentYear
    );
  });

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const selectDay = (day) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
  };

  return (
    <main className="schedule-page">
      <section className="schedule-shell">
        <header className="schedule-header">
          <div>
            <h1 className="schedule-title">JUKSKEI</h1>
            <p className="schedule-kicker">Toernooi Program</p>
          </div>

          <div>
            <SignOutButton />
          </div>
        </header>

        <section className="schedule-hero">
          <div>
            <p className="schedule-eyebrow">Event Calendar</p>
            <h2 className="page-heading">Match Schedule</h2>
            <p className="schedule-hero-text">
              Blaai deur toernooi-datums en sien daaglikse geleenthede.
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
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
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
                onChange={(e) => setCurrentYear(Number(e.target.value))}
              >
                {Array.from({ length: 11 }, (_, i) => 2024 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
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
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            <div className="calendar-grid">
              {calendarDays.map((day, index) =>
                day ? (
                  <button
                    key={index}
                    className={`calendar-day ${
                      selectedDate.getDate() === day &&
                      selectedDate.getMonth() === currentMonth &&
                      selectedDate.getFullYear() === currentYear
                        ? "active-day"
                        : ""
                    }`}
                    onClick={() => selectDay(day)}
                    type="button"
                  >
                    {day}

                    {events.some(
                      (event) =>
                        event.date ===
                        formatDate(new Date(currentYear, currentMonth, day)),
                    ) && <span className="event-indicator"></span>}
                  </button>
                ) : (
                  <span key={index}></span>
                ),
              )}
            </div>
          </div>

          <section className="events-panel">
            <div className="selected-date-row">
              <div>
                <p className="today-label">SELECTED DATE</p>
                <h3>{displayDate(selectedDate)}</h3>
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
                    <div className={`schedule-dot ${item.color}`}></div>

                    <div className="schedule-card-content">
                      <p className="schedule-time">{item.time}</p>
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
