'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';
import styles from './MovieSlider.module.css';
import { ShowWithDetails } from '@/types/types'; // Import types

export default function MovieSlider() {
  const [shows, setShows] = useState<ShowWithDetails[]>([]);
  const backendUrl = 'http://localhost:4000'; // Backend API URL

  // Fetch data from the /api/show/list endpoint
  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/show/list`);
        const data = await response.json();
        if (data.success) {
          setShows(data.data); // Set the fetched shows from backend
        }
      } catch (error) {
        console.error('Error fetching shows:', error);
      }
    };

    fetchShows();
  }, []);

  return (
    <div className={styles.sliderContainer}>
      {shows.length > 0 ? (
        <Swiper
          modules={[Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 5000 }}
          loop={shows.length > 1}
          className={styles.swiper}
        >
          {shows.map((show) => (
            <SwiperSlide key={show._id}>
              <div
                className={styles.sliderItem}
                style={{
                  backgroundImage: `url(${backendUrl}/images/${show.movie?.backdropImg || 'default-backdrop.jpg'})`,
                }}
              >
                <div className={styles.sliderContents}>
                  <h2>{show.movie?.title || 'Untitled'}</h2>
                  <button>Watch Now</button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div>No shows available to display</div>
      )}
    </div>
  );
}
