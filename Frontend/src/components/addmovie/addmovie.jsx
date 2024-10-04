import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUpload from '../cloud/cloudinary';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { Spinner } from '@/components/ui/spinner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from 'lucide-react';

const GENRES = [
  { label: 'Action', value: 'Action' },
  { label: 'Comedy', value: 'Comedy' },
  { label: 'Drama', value: 'Drama' },
  { label: 'Sci-Fi', value: 'Sci-Fi' },
  { label: 'Horror', value: 'Horror' },
  { label: 'Romance', value: 'Romance' },
  { label: 'Thriller', value: 'Thriller' },
  { label: 'Documentary', value: 'Documentary' }
];

const CERTIFICATIONS = ['U', 'UA', 'A', 'S'];

const initialMovieData = {
  title: '',
  poster: '',
  certification: '',
  language: '',
  genres: [],
  releaseDate: '',
  duration: '',
};

const TextInput = ({ label, name, value, onChange, error, type = 'text', placeholder }) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="text-gray-300">{label}</Label>
    <Input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full bg-gray-800 text-white border-gray-700 focus:ring-yellow-400 focus:border-yellow-400 ${
        error ? 'border-red-500' : ''
      }`}
      placeholder={placeholder}
    />
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-red-500 text-sm"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const SelectInput = ({ label, name, options, value, onChange, error }) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="text-gray-300">{label}</Label>
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="w-full bg-gray-800 text-white border-gray-700">
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent className="bg-gray-800 text-white border-gray-700">
        {options.map((option) => (
          <SelectItem key={option} value={option} className="hover:bg-gray-700">
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-red-500 text-sm"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

export function AddMoviePage() {
  const [movieData, setMovieData] = useState(initialMovieData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedGenres, setSelectedGenres] = useState([]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!movieData.title.trim()) newErrors.title = 'Title is required.';
    if (!movieData.poster) newErrors.poster = 'Poster is required.';
    if (!movieData.certification) newErrors.certification = 'Certification is required.';
    if (!movieData.language.trim()) newErrors.language = 'Language is required.';
    if (selectedGenres.length === 0) newErrors.genres = 'At least one genre is required.';
    if (!movieData.releaseDate) newErrors.releaseDate = 'Release Date is required.';
    if (!movieData.duration || parseInt(movieData.duration) <= 0) newErrors.duration = 'Duration must be greater than 0.';
    return newErrors;
  }, [movieData, selectedGenres]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setMovieData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleImageUpload = useCallback((imageUrl) => {
    setMovieData((prev) => ({ ...prev, poster: imageUrl }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setLoading(true);

    // Log all form data
    console.log('Form Data:', {
      ...movieData,
      genres: selectedGenres
    });

    try {
      await axios.post('http://localhost:8000/api/v1/movies/addmovie', { ...movieData, genres: selectedGenres });
      setLoading(false);
      toast.success(`Movie "${movieData.title}" has been successfully added.`);
      setMovieData(initialMovieData);
      setSelectedGenres([]);
      setErrors({});
    } catch (error) {
      console.error('Error adding movie:', error);
      setLoading(false);
      toast.error('An error occurred while adding the movie. Please try again.');
    }
  };

  const handleGenreChange = (value) => {
    if (selectedGenres.includes(value)) {
      setSelectedGenres(selectedGenres.filter(genre => genre !== value));
    } else {
      setSelectedGenres([...selectedGenres, value]);
    }
  };

  const removeGenre = (genre) => {
    setSelectedGenres(selectedGenres.filter(g => g !== genre));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl font-bold mb-12 text-center text-yellow-400 drop-shadow-lg"
        >
          Add New Movie
        </motion.h1>
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit} 
          className="bg-gray-800 p-8 sm:p-10 rounded-xl shadow-2xl space-y-6 border border-gray-700"
        >
          <TextInput
            label="Title"
            name="title"
            value={movieData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="Enter movie title"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SelectInput
              label="Certification"
              name="certification"
              options={CERTIFICATIONS}
              value={movieData.certification}
              onChange={(value) => setMovieData((prev) => ({ ...prev, certification: value }))}
              error={errors.certification}
            />
            <TextInput
              label="Language"
              name="language"
              value={movieData.language}
              onChange={handleChange}
              error={errors.language}
              placeholder="e.g., English"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genres" className="text-gray-300">Genres</Label>
            <Select onValueChange={handleGenreChange}>
              <SelectTrigger className="w-full bg-gray-800 text-white border-gray-700 focus:ring-yellow-400 focus:border-yellow-400">
                <SelectValue placeholder="Select genres" />
              </SelectTrigger>
              <SelectContent 
                className="bg-gray-800 text-white border-gray-700"
                position="popper"
                side="bottom"
                align="start"
                sideOffset={5}
              >
                {GENRES.map((genre) => (
                  <SelectItem key={genre.value} value={genre.value} className="hover:bg-yellow-400 hover:text-gray-900 transition-colors duration-200">
                    {genre.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AnimatePresence>
              {selectedGenres.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 flex flex-wrap gap-2"
                >
                  {selectedGenres.map((genre) => (
                    <motion.span
                      key={genre}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {genre}
                      <button
                        type="button"
                        onClick={() => removeGenre(genre)}
                        className="ml-2 focus:outline-none"
                      >
                        <X size={14} />
                      </button>
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {errors.genres && <p className="text-red-500 text-sm">{errors.genres}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <TextInput
              label="Release Date"
              name="releaseDate"
              type="date"
              value={movieData.releaseDate}
              onChange={handleChange}
              error={errors.releaseDate}
            />
            <TextInput
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={movieData.duration}
              onChange={handleChange}
              error={errors.duration}
              placeholder="e.g., 120"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="poster" className="text-gray-300">Upload Poster</Label>
            <ImageUpload onImageUpload={handleImageUpload} />
            {errors.poster && <p className="text-red-500 text-sm">{errors.poster}</p>}
            <AnimatePresence>
              {movieData.poster && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <img
                    src={movieData.poster}
                    alt="Poster Preview"
                    className="w-full h-auto max-h-64 object-contain rounded-lg shadow-lg border-2 border-yellow-400"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
            disabled={loading}
          >
            {loading ? <Spinner className="mr-2" /> : null}
            {loading ? 'Adding Movie...' : 'Add Movie'}
          </Button>
        </motion.form>
      </div>
      <Toaster />
    </div>
  );
}