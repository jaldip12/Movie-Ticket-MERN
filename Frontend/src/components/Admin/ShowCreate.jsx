import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import SidePanel from './SidePanel';

const ShowCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [movies, setMovies] = useState([]);
  const [seatingPlans, setSeatingPlans] = useState([]);
  
  const [formData, setFormData] = useState({
    movieId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    seatingLayoutId: ''
  });

  useEffect(() => {
    fetchMovies();
    fetchSeatingPlans();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/movies/getmovies');
      if (response.data.statusCode === 200) {
        setMovies(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchSeatingPlans = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/seating/seatingplans');
      if (response.data.statusCode === 200) {
        setSeatingPlans(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching seating plans:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('http://localhost:8000/api/v1/movies/shows', formData);
      
      if (response.data.statusCode === 201) {
        setSuccessMessage('Show created successfully!');
        setFormData({
          movieId: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          time: '',
          seatingLayoutId: ''
        });
      }
    } catch (error) {
      console.error('Error creating show:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex">
      <SidePanel />
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Create New Show</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Movie</label>
              <select 
                name="movieId"
                value={formData.movieId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select a movie</option>
                {Array.isArray(movies) && movies.map((movie) => (
                  <option key={movie._id} value={movie._id}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div>
              <label className="block mb-2">Time</label>
              <div className="flex gap-2">
                <select
                  name="hour"
                  value={formData.time.split(':')[0] || ''}
                  onChange={(e) => {
                    const minutes = formData.time.split(':')[1] || '00';
                    handleInputChange({
                      target: {
                        name: 'time',
                        value: `${e.target.value}:${minutes}`
                      }
                    });
                  }}
                  className="w-1/2 p-2 border rounded"
                  required
                >
                  <option value="">Hour</option>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, '0')}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  name="minute"
                  value={formData.time.split(':')[1] || ''}
                  onChange={(e) => {
                    const hour = formData.time.split(':')[0] || '00';
                    handleInputChange({
                      target: {
                        name: 'time',
                        value: `${hour}:${e.target.value}`
                      }
                    });
                  }}
                  className="w-1/2 p-2 border rounded"
                  required
                >
                  <option value="">Minute</option>
                  {['00', '15', '30', '45'].map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-2">Seating Layout</label>
              <select
                name="seatingLayoutId"
                value={formData.seatingLayoutId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select a seating layout</option>
                {Array.isArray(seatingPlans) && seatingPlans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isSubmitting ? 'Creating...' : 'Create Show'}
            </button>
            
            {successMessage && (
              <div className="text-green-600 mt-2 text-center">{successMessage}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShowCreate;
