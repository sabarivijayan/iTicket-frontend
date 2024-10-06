import axios from 'axios'
export const getAllMovies = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const res = await axios.get(`http://localhost:4000/api/movie?${params}`);

    if (res.status !== 200) {
      console.log("No Data");
      return;
    }
    const data = await res.data;
    return data;
  } catch (err) {
    console.log("Error: ", err.message);
  }
};


// ****************For user Authentication************************
export const sendUserAuthRequest = async (data, signup) => {
    try {
     // Check if the necessary data properties are provided
      if (!data || !data.email || !data.password || (signup && !data.phone)) {
        console.error("Missing required fields:", data);
        throw new Error("Missing required fields");
      }
      // Make the API request
      const res = await axios.post(`http://localhost:4000/api/user/${signup ? "signup" : "login"}`, {
        phone: signup ? data.phone : "",
        email: data.email,
        password: data.password,
      });
      // Check if the response status is not 200 or 201
      if (res.status !== 200 && res.status !== 201) {
        console.log("Unexpected error occurred!", res.status);
        return;
      }
      // Extract and return the data from the response
      const resData = await res.data;
      return resData;
    } catch (err) {
      // Handle errors
      console.error("Error:", err.message);
    }
  };



//**************For admin authentication********************
  export const sendAdminAuthRequest = async (data) => {
    if (!data?.email || !data?.password) {
      throw new Error("Email or Password is undefined");
    }
    try {
      const res = await axios.post("http://localhost:4000/api/admin/login", {
        email: data.email,
        password: data.password,
      });
      if (res.status !== 200 && res.status !== 201 ) {
        console.log("Unexpected error occurred!", res.status);
        return null;
      }  
      return res.data;
    } catch (err) {
      console.log("Error occurred:", err);
      return null; // Return null on error
    }
  };
  

// *************Get the details of the movie by the movie id******************
  export const getMovieDetails = async (id) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/movie/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  };

  export const getUserBooking = async () => {
    const id = localStorage.getItem("userId");
    if (!id) {
      console.error("User ID not found in localStorage.");
      return;
    }
    try {
      const response = await axios.get(`http://localhost:4000/api/user/bookings/${id}`) 
      if (response.status !== 200) {
        console.error("Unexpected error: ", res);
        return;
      }
      const data = response.data;
      return data;
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };
  


  //*******************delete the history***********************
  export const deleteBooking = async(id) =>{
    const res = await axios.delete(`http://localhost:4000/api/booking/${id}`)
    .catch((err) =>console.log(err));
    if(res.status !== 200){
      return console.log("Unexpected error");
    }
    const resData = await res.data;
    return resData;
  }


  // ******************Get the  user details by the id*******************
  export const getUserDetails = async() => {
    const id = localStorage.getItem("userId");
    if (!id) {
      console.error("User ID not found in localStorage.");
      return;
    }
    try {
      const res = await axios.get(`http://localhost:4000/api/user/${id}`);
      if (res.status !== 200) {
        console.error("Unexpected error: ", res);
        return;
      }
      return res.data;
    } catch (err) {
      console.error("Error fetching user details:", err);
    }
  };
  

export const addMovie = async (formData) => {
  console.log('Sending formData:', formData); // Log the formData

  const token = localStorage.getItem("token");
  console.log('Token:', token); // Log the token

  try {
    const res = await axios.post('http://localhost:4000/api/movie', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (res.status !== 201) {
      throw new Error(`Failed to add movie, status: ${res.status}`);
    }

    return res.data;
  } catch (err) {
    console.error('Error adding movie:', err.response?.data || err.message);
    throw err;
  }
};

// ********************To add theatre*************************
export const addTheater = async (theaterData) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.post('http://localhost:4000/api/theatre/add', theaterData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (res.status !== 201) {
      throw new Error(`Failed to add theatre, status: ${res.status}`);
    }
    return res.data;
  } catch (err) {
    console.error('Error adding theatre:', err.response?.data || err.message);
    throw err;
  }
};

// *******************To fetch all the theatres******************
export const getAllTheatres = async (filters = {}) => {
  try {
    // Convert filters to query parameters
    const params = new URLSearchParams(filters).toString();
    
    // Send GET request to the backend
    const res = await axios.get(`http://localhost:4000/api/theatre?${params}`);
    // Check response status
    if (res.status !== 200) {
      console.log("No Data");
      return [];
    }
    // Extract and return data from the response
    const data = await res.data;
    return data;
  } catch (err) {
    // Handle and log errors
    console.error("Error fetching theatres:", err.message);
    return []; // Return an empty array on error
  }
};


// ***************Add show times to theatre**********************
export const addShowtimesToTheater = async (theaterName, movieIds) => {
  try {
    const response = await fetch('/api/theaters/add-showtimes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theaterName, movieIds }),
    });
    if (!response.ok) {
      throw new Error(`Failed to add showtimes: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error adding showtimes to theater:', error.message);
    throw error;
  }
};


// ****************add shows to theatres*********************
export const addShows = async (formData) => {
  try {
    const res = await axios.post('http://localhost:4000/api/show/addshow', formData, {
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`,
      },
    });
    if (res.status !== 201) {
      throw new Error(`Failed to add theatre, status: ${res.status}`);
    }
    return res.data;
  } catch (err) {
    console.error('Error adding theatre:', err.response?.data || err.message);
    throw err;
  }
};


// *************get all the shows(Showss in theatres)**************
export const getAllShows = async () => {
  try {
    const res = await axios.get(`http://localhost:4000/api/show/getallshows`);
    if (res.status !== 200) {
      console.log("No Data");
      return;
    }
    const data = await res.data;
    return data;
  } catch (err) {
    console.log("Error: ", err.message);
  }
};



// **************sigin in with google- user*****************
export const googleSignIn = async (token) => {
  try {
    // Make a POST request to the /google-signin endpoint with the email
    const response = await axios.post('http://localhost:4000/api/user/google-signin', { token });

    // Check the response status
    if (response.status === 200) {
      // User exists, return user ID
      return response.data;
    } else {
      // Handle the case where the user is not found
      throw new Error(response.data.message || 'User not found');
    }
  } catch (error) {
    console.error('Error during Google Sign-In:', error.message);
    throw error; // Propagate error for further handling
  }
};



// *************delete the show************************
export const deleteShow = async (showId) => {
  const response = await fetch(`http://localhost:4000/api/show/shows/deleteShow/${showId}`, {
    method: 'DELETE',
  });
   if (!response.ok) {
    throw new Error('Failed to delete the show');
  }
  const data = await response.json();
  return data;
};
