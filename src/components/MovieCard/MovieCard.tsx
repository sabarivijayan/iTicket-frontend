'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Use Next.js router for navigation
import { ShowWithDetails } from '@/types/types'; // Using ShowWithDetails from the types
import styles from './MovieCard.module.css'; // Custom CSS for styling

interface MovieCardProps {
  show: ShowWithDetails;
}

const MovieCard: React.FC<MovieCardProps> = ({ show }) => {
  const router = useRouter();
  const backendUrl = 'http://localhost:4000'; // Backend API URL

  // Handle click to navigate to the movie details page using the show ID
  const handleMovieClick = () => {
    router.push(`/movies/${show._id}`); // Redirect to the movie details page with show ID
  };

  // Null check for posterImg, provide a default image if not available
  const imageUrl = show.movie?.posterImg
    ? `${backendUrl}/images/${show.movie.posterImg}`
    : '/default-poster.jpg'; // Fallback to a default image

  return (
    <div className={styles.movieCard} onClick={handleMovieClick}>
      <div className={styles.movieImageContainer}>
        <Image
          src={imageUrl}
          alt={show.movie?.title || 'Movie Poster'} // Add null check for title
          width={300}
          height={450}
          className={styles.movieImage}
          priority
        />
      </div>
      <div className={styles.movieInfo}>
        <h3 className={styles.movieTitle}>{show.movie?.title || 'Untitled'}</h3> {/* Add null check for title */}
        <p className={styles.movieGenre}>Genres: {show.movie?.genre?.join(', ') || 'Unknown'}</p> {/* Add null check for genre */}
        <p className={styles.movieRating}>Rating: {show.movie?.rating || 'N/A'}/10</p> {/* Add null check for rating */}
        <div className={styles.movieShowtimes}>
          {show.showtimes.map((showtime) => (
            <span key={showtime._id}>{showtime.time}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
