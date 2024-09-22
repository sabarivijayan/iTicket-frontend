"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AvailableShowtimes,
  ShowWithDetails,
  Showtime,
} from "../../../../types/types";
import styles from "./Booking.module.css";
import { toast } from "react-toastify";

interface BookingPageProps {
  params: {
    id: string;
  };
}

const BookingPage: React.FC<BookingPageProps> = ({ params }) => {
  const [showDetails, setShowDetails] = useState<ShowWithDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableShowtimes, setAvailableShowtimes] = useState<
    AvailableShowtimes[]
  >([]);
  const router = useRouter();
  const url = "http://localhost:4000"; // Replace with actual backend URL

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        const response = await axios.get<{
          success: boolean;
          data: ShowWithDetails;
        }>(`${url}/api/show/${params.id}`);
        if (response.data.success) {
          setShowDetails(response.data.data);

          // Map the available showtimes based on dates and theatres
          const mappedShowtimes = response.data.data.dates.map((date) => ({
            date,
            theatres: response.data.data.theatres.map((theatre) => ({
              theatre,
              showtimes: response.data.data.showtimes.map((showtime) => ({
                ...showtime,
                theatreId: theatre._id, // Associate showtime with theatreId
              })),
            })),
          }));
          setAvailableShowtimes(mappedShowtimes);
        }
      } catch (error) {
        toast.error("Error fetching show details.");
        console.error("Error fetching show details:", error);
        router.push("/404");
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetails();
  }, [params.id]);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };
  const handleShowtimeClick = (theatreId: string, showtimeId: string) => {
    router.push(
      `/movies/${params.id}/seats?theatreId=${theatreId}&showtimeId=${showtimeId}`
    );
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!showDetails) {
    return <p>Show not found.</p>;
  }

  // Filter shows based on selected date
  const filteredShows = availableShowtimes.find(
    (show) => show.date === selectedDate
  );

  return (
    <div className={styles.movieDetailsPage}>
      <div className={styles.backdrop}>
        <Image
          src={`${url}/images/${showDetails.movie.backdropImg}`}
          alt={showDetails.movie.title}
          layout="fill"
          objectFit="cover"
          className={styles.backdropImg}
        />
      </div>

      <div className={styles.movieInfoContainer}>
        <div className={styles.poster}>
          <Image
            src={`${url}/images/${showDetails.movie.posterImg}`}
            alt={showDetails.movie.title}
            width={200}
            height={300}
            className={styles.posterImg}
            unoptimized
          />
        </div>

        <div className={styles.details}>
          <h1 className={styles.title}>{showDetails.movie.title}</h1>
          <p className={styles.description}>{showDetails.movie.description}</p>
          <p className={styles.rating}>⭐ {showDetails.movie.rating} / 10</p>
          <p className={styles.genre}>{showDetails.movie.genre.join(", ")}</p>
          <p className={styles.duration}>
            Duration: {showDetails.movie.duration} minutes
          </p>
        </div>
      </div>

      <div className={styles.showtimeInfo}>
        <h2>Select Date</h2>
        <div className={styles.dates}>
          {availableShowtimes.map((show) => (
            <button
              key={show.date}
              className={`${styles.dateButton} ${
                selectedDate === show.date ? styles.active : ""
              }`}
              onClick={() => handleDateClick(show.date)}
            >
              {new Date(show.date).toDateString()}
            </button>
          ))}
        </div>

        {selectedDate && filteredShows ? (
          <div className={styles.theatreSection}>
            <h2>Theatres Playing on {new Date(selectedDate).toDateString()}</h2>
            {filteredShows.theatres.map(({ theatre, showtimes }) => (
              <div key={theatre._id} className={styles.theatreEntry}>
                <p>
                  <strong>Theatre:</strong> {theatre.name}
                </p>
                <p>
                  <strong>Location:</strong> {theatre.location}
                </p>
                <div className={styles.showtimes}>
                  {showtimes.length > 0 ? (
                    showtimes.map((showtime: Showtime) => (
                      <button
                        key={showtime._id}
                        className={styles.showtimeButton}
                        onClick={() =>
                          handleShowtimeClick(theatre._id, showtime._id)
                        }
                      >
                        {showtime.time}
                      </button>
                    ))
                  ) : (
                    <p>
                      No showtimes available for this theatre on the selected
                      date.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No shows available for the selected date.</p>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
