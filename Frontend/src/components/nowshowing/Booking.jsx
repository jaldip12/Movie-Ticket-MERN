import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { Calendar } from "lucide-react";
import axios from "axios";

export default function Booking({ movieTitle = "MovieTitle" }) {
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/shows/title?title=${encodeURIComponent(movieTitle)}`
        );
        const showData = response.data?.data || [];
        setShows(showData);

        if (showData.length > 0) {
          const firstDate = new Date(showData[0].date).toISOString().split("T")[0];
          setSelectedDate(firstDate);
        }
      } catch (error) {
        console.error("Error fetching show data:", error);
      }
    };

    if (movieTitle) fetchShows();
  }, [movieTitle]);

  const getAvailableDates = () => {
    const datesMap = new Map();
    shows.forEach((show) => {
      const date = new Date(show.date).toISOString().split("T")[0];
      if (!datesMap.has(date)) {
        const d = new Date(show.date);
        datesMap.set(date, {
          fullDate: date,
          day: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
          date: d.getDate().toString().padStart(2, "0"),
          month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
        });
      }
    });

    return Array.from(datesMap.values()).sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate)).slice(0, 7);
  };

  const getShowsForDate = (dateStr) => {
    return shows.filter(
      (show) => new Date(show.date).toISOString().split("T")[0] === dateStr
    );
  };

  const formatShowTime = (dateTimeStr) => {
    return new Date(dateTimeStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const getTheaterGroups = () => {
    const filteredShows = getShowsForDate(selectedDate);
    const groups = {};

    filteredShows.forEach((show) => {
      if (!groups[show.theater]) {
        groups[show.theater] = [];
      }
      groups[show.theater].push(show);
    });

    return groups;
  };

  const calendarDates = getAvailableDates();
  const theaterGroups = getTheaterGroups();

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Filters Section */}
      <div className="flex items-center justify-between border-b border-gray-200 py-3">
        <div className="flex overflow-x-auto space-x-1 pb-2">
          {calendarDates.map((dateObj) => (
            <button
              key={dateObj.fullDate}
              onClick={() => setSelectedDate(dateObj.fullDate)}
              className={`flex flex-col items-center min-w-16 p-2 rounded-lg ${
                selectedDate === dateObj.fullDate
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-xs font-medium">{dateObj.day}</span>
              <span className="text-xl font-bold">{dateObj.date}</span>
              <span className="text-xs">{dateObj.month}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-2 border border-gray-300 rounded-md">
            <span className="whitespace-nowrap">Hindi - 2D</span>
          </div>
          <div className="px-3 py-2 border border-gray-300 rounded-md flex items-center">
            <span className="whitespace-nowrap">Price Range</span>
            <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="px-3 py-2 border border-gray-300 rounded-md flex items-center">
            <span className="whitespace-nowrap">Preferred Time</span>
            <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <button className="p-2 border border-gray-300 rounded-md">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end mt-2 space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          <span>AVAILABLE</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
          <span>FAST FILLING</span>
        </div>
        <div className="flex items-center">
          <span className="border border-gray-300 text-xs px-1 mr-1">LAN</span>
          <span>SUBTITLES LANGUAGE</span>
        </div>
      </div>

      {/* Theaters */}
      <div className="mt-6 space-y-8">
        {Object.keys(theaterGroups).length > 0 ? (
          Object.keys(theaterGroups).map((theater) => (
            <div key={theater} className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="text-gray-400 hover:text-red-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <h3 className="text-lg font-medium">{theater}</h3>
                </div>
                <button className="text-gray-600 flex items-center">
                  <span className="mr-1">INFO</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>

              <div className="mt-4">
                {theaterGroups[theater].map((show) => (
                  <div key={show._id} className="inline-block mr-4 mb-4">
                    <button
                      onClick={() => navigate(`/booking/${show._id}`)}
                      className="border border-gray-300 rounded px-4 py-2 hover:bg-gray-100 focus:outline-none"
                    >
                      <div className="font-medium text-green-600">{formatShowTime(show.time)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {show.cancellable ? "Cancellation available" : "Non-cancellable"}
                      </div>
                      {show.features?.includes("2K LASER DOLBY 7.1") && (
                        <div className="text-xs text-gray-500">2K LASER DOLBY 7.1</div>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 mt-10 text-lg">No shows available for the selected date.</div>
        )}
      </div>
    </div>
  );
}
