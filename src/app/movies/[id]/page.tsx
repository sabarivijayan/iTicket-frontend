"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ShowWithDetails, CastType, CrewType } from "../../../types/types";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import styles from "./MovieDetails.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const MovieDetailsPage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const [show, setShow] = useState<ShowWithDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cast, setCast] = useState<CastType[]>([]);
  const [crew, setCrew] = useState<CrewType[]>([]);
  const router = useRouter();
  const url = "http://localhost:4000"; // Adjust according to your environment

  useEffect(() => {
    const fetchShow = async () => {
      try {
        const response = await axios.get(`${url}/api/show/${params.id}`);
        if (response.data.success) {
          setShow(response.data.data);
          const movieName = response.data.data.movie.title;
          fetchMovieCastAndCrew(movieName);
        } else {
          toast.error("Error fetching show details");
          router.push("/404");
        }
      } catch (error) {
        toast.error("Error fetching show details");
        router.push("/404");
      } finally {
        setLoading(false);
      }
    };

    const fetchMovieCastAndCrew = async (movieName: string) => {
      try {
        const tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        const searchResponse = await axios.get(
          `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${movieName}`
        );

        if (searchResponse.data.results.length > 0) {
          const movieId = searchResponse.data.results[0].id;
          const creditsResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${tmdbApiKey}`
          );

          setCast(creditsResponse.data.cast);
          setCrew(creditsResponse.data.crew);
        }
      } catch (error) {
        toast.error("Error fetching cast and crew");
      }
    };

    fetchShow();
  }, [params.id, router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!show) {
    return <p>Show not found.</p>;
  }

  // Sort dates in ascending order
  const sortedDates = show.dates.slice().sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <>
      <div className={styles.movieDetailsPage}>
        <div className={styles.backdrop}>
          <Image
            src={`${url}/images/${show.movie.backdropImg}`}
            alt={show.movie.title}
            layout="fill"
            objectFit="cover"
            className={styles.backdropImg}
          />
        </div>

        <div className={styles.movieInfoContainer}>
          <div className={styles.poster}>
            <Image
              src={`${url}/images/${show.movie.posterImg}`}
              alt={show.movie.title}
              width={200}
              height={300}
              className={styles.posterImg}
              unoptimized
            />
          </div>

          <div className={styles.details}>
            <h1 className={styles.title}>{show.movie.title}</h1>
            <p className={styles.description}>{show.movie.description}</p>
            <p className={styles.rating}>⭐ {show.movie.rating} / 10</p>
            <p className={styles.genre}>{show.movie.genre.join(", ")}</p>
            <p className={styles.duration}>
              Duration: {show.movie.duration} minutes
            </p>

            <div className={styles.buttonContainer}>
              <button
                className={styles.button}
                onClick={() => router.push(`/movies/${params.id}/booking`)}
              >
                Book Now
              </button>
              <button className={styles.button} onClick={() => router.back()}>
                Go Back
              </button>
            </div>
          </div>
        </div>

        <div className={styles.showtimeInfo}>
          <h2>Available Showtimes</h2>
          <div className={styles.dates}>
            {sortedDates.map((date, index) => (
              <p key={index}>Date: {new Date(date).toDateString()}</p>
            ))}
          </div>
          <div className={styles.showtimes}>
            {show.showtimes.map((showtime) => (
              <div key={showtime._id} className={styles.showtime}>
                <span>{showtime.time}</span>
              </div>
            ))}
          </div>
          <div className={styles.theatreInfo}>
            {show.theatres.map((theatre) => (
              <div key={theatre._id} className={styles.theatre}>
                <p className={styles.theatreName}>Theatre: {theatre.name}</p>
                <p className={styles.location}>Location: {theatre.location}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cast Section */}
      </div>
      <div className={styles.castSection}>
        <h2>Cast</h2>
        <Swiper
          spaceBetween={10}
          slidesPerView={4}
          className={styles.swiperContainer}
        >
          {cast.map((actor) => (
            <SwiperSlide key={actor.id} className={styles.castItem}>
              <Image
                src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                alt={actor.name}
                width={120}
                height={120}
                className={styles.profileImage}
              />
              <p className={styles.castName}>{actor.name}</p>
              <p className={styles.castCharacter}>{actor.character}</p>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
};

export default MovieDetailsPage;
