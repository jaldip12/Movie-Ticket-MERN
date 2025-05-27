import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ShowSeatingLayout from "./ShowSeatingLayout";

export default function Booking({ movieTitle = "MovieTitle" }) {
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSeatLayout, setShowSeatLayout] = useState(false);

  useEffect(() => {
    const fetchShows = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/shows/title?title=${encodeURIComponent(movieTitle)}`
        );
        const showData = response.data?.data || [];
        setShows(showData);
        
        if (showData.length > 0) {
          const firstDate = showData[0].date.$date 
            ? new Date(showData[0].date.$date) 
            : new Date(showData[0].date);
          setSelectedDate(firstDate.toISOString().split('T')[0]);
        }
      } catch (error) {
        setError("Failed to load shows. Please try again later.");
        console.error("Error fetching show data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (movieTitle) fetchShows();
  }, [movieTitle]);

  // Reset selections when date changes
  useEffect(() => {
    if (selectedDate) {
      setSelectedShow(null);
      setShowSeatLayout(false);
    }
  }, [selectedDate]);

  const getAvailableDates = () => {
    const datesMap = new Map();
    shows.forEach((show) => {
      const showDate = show.date.$date 
        ? new Date(show.date.$date) 
        : new Date(show.date);
      const date = showDate.toISOString().split('T')[0];
      
      if (!datesMap.has(date)) {
        datesMap.set(date, {
          fullDate: date,
          day: showDate.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
          date: showDate.getDate().toString().padStart(2, "0"),
          month: showDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
        });
      }
    });

    return Array.from(datesMap.values())
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate))
      .slice(0, 7);
  };

  const getShowsForDate = (dateStr) => {
    return shows.filter((show) => {
      const showDate = show.date.$date 
        ? new Date(show.date.$date) 
        : new Date(show.date);
      return showDate.toISOString().split('T')[0] === dateStr;
    });
  };

  const formatShowTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const getTheaterGroups = () => {
    const filteredShows = getShowsForDate(selectedDate);
    const groups = {};

    filteredShows.forEach((show) => {
      if (!groups[show.seatingLayoutName]) {
        groups[show.seatingLayoutName] = [];
      }
      groups[show.seatingLayoutName].push(show);
    });

    return groups;
  };

  const handleShowSelection = (show) => {
    setSelectedShow(show);
    setShowSeatLayout(true);
    
    // Smooth scroll to seating layout after a short delay
    setTimeout(() => {
      document.getElementById('seating-layout')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };
  
  const handleBack = () => {
    setShowSeatLayout(false);
    setSelectedShow(null);
    
    // Scroll back to the shows
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const calendarDates = getAvailableDates();
  const theaterGroups = getTheaterGroups();

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 mt-4">{movieTitle}</h1>
      
      {isLoading && !selectedShow && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && !selectedShow && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="sticky top-0 z-10 bg-white shadow-md rounded-lg mb-6">
        <div className="flex items-center justify-between border-b border-gray-200 py-3 px-4">
          <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
            {calendarDates.map((dateObj) => (
              <button
                key={dateObj.fullDate}
                onClick={() => setSelectedDate(dateObj.fullDate)}
                className={`flex flex-col items-center min-w-16 p-2 rounded-lg transition-colors ${
                  selectedDate === dateObj.fullDate
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                disabled={showSeatLayout}
              >
                <span className="text-xs font-medium">{dateObj.day}</span>
                <span className="text-xl font-bold">{dateObj.date}</span>
                <span className="text-xs">{dateObj.month}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <div className="px-3 py-2 border border-gray-300 rounded-md">
              <span className="whitespace-nowrap">Hindi - 2D</span>
            </div>
            <div className="px-3 py-2 border border-gray-300 rounded-md flex items-center">
              <span className="whitespace-nowrap">Price Filter</span>
              <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end mt-2 px-4 py-2 space-x-4 text-xs text-gray-600">
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
            <span>SUBTITLES</span>
          </div>
        </div>
      </div>

      {!showSeatLayout && (
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
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Available
                    </span>
                  </div>
                  <button className="text-gray-600 flex items-center">
                    <span className="mr-1 text-sm">INFO</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap">
                  {theaterGroups[theater].map((show) => (
                    <div key={show._id.$oid || show._id} className="mr-4 mb-4">
                      <button
                        onClick={() => handleShowSelection(show)}
                        className="border rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                      >
                        <div className="font-medium text-green-600">{formatShowTime(show.time)}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {show.screenType || '2D'}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-12 text-lg">
              {isLoading ? 
                "Loading shows..." : 
                "No shows available for the selected date."}
            </div>
          )}
        </div>
      )}

      {showSeatLayout && selectedShow && (
        <div id="seating-layout" className="mt-8">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBack}
              className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
            >
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Shows
            </button>
            <h2 className="text-2xl font-bold">Select Seats</h2>
          </div>
          
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{selectedShow.seatingLayoutName}</h3>
                  <p className="text-gray-600">
                    {new Date(selectedDate).toLocaleDateString()} • {formatShowTime(selectedShow.time)}
                  </p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedShow.screenType || '2D'}
                </div>
              </div>
            </div>
            
            <ShowSeatingLayout 
              seatingLayoutName={selectedShow.seatingLayoutName}
              showId={selectedShow._id.$oid || selectedShow._id}
              showTime={selectedShow.time}
              showDate={selectedDate}
              movieTitle={movieTitle}
            />
          </div>
        </div>
      )}
    </div>
  );
}