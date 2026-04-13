import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import BottomNav from "../components/BottomNav";
import schedule from "../data/schedule";
import "./Schedule.css";

function Schedule() {
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
              <button className="icon-btn" aria-label="Previous month">
                <ChevronLeft size={16} />
              </button>

              <select className="calendar-select">
                <option>May</option>
              </select>

              <select className="calendar-select year-select">
                <option>2026</option>
              </select>

              <button className="icon-btn" aria-label="Next month">
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
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span>1</span>
              <span>2</span>
              <span>3</span>

              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>

              <span>11</span>
              <span>12</span>
              <span className="active-day">13</span>
              <span>14</span>
              <span>15</span>
              <span>16</span>
              <span>17</span>

              <span>18</span>
              <span>19</span>
              <span>20</span>
              <span>21</span>
              <span>22</span>
              <span>23</span>
              <span>24</span>

              <span>25</span>
              <span>26</span>
              <span>27</span>
              <span>28</span>
              <span>29</span>
              <span className="muted-day">30</span>
              <span className="muted-day">31</span>
            </div>
          </div>

          <p className="today-label">TODAY 13-05-2026</p>

          <div className="schedule-list">
            {schedule.map((item) => (
              <article key={item.id} className="schedule-card">
                <div className={`schedule-dot ${item.color}`}></div>

                <div className="schedule-card-content">
                  <p className="schedule-time">{item.time}</p>
                  <p className="schedule-match">{item.match}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <BottomNav />
      </section>
    </main>
  );
}

export default Schedule;