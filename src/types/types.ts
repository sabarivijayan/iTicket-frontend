// Movie-related interfaces
export interface Movie {
  _id: string;
  title: string;
  description: string;
  posterImg: string;
  backdropImg: string;
  rating: number;
  genre: string[];
  duration: number;
}

export interface Theatre {
  _id: string;
  name: string;
  location: string;
  capacity: number;
}

export interface Showtime {
  _id: string;
  time: string;
  theatreId: string;
  seats: Seat[];
}

export interface Show {
  _id: string;
  movie: Movie;
  theatres: Theatre[]; // List of theatres showing this movie
  showtimes: Showtime[]; // List of showtimes for this movie
  dates: string[]; // Available dates for this show
}

export interface ShowWithDetails extends Show {
  theatre: Theatre; // Includes location details for theatre
}

// Context Types for booking
export interface AvailableShowtimes {
  date: string;
  theatres: Array<{
    theatre: Theatre;
    showtimes: Showtime[];
  }>;
}

// Other interfaces (MovieCardType, Genre, etc.) remain unchanged
export interface MovieCardType {
  id: string;
  title: string;
  posterImg: string;
  rating: number;
  genre: string[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetailsType {
  movie: Movie;
  overview: string;
  release_date: string;
  runtime: number;
  genres: Genre[];
  backdropImg: string;
}

// Cast & Crew Types
export interface CastType {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewType {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
}

export interface CreditsType {
  cast: CastType[];
  crew: CrewType[];
}

// Google OAuth Response (from @react-oauth/google)
export interface GoogleOAuthResponse {
  credential: string;
  clientId: string;
}

// User data related to authentication
export interface User {
  name: string;
  email: string;
  googleProfilePic?: string;
  token?: string; // Added to handle token in user object
}

// Context Types
export interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

// Login Popup Form Data
export interface LoginFormData {
  email: string;
  password: string;
}

// Register Popup Form Data (separated from login form)
export interface RegisterFormData extends LoginFormData {
  username: string;
}

// Login Response from API
export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User; // The full user object including name, email, googleProfilePic, etc.
}

export interface Seat {
  _id: string;        // Unique identifier for the seat
  seatNumber: string; // Seat number within the row
  row: string;        // Row identifier (e.g., 'A', 'B', 'C', etc.)
  isBooked: boolean;  // Booking status of the seat
  price: number;      // Price of the seat
}

// Define a type for SeatBookingDetail
export interface SeatBookingDetails {
  showtimeId: string;  // The ID of the showtime
  theatreId: string;   // The ID of the theatre
  seats: Seat[];       // Array of seats available for booking
  selectedSeats: Seat[];  // Array of seats selected by the user
  totalPrice: number;  // Total price for the selected seats
}
