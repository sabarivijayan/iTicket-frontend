"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./Seat.module.css";
import { toast } from "react-toastify";

interface Theatre {
  _id: string;
  name: string;
  location: string;
  capacity: number;
}

interface Showtime {
  _id: string;
  time: string;
}

interface Movie {
  _id: string;
  title: string;
  description: string;
  rating: number;
}

interface Show {
  _id: string;
  movie: Movie;
  theatres: Theatre[];
  showtimes: Showtime[];
  dates: string[];
}

interface SeatBookingPageProps {
  params: {
    id: string;
  };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const SeatBookingPage: React.FC<SeatBookingPageProps> = ({ params }) => {
  const [show, setShow] = useState<Show | null>(null);
  const [selectedTheatre, setSelectedTheatre] = useState<Theatre | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const backendUrl = "http://localhost:4000";
  const SEAT_LIMIT = 10;

  const token = sessionStorage.getItem("token");

  // Price per seat based on tier
  const seatPriceByTier = (rowIndex: number, totalRows: number) => {
    const tierSize = totalRows / 4; // Divide into 4 tiers
    if (rowIndex < tierSize) return 110;
    if (rowIndex < tierSize * 2) return 150;
    if (rowIndex < tierSize * 3) return 180;
    return 210;
  };

  const fetchBookedSeats = async (
    movieName: string,
    theatreName: string,
    date: string,
    showtime: string
  ) => {
    try {
      const response = await axios.get(`${backendUrl}/api/booking/list`, {
        params: {
          movieName,
          theatreName,
          date: new Date(date).toISOString(), // Format the date properly
          showtime,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const seats = response.data.data.flatMap((booking: any) => booking.bookedSeats);
      setBookedSeats(seats); // Update the bookedSeats state
    } catch (error) {
      console.error("Error fetching booked seats:", error);
      toast.error("Error loading booked seats.");
    }
  };

  useEffect(() => {
    const fetchShowDetails = async () => {
      if (!token) {
        toast.error("Please log in to proceed with booking.");
        router.push("/signup");
        return;
      }

      try {
        const response = await axios.get<{ success: boolean; data: Show[] }>(
          `${backendUrl}/api/show/list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          const selectedShow = response.data.data.find(
            (show) => show._id === params.id
          );

          if (selectedShow) {
            setShow(selectedShow);

            const theatreId = searchParams.get("theatreId");
            const showtimeId = searchParams.get("showtimeId");
            const date = searchParams.get("date");

            const selectedTheatre = selectedShow.theatres.find(
              (theatre) => theatre._id === theatreId
            );
            setSelectedTheatre(selectedTheatre || selectedShow.theatres[0]);

            const selectedShowtime = selectedShow.showtimes.find(
              (showtime) => showtime._id === showtimeId
            );
            setSelectedShowtime(selectedShowtime || selectedShow.showtimes[0]);

            setSelectedDate(date || selectedShow.dates[0]);

            // const bookingResponse = await axios.get(
            //   `${backendUrl}/api/booking/list?showId=${params.id}&theatreId=${theatreId}&date=${date}&showtimeId=${showtimeId}`,
            //   {
            //     headers: {
            //       Authorization: `Bearer ${token}`,
            //     },
            //   }
            // );
            
            // setBookedSeats(
            //   bookingResponse.data.data.flatMap(
            //     (booking: any) => booking.bookedSeats
            //   )
            // );

            await fetchBookedSeats(
              selectedShow.movie.title,
              selectedTheatre?.name || selectedShow.theatres[0].name,
              date || selectedShow.dates[0],
              selectedShowtime?.time || selectedShow.showtimes[0].time
            );
          } else {
            toast.error("Show not found.");
            router.push("/404");
          }
        } else {
          throw new Error("Failed to fetch shows.");
        }
      } catch (error) {
        console.error("Error fetching show details:", error);
        toast.error("Error loading data.");
      }
    };

    fetchShowDetails();
  }, [params.id, router, searchParams, token]);

  useEffect(() => {
    const loadRazorpayScript = () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    };
    loadRazorpayScript();
  }, []);

  const handleSeatClick = (seatNumber: string) => {
    if (bookedSeats.includes(seatNumber)) {
      toast.error("This seat is already booked.");
      return;
    }

    setSelectedSeats((prevSelectedSeats) =>
      prevSelectedSeats.includes(seatNumber)
        ? prevSelectedSeats.filter((seat) => seat !== seatNumber)
        : [...prevSelectedSeats, seatNumber]
    );
  };

  const handlePayment = async () => {
    if (!token) {
      toast.error("Please log in to proceed with booking.");
      router.push("/signup");
      return;
    }

    const invalidSeats = selectedSeats.filter((seat) => bookedSeats.includes(seat));
  if (invalidSeats.length > 0) {
    toast.error("One or more selected seats are already booked.");
    return; // Prevent payment initiation if any seat is already booked
  }

    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat.");
      return;
    }

    if (selectedSeats.length > SEAT_LIMIT) {
      toast.error(`You can't select more than ${SEAT_LIMIT} seats.`);
      return;
    }

    try {
      const userId = sessionStorage.getItem("userId");

      const bookingData = {
        movieName: show?.movie.title,
        theatreName: selectedTheatre?.name,
        showtime: selectedShowtime?.time,
        date: selectedDate,
        bookedSeats: selectedSeats,
        totalPrice,
        userId,
      };

      const { data } = await axios.post(
        `${backendUrl}/api/booking/place`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Movie Booking",
        description: `Payment for ${show?.movie.title}`,
        order_id: data.orderId,
        handler: async (response: RazorpayPaymentResponse) => {
          await handlePaymentSuccess(response);
        },
        prefill: {
          email: "user@example.com",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error during payment initiation:", error);
      toast.error("Failed to initiate payment.");
      handlePaymentFailure();
    }
  };

  const handlePaymentSuccess = async (response: RazorpayPaymentResponse) => {
    try {
      const paymentData = {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
      };

      const { data } = await axios.post(
        `${backendUrl}/api/booking/payment-success`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success("Payment successful. Booking confirmed.");
        router.push("/user-dashboard");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error("Payment failed to confirm.");
      handlePaymentFailure();
    }
  };

  const handlePaymentFailure = () => {
    toast.error("Payment failed. Please try again.");
    router.push("/");
  };

  // Calculate total price based on selected seats and their tiers
  const totalRows = Math.ceil(selectedTheatre?.capacity! / 10);
  const totalPrice = selectedSeats.reduce((total, seat) => {
    const rowIndex = parseInt(seat.split("S")[0].substring(1)) - 1; // Extract row index from seat number
    return total + seatPriceByTier(rowIndex, totalRows);
  }, 0);

  if (!show || !selectedTheatre || !selectedShowtime || !selectedDate) {
    return <p>Loading...</p>;
  }

  const seatsPerRow = 10;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>
        Select Your Seats for {show.movie.title}
      </h1>
      <p className={styles.descriptionText}>
        Theatre: {selectedTheatre.name}, Location: {selectedTheatre.location},
        Capacity: {selectedTheatre.capacity}
      </p>
      <div className={styles.descriptionText}>
        Showtime: {selectedShowtime.time}
      </div>
      <div className={styles.descriptionText}>
        Date: {new Date(selectedDate).toLocaleDateString("en-GB")}
      </div>

      <div className={styles.seatMap}>
        {[...Array(totalRows)].map((_, rowIndex) => {
          const rowPrice = seatPriceByTier(rowIndex, totalRows);
          const previousRowPrice =
            rowIndex > 0 ? seatPriceByTier(rowIndex - 1, totalRows) : null;

          return (
            <div key={rowIndex} className={styles.rowContainer}>
              {/* Display the row price only if it changes */}
              {rowPrice !== previousRowPrice && (
                <div className={styles.rowPrice}>₹{rowPrice}</div>
              )}
              <div className={styles.row}>
                {[...Array(seatsPerRow)].map((_, seatIndex) => {
                  const seatNumber = `R${rowIndex + 1}S${seatIndex + 1}`;
                  const isBooked = bookedSeats.includes(seatNumber);
                  return (
                    <div
                      key={seatNumber}
                      className={`${styles.seat} ${
                        selectedSeats.includes(seatNumber)
                          ? styles.seatSelected
                          : ""
                      } ${isBooked ? styles.seatBooked : ""}`}
                      onClick={() => !isBooked && handleSeatClick(seatNumber)}
                      title={`Price: ₹${rowPrice}`}
                    >
                      {seatNumber}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.totalPriceContainer}>
        <p className={styles.totalPriceText}>Total Price: ₹{totalPrice}</p>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.buttonContinue}
          onClick={handlePayment}
          disabled={selectedSeats.length === 0}
        >
          Pay now
        </button>
        <button className={styles.buttonBack} onClick={() => router.back()}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default SeatBookingPage;
