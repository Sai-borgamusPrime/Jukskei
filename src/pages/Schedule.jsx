import { useMemo, useState } from "react";
import { Bell, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import BottomNav from "../components/BottomNav";
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

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today);

  const [events, setEvents] = useState([
    {
      id: 1,
      date: "2026-05-24",
      time: "12:00",
      title: "IJF / NAM / JSA Vergadering",
      location: "Jukskei Park",
      color: "green",
    },
    {
      id: 2,
      date: "2026-05-25",
      time: "08:00",
      title: "Registrasie van spanne / wedstrydroosters",
      location: "",
      color: "green",
    },
    {
      id: 3,
      date: "2026-05-25",
      time: "09:00",
      title: "Opening",
      location: "",
      color: "green",
    },
    {
      id: 4,
      date: "2026-05-25",
      time: "10:00",
      title: "Wedstryde begin",
      location: "",
      color: "green",
    },
    {
      id: 5,
      date: "2026-05-25",
      time: "12:00",
      title: "Middag ete",
      location: "",
      color: "green",
    },
    {
      id: 6,
      date: "2026-05-25",
      time: "13:00",
      title: "Wedstryde begin",
      location: "",
      color: "green",
    },
    {
      id: 7,
      date: "2026-05-26",
      time: "08:00",
      title: "Opening",
      location: "",
      color: "green",
    },
    {
      id: 8,
      date: "2026-05-26",
      time: "09:00",
      title: "Wedstryde begin",
      location: "",
      color: "green",
    },
    {
      id: 9,
      date: "2026-05-26",
      time: "12:00",
      title: "Middag ete",
      location: "",
      color: "green",
    },
    {
      id: 10,
      date: "2026-05-26",
      time: "12:30",
      title: "CDM Vergadering tydens middag ete (IJF/Nam/SA)",
      location: "",
      color: "green",
    },
    {
      id: 11,
      date: "2026-05-26",
      time: "13:00",
      title: "Wedstryde begin",
      location: "",
      color: "green",
    },
    {
      id: 12,
      date: "2026-05-27",
      time: "08:00",
      title: "Opening",
      location: "",
      color: "green",
    },
    {
      id: 13,
      date: "2026-05-27",
      time: "09:00",
      title: "Wedstryde begin",
      location: "",
      color: "green",
    },
    {
      id: 14,
      date: "2026-05-27",
      time: "12:00",
      title: "Middag ete",
      location: "",
      color: "green",
    },
    {
      id: 15,
      date: "2026-05-27",
      time: "13:00",
      title: "Wedstryde begin",
      location: "",
      color: "green",
    },
    {
      id: 16,
      date: "2026-05-27",
      time: "18:00",
      title: "Steak Braai",
      location: "WAP Skool saal",
      color: "green",
    },
    {
      id: 17,
      date: "2026-05-28",
      time: "08:00",
      title: "Opening",
      location: "",
      color: "green",
    },
    {
      id: 18,
      date: "2026-05-28",
      time: "09:00",
      title: "Wedstryde begin",
      location: "",
      color: "green",
    },
    {
      id: 19,
      date: "2026-05-28",
      time: "12:00",
      title: "Middag ete",
      location: "",
      color: "green",
    },
    {
      id: 20,
      date: "2026-05-28",
      time: "13:00",
      title: "Wedstryde begin",
      location: "",
      color: "green",
    },
    {
      id: 21,
      date: "2026-05-28",
      time: "15:00",
      title: "Prysuitdeling",
      location: "",
      color: "green",
    },
    {
      id: 22,
      date: "2026-05-28",
      time: "16:00",
      title: "Aankondiging van Nasionale spanne, JSA en Nam",
      location: "",
      color: "green",
    },
    {
      id: 23,
      date: "2026-05-29",
      time: "08:00",
      title: "Ere gaste / gaste sit",
      location: "",
      color: "green",
    },
    {
      id: 24,
      date: "2026-05-29",
      time: "09:00",
      title: "Opstap seremonie begin",
      location: "",
      color: "green",
    },
    {
      id: 25,
      date: "2026-05-29",
      time: "10:00",
      title: "Toetse",
      location: "",
      color: "green",
    },
    {
      id: 26,
      date: "2026-05-29",
      time: "15:00",
      title: "IJF Prysuitdeling",
      location: "",
      color: "green",
    },
  ]);

  const [newEvent, setNewEvent] = useState({
    time: "",
    title: "",
    location: "",
  });

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [editEvent, setEditEvent] = useState({
    time: "",
    title: "",
    location: "",
  });

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

  const addEvent = (e) => {
    e.preventDefault();

    if (!newEvent.time || !newEvent.title.trim()) return;

    setEvents([
      ...events,
      {
        id: Date.now(),
        date: selectedDateKey,
        time: newEvent.time,
        title: newEvent.title.trim(),
        location: newEvent.location.trim(),
        color: "green",
      },
    ]);

    setNewEvent({
      time: "",
      title: "",
      location: "",
    });
  };

  const openEventModal = (event) => {
    setSelectedEvent(event);
    setEditEvent({
      time: event.time,
      title: event.title,
      location: event.location || "",
    });
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
    setEditEvent({
      time: "",
      title: "",
      location: "",
    });
  };

  const updateEvent = (e) => {
    e.preventDefault();

    if (!editEvent.time || !editEvent.title.trim()) return;

    setEvents(
      events.map((event) =>
        event.id === selectedEvent.id
          ? {
              ...event,
              time: editEvent.time,
              title: editEvent.title.trim(),
              location: editEvent.location.trim(),
            }
          : event,
      ),
    );

    closeEventModal();
  };

  const deleteEvent = () => {
    setEvents(events.filter((event) => event.id !== selectedEvent.id));
    closeEventModal();
  };

  return (
    <main className="schedule-page">
      <section className="schedule-shell">
        <header className="schedule-header">
          <h1 className="schedule-title">JUKSKEI</h1>

          <button className="notification-button" aria-label="Notifications">
            <Bell size={18} strokeWidth={2.2} />
          </button>
        </header>

        <section className="schedule-section">
          <h2 className="page-heading">Match Schedule</h2>

          <div className="calendar-card">
            <div className="calendar-controls">
              <button className="icon-btn" onClick={goToPreviousMonth}>
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

              <button className="icon-btn" onClick={goToNextMonth}>
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

          <p className="today-label">
            SELECTED DATE {displayDate(selectedDate)}
          </p>

          <form className="event-form" onSubmit={addEvent}>
            <input
              type="time"
              value={newEvent.time}
              onChange={(e) =>
                setNewEvent({ ...newEvent, time: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Add match or event"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Location"
              value={newEvent.location}
              onChange={(e) =>
                setNewEvent({ ...newEvent, location: e.target.value })
              }
            />

            <button type="submit" aria-label="Add event">
              <Plus size={16} />
            </button>
          </form>

          <div className="schedule-list">
            {selectedEvents.length === 0 ? (
              <p className="empty-events">No events for this date.</p>
            ) : (
              selectedEvents.map((item) => (
                <article
                  key={item.id}
                  className="schedule-card"
                  onClick={() => openEventModal(item)}
                >
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

        {selectedEvent && (
          <div className="modal-overlay">
            <div className="event-modal">
              <button className="modal-close" onClick={closeEventModal}>
                <X size={18} />
              </button>

              <h3 className="modal-title">Edit Event</h3>

              <form className="modal-form" onSubmit={updateEvent}>
                <input
                  type="time"
                  value={editEvent.time}
                  onChange={(e) =>
                    setEditEvent({ ...editEvent, time: e.target.value })
                  }
                />

                <input
                  type="text"
                  value={editEvent.title}
                  onChange={(e) =>
                    setEditEvent({ ...editEvent, title: e.target.value })
                  }
                />

                <input
                  type="text"
                  placeholder="Location"
                  value={editEvent.location}
                  onChange={(e) =>
                    setEditEvent({ ...editEvent, location: e.target.value })
                  }
                />

                <button type="submit" className="save-btn">
                  Save Changes
                </button>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={deleteEvent}
                >
                  Delete Event
                </button>
              </form>
            </div>
          </div>
        )}

        <BottomNav />
      </section>
    </main>
  );
}

export default Schedule;
