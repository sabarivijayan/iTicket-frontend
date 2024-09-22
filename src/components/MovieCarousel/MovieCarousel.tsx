'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import styles from './MovieCarousel.module.css';
import MovieCard from '../MovieCard/MovieCard';

// Define types within the file
type Showtime = {
  time: string;
};

type Movie = {
  _id: string;
  title: string;
  genre: string[];
  rating: number;
  // Add other fields as needed
};

type Theatre = {
  _id: string;
  name: string;
  // Add other fields as needed
};

type ShowWithDetails = {
  _id: string;
  movie: Movie;
  showtimes: Showtime[];
  theatre: Theatre;
  theatres: Theatre[];
  date: string;
  // Add other fields as needed
};

const MovieCarousel: React.FC = () => {
  // State variables
  const [shows, setShows] = useState<ShowWithDetails[]>([]);
  const [filteredShows, setFilteredShows] = useState<ShowWithDetails[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [showtimes, setShowtimes] = useState<string[]>([]);
  const [ratings, setRatings] = useState<number[]>([]);
  
  // Filter states
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [selectedShowtime, setSelectedShowtime] = useState<string>('All');
  const [selectedRating, setSelectedRating] = useState<number | 'All'>('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/show/list');
        if (response.data.success) {
          const showsData: ShowWithDetails[] = response.data.data;
          setShows(showsData);
          setFilteredShows(showsData);

          // Extract unique genres, showtimes, and ratings from the response data
          const allGenres = showsData.flatMap(show => show.movie?.genre || []);
          const uniqueGenres = Array.from(new Set(allGenres));
          const uniqueShowtimes = Array.from(new Set(showsData.flatMap(show => show.showtimes.map(showtime => showtime.time))));
          const uniqueRatings = Array.from(new Set(showsData.flatMap(show => show.movie?.rating ? [show.movie.rating] : []))).sort((a, b) => b - a);

          setGenres(uniqueGenres);
          setShowtimes(uniqueShowtimes);
          setRatings(uniqueRatings);
        }
      } catch (error) {
        console.error('Error fetching shows:', error);
      }
    };

    fetchData();
  }, []);

  // Filter logic
  const filterMovies = () => {
    let updatedShows = shows;
  
    if (selectedGenres.size > 0) {
      updatedShows = updatedShows.filter(show => 
        show.movie?.genre?.some(genre => selectedGenres.has(genre.toLowerCase()))
      );
    }
  
    if (selectedShowtime !== 'All') {
      updatedShows = updatedShows.filter(show =>
        show.showtimes.some(showtime => showtime.time === selectedShowtime)
      );
    }
  
    if (selectedRating !== 'All') {
      updatedShows = updatedShows.filter(show => show.movie?.rating && show.movie.rating >= selectedRating);
    }
  
    setFilteredShows(updatedShows);
  };

  // Call filterMovies whenever filters change
  useEffect(() => {
    filterMovies();
  }, [selectedGenres, selectedShowtime, selectedRating]);

  // Toggle genre selection
  const handleGenreChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const genre = event.target.value;
    setSelectedGenres(prevGenres => {
      const newGenres = new Set(prevGenres);
      if (genre === 'All') {
        newGenres.clear();
      } else if (newGenres.has(genre.toLowerCase())) {
        newGenres.delete(genre.toLowerCase());
      } else {
        newGenres.add(genre.toLowerCase());
      }
      return newGenres;
    });
  };

  return (
    <div className={styles.carouselContainer}>
      <h2 className={styles.carouselHeading}>Now Playing</h2>

      {/* Filter Section */}
      <div className={styles.filterContainer}>
        <div className={styles.filterGroup}>
          <h4 className={styles.filterTitle}>Genres</h4>
          <select onChange={handleGenreChange} className={styles.filterSelect}>
            <option value="All">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <h4 className={styles.filterTitle}>Showtimes</h4>
          <select onChange={(e) => setSelectedShowtime(e.target.value)} className={styles.filterSelect}>
            <option value="All">All Showtimes</option>
            {showtimes.map(showtime => (
              <option key={showtime} value={showtime}>{showtime}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <h4 className={styles.filterTitle}>Ratings</h4>
          <select onChange={(e) => setSelectedRating(Number(e.target.value))} className={styles.filterSelect}>
            <option value="All">All Ratings</option>
            {ratings.map(rating => (
              <option key={rating} value={rating}>{rating}+</option>
            ))}
          </select>
        </div>
      </div>

      <Swiper spaceBetween={20} slidesPerView={4} loop={true} className={styles.carousel}>
        {filteredShows.map((show) => (
          <SwiperSlide key={show._id}>
            <MovieCard show={show} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MovieCarousel;
