import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import R2Uploader from '../cloud/R2Uploader';
import { api } from '@/lib/api';
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
import { ArrowLeft, Check, X } from 'lucide-react';
import { PageTransition, Stagger, StaggerItem } from '@/components/ui/Motion';

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
  description: '',
  trailerUrl: '',
  isNowShowing: false,
  isFeatured: false,
};

const isValidUrl = (value) => {
  if (!value) return true;
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const inputCls =
  'h-10 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:border-red-500 focus-visible:ring-red-500/20 rounded-md';

const TextInput = ({ label, name, value, onChange, error, type = 'text', placeholder }) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="text-slate-800 text-sm font-medium">
      {label}
    </Label>
    <Input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full ${inputCls} ${error ? 'border-rose-500' : ''}`}
      placeholder={placeholder}
    />
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-rose-600 text-sm"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const SelectInput = ({ label, name, options, value, onChange, error }) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="text-slate-800 text-sm font-medium">
      {label}
    </Label>
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className={`w-full ${inputCls}`}>
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent className="bg-white text-slate-900 border-slate-200">
        {options.map((option) => (
          <SelectItem
            key={option}
            value={option}
            className="focus:bg-slate-100 focus:text-slate-900"
          >
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
          className="text-rose-600 text-sm"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

export default function AddMoviePage() {
  const navigate = useNavigate();
  const [movieData, setMovieData] = useState(initialMovieData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
    if (movieData.trailerUrl && !isValidUrl(movieData.trailerUrl)) newErrors.trailerUrl = 'Trailer URL must be a valid URL.';
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

    const body = {
      title: movieData.title.trim(),
      poster: movieData.poster,
      certification: movieData.certification,
      language: movieData.language.trim(),
      genres: selectedGenres,
      releaseDate: movieData.releaseDate,
      duration: Number(movieData.duration),
      isNowShowing: !!movieData.isNowShowing,
      isFeatured: !!movieData.isFeatured,
    };
    if (movieData.description.trim()) body.description = movieData.description.trim();
    if (movieData.trailerUrl.trim()) body.trailerUrl = movieData.trailerUrl.trim();

    try {
      await api.post('/movies', body);
      setLoading(false);
      setSuccess(true);
      toast.success(`Movie "${movieData.title}" has been successfully added.`);
      // Show the success state briefly, then navigate back.
      setTimeout(() => {
        setMovieData(initialMovieData);
        setSelectedGenres([]);
        setErrors({});
        setSuccess(false);
        navigate(-1);
      }, 1500);
    } catch (error) {
      setLoading(false);
      const message = error?.response?.data?.message || 'An error occurred while adding the movie. Please try again.';
      toast.error(message);
    }
  };

  const handleCancel = () => {
    navigate(-1);
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
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-4 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </button>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-6">
          Add New Movie
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8"
        >
          <Stagger gap={0.06} className="space-y-6">
            <StaggerItem>
              <TextInput
                label="Title"
                name="title"
                value={movieData.title}
                onChange={handleChange}
                error={errors.title}
                placeholder="Enter movie title"
              />
            </StaggerItem>

            <StaggerItem className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SelectInput
                label="Certification"
                name="certification"
                options={CERTIFICATIONS}
                value={movieData.certification}
                onChange={(value) =>
                  setMovieData((prev) => ({ ...prev, certification: value }))
                }
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
            </StaggerItem>

            <StaggerItem className="space-y-2">
              <Label
                htmlFor="genres"
                className="text-slate-800 text-sm font-medium"
              >
                Genres
              </Label>

              {/* Genre chips: full set with selected highlight */}
              <div id="genres" className="flex flex-wrap gap-2">
                {GENRES.map((genre) => {
                  const selected = selectedGenres.includes(genre.value);
                  return (
                    <button
                      key={genre.value}
                      type="button"
                      onClick={() => handleGenreChange(genre.value)}
                      aria-pressed={selected}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${
                        selected
                          ? 'bg-red-100 text-red-600 border-red-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {genre.label}
                      {selected && (
                        <X
                          size={12}
                          aria-label="Remove genre"
                          role="img"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGenre(genre.value);
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {errors.genres && (
                <p className="text-rose-600 text-sm">{errors.genres}</p>
              )}
            </StaggerItem>

            <StaggerItem className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            </StaggerItem>

            <StaggerItem className="space-y-2">
              <Label
                htmlFor="poster"
                className="text-slate-800 text-sm font-medium"
              >
                Upload Poster
              </Label>
              <R2Uploader onImageUpload={handleImageUpload} />
              {errors.poster && (
                <p className="text-rose-600 text-sm">{errors.poster}</p>
              )}
              <AnimatePresence>
                {movieData.poster && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                    className="mt-3"
                  >
                    <img
                      src={movieData.poster}
                      alt="Poster Preview"
                      className="w-full h-auto max-h-64 object-contain rounded-xl border border-slate-200"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </StaggerItem>

            <StaggerItem className="space-y-2">
              <Label
                htmlFor="description"
                className="text-slate-800 text-sm font-medium"
              >
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={movieData.description}
                onChange={handleChange}
                placeholder="Optional synopsis or description"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:border-red-500 focus-visible:ring-red-500/20 rounded-md"
              />
            </StaggerItem>

            <StaggerItem>
              <TextInput
                label="Trailer URL"
                name="trailerUrl"
                value={movieData.trailerUrl}
                onChange={handleChange}
                error={errors.trailerUrl}
                placeholder="https://youtube.com/watch?v=..."
              />
            </StaggerItem>

            <StaggerItem className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <label className="flex items-center gap-3 cursor-pointer text-slate-700 select-none">
                <input
                  type="checkbox"
                  name="isNowShowing"
                  checked={movieData.isNowShowing}
                  onChange={(e) =>
                    setMovieData((prev) => ({
                      ...prev,
                      isNowShowing: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-red-500"
                />
                <span>Now Showing</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-slate-700 select-none">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={movieData.isFeatured}
                  onChange={(e) =>
                    setMovieData((prev) => ({
                      ...prev,
                      isFeatured: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-amber-400"
                />
                <span className="inline-flex items-center gap-1.5">
                  Featured
                  {/* Reserve fixed slot so layout doesn't jump when toggling. */}
                  <span
                    className="inline-flex items-center justify-center w-4 h-4 text-amber-500 text-xs"
                    aria-hidden={!movieData.isFeatured}
                  >
                    {movieData.isFeatured ? '★' : ''}
                  </span>
                </span>
              </label>
            </StaggerItem>

            <StaggerItem className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                onClick={handleCancel}
                disabled={loading || success}
                className="sm:w-32 h-11 bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-lg shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              >
                Cancel
              </Button>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                className={`flex-1 h-11 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  success
                    ? 'bg-emerald-600 focus-visible:ring-emerald-500'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 focus-visible:ring-red-500'
                }`}
                disabled={loading || success}
              >
                {success ? (
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 22,
                    }}
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <Check className="h-5 w-5" aria-hidden="true" />
                    Saved
                  </motion.span>
                ) : loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Adding Movie...
                  </span>
                ) : (
                  'Add Movie'
                )}
              </motion.button>
            </StaggerItem>
          </Stagger>
        </form>
        <Toaster />
      </div>
    </PageTransition>
  );
}
