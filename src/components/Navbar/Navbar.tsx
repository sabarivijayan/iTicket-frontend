'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './Navbar.module.css';
import { StoreContext } from '../../context/StoreContext';
import { ShowWithDetails } from '../../types/types';

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [shows, setShows] = useState<ShowWithDetails[]>([]);
  const [filteredShows, setFilteredShows] = useState<ShowWithDetails[]>([]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);
  const { token, setToken } = useContext(StoreContext);
  const router = useRouter();
  const url = 'http://localhost:4000';

  // Fetching show data
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

  // Filter shows based on search term
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

  // Check for user login status and profile picture from sessionStorage
  useEffect(() => {
    const storedToken = sessionStorage.getItem('token'); // Check if token exists in sessionStorage
    const googleProfilePic = sessionStorage.getItem('googleProfilePic'); // Get Google profile picture URL if available
    if (storedToken) {
      setIsUserLoggedIn(true); // If token exists, set user as logged in
      setToken(storedToken); // Store the token in the global state if needed
      if (googleProfilePic) {
        setUserProfilePic(googleProfilePic); // Set Google profile picture if available
      }
    }
  }, [setToken]);

  const handleLogout = () => {
    sessionStorage.removeItem('token'); // Remove token from sessionStorage on logout
    sessionStorage.removeItem('googleProfilePic'); // Remove Google profile picture on logout
    setIsUserLoggedIn(false); // Update the state to reflect user is logged out
    setShowDropdown(false); // Hide the dropdown after logout
    setToken(null); // Clear token from global state
    router.push('/'); // Redirect to the home page
  };

  const handleDashboardClick = () => {
    router.push('/user-dashboard'); // Redirect to the user dashboard page
  };

  const handleMovieClick = (movieId: string) => {
    router.push(`/movies/${movieId}`); // Redirect to movie detail page
  };

  const handleLogoClick = () => {
    router.push('/'); // Redirect to home page when logo is clicked
  };

  const handleSignUpClick = () => {
    router.push('/signup'); // Redirect to signup page
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
              {userProfilePic ? (
                <Image
                  src={userProfilePic}
                  alt="User Profile"
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
                <button className={styles.dashboardButton} onClick={handleDashboardClick}>
                  Dashboard
                </button>
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
    </nav>
  );
}
