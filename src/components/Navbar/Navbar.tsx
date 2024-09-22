'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './Navbar.module.css';
import { StoreContext } from '../../context/StoreContext';
import { ShowWithDetails } from '../../types/types';
import LoginPopup from '../LoginPopup/LoginPopup';

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [shows, setShows] = useState<ShowWithDetails[]>([]);
  const [filteredShows, setFilteredShows] = useState<ShowWithDetails[]>([]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const [googleProfilePic, setGoogleProfilePic] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const { token, setToken } = useContext(StoreContext);
  const router = useRouter();
  const url = 'http://localhost:4000';

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await fetch(`${url}/api/show/list`);
        const data = await response.json();
        if (data.success) {
          setShows(data.data);
        }
      } catch (error) {
        console.error('Error fetching shows:', error);
      }
    };
    fetchShows();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 2) {
      const results = shows.filter((show) =>
        show.movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredShows(results);
    } else {
      setFilteredShows([]);
    }
  }, [searchTerm, shows]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setIsUserLoggedIn(true);
      setToken(storedToken);
    }

    const googleProfile = localStorage.getItem('googleProfilePic');
    if (googleProfile) {
      setGoogleProfilePic(googleProfile);
    }
  }, [setToken]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('googleProfilePic');
    setIsUserLoggedIn(false);
    setGoogleProfilePic(null);
    setShowDropdown(false);
    setToken(null);
    router.push('/');
  };

  const handleMovieClick = (movieId: string) => {
    router.push(`/movies/${movieId}`);
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleSignUpClick = () => {
    setShowLoginPopup(!showLoginPopup);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <Image src="/assets/logo.png" alt="App Logo" width={150} height={50} />
      </div>

      <div className={styles.navbarRight}>
        <div className={styles.searchbox}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search movies"
            className={styles.searcharea}
          />
          {filteredShows.length > 0 && (
            <div className={styles.suggestionsDropdown}>
              {filteredShows.map((show) => (
                <div
                  key={show._id}
                  className={styles.suggestionItem}
                  onClick={() => handleMovieClick(show.movie._id)}
                >
                  <div className={styles.suggestionContent}>
                    <span>{show.movie.title}</span>
                    <Image
                      src={`${url}/images/${show.movie.posterImg}`}
                      alt={show.movie.title}
                      width={50}
                      height={75}
                      className={styles.suggestionImage}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isUserLoggedIn ? (
          <div className={styles.userSection}>
            <div
              className={styles.userIcon}
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ cursor: 'pointer' }}
            >
              {googleProfilePic ? (
                <Image
                  src={googleProfilePic}
                  alt="Google User Profile"
                  width={40}
                  height={40}
                  className={styles.profilePic}
                />
              ) : (
                <Image
                  src="/assets/user_icon.png"
                  alt="User Icon"
                  width={40}
                  height={40}
                  className={styles.profilePic}
                />
              )}
            </div>
            {showDropdown && (
              <div className={styles.dropdownMenu}>
                <button className={styles.logoutButton} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className={styles.signupButton} onClick={handleSignUpClick}>
            Sign Up
          </button>
        )}
      </div>

      {showLoginPopup && <LoginPopup closePopup={() => setShowLoginPopup(false)} />}
    </nav>
  );
}
