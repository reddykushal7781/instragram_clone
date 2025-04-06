import {
  ALL_USERS_FAIL,
  ALL_USERS_REQUEST,
  ALL_USERS_SUCCESS,
  CLEAR_ERRORS,
  FOLLOW_USER_FAIL,
  FOLLOW_USER_REQUEST,
  FOLLOW_USER_SUCCESS,
  LOAD_USER_FAIL,
  LOAD_USER_REQUEST,
  LOAD_USER_SUCCESS,
  LOGIN_USER_FAIL,
  LOGIN_USER_REQUEST,
  LOGIN_USER_SUCCESS,
  LOGOUT_USER_FAIL,
  LOGOUT_USER_SUCCESS,
  REGISTER_USER_FAIL,
  REGISTER_USER_REQUEST,
  REGISTER_USER_SUCCESS,
  UPDATE_PASSWORD_FAIL,
  UPDATE_PASSWORD_REQUEST,
  UPDATE_PASSWORD_SUCCESS,
  UPDATE_PROFILE_FAIL,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  USER_DETAILS_FAIL,
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
} from "../constants/userConstants";
import axiosInstance from "../utils/axios";

// Login User
export const loginUser = (userId, password) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_USER_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true
    };

    const { data } = await axiosInstance.post(
      "/api/v1/login",
      { userId, password },
      config
    );

    // Store user data and authentication status
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(data.user));
    
    // Store token if it's returned in the response
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    dispatch({
      type: LOGIN_USER_SUCCESS,
      payload: data.user,
    });

    return data.user;
  } catch (error) {
    dispatch({
      type: LOGIN_USER_FAIL,
      payload:
        error.response && error.response.data
          ? error.response.data.message
          : error.message,
    });
    throw error;
  }
};

// Register User
export const registerUser = (userData) => async (dispatch) => {
  try {
    dispatch({ type: REGISTER_USER_REQUEST });

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    const { data } = await axiosInstance.post("/api/v1/signup", userData, config);

    // Don't set authentication status yet, wait for email verification
    dispatch({
      type: REGISTER_USER_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    dispatch({
      type: REGISTER_USER_FAIL,
      payload:
        error.response && error.response.data
          ? error.response.data.message
          : error.message,
    });
    throw error;
  }
};

// Verify Email
export const verifyEmail = (userId, otp) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_USER_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true
    };

    const { data } = await axiosInstance.post(
      "/api/v1/verify-email",
      { userId, otp },
      config
    );

    // Store user data and authentication status after verification
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(data.user));
    
    // Store token if it's returned in the response
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    dispatch({
      type: LOGIN_USER_SUCCESS,
      payload: data.user,
    });

    return data.user;
  } catch (error) {
    dispatch({
      type: LOGIN_USER_FAIL,
      payload:
        error.response && error.response.data
          ? error.response.data.message
          : error.message,
    });
    throw error;
  }
};

// Resend Verification Email
export const resendVerificationEmail = (userId) => async (dispatch) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const { data } = await axiosInstance.post(
      "/api/v1/resend-verification",
      { userId },
      config
    );

    return data;
  } catch (error) {
    throw error;
  }
};

// Load User
export const loadUser = () => async (dispatch) => {
  try {
    dispatch({ type: LOAD_USER_REQUEST });
    
    // Check if user data exists in localStorage
    const userData = localStorage.getItem('user');
    
    if (userData) {
      const user = JSON.parse(userData);
      
      // Dispatch user data to Redux store
      dispatch({ 
        type: LOAD_USER_SUCCESS, 
        payload: user 
      });
      
      // Fetch user details to ensure avatar is synchronized
      dispatch(getUserDetails(user.username));
    } else {
      // If no user data in localStorage, try to fetch from server
      const { data } = await axiosInstance.get('/api/v1/me', {
        withCredentials: true
      });
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Dispatch user data to Redux store
      dispatch({ 
        type: LOAD_USER_SUCCESS, 
        payload: data.user 
      });
      
      // Fetch user details to ensure avatar is synchronized
      dispatch(getUserDetails(data.user.username));
    }
  } catch (error) {
    dispatch({ 
      type: LOAD_USER_FAIL, 
      payload: error.response?.data?.message || 'Error loading user' 
    });
  }
};

// Logout User
export const logoutUser = () => async (dispatch) => {
  try {
    await axiosInstance.get("/api/v1/logout",{ withCredentials: true });
    dispatch({ type: LOGOUT_USER_SUCCESS });
    
    // Clear all authentication data
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("token");

  } catch (error) {
    dispatch({
      type: LOGOUT_USER_FAIL,
      payload:
        error.response && error.response.data
          ? error.response.data.message
          : error.message,
    });
  }
};

// Get User Details
export const getUserDetails = (username) => async (dispatch) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST });
    
    const { data } = await axiosInstance.get(`/api/v1/user/${username}`, {
      withCredentials: true
    });
    
    dispatch({ 
      type: USER_DETAILS_SUCCESS, 
      payload: data.user 
    });
    
    // If this is the current user, update the user state to ensure avatar synchronization
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser && currentUser.username === username) {
      // Update localStorage with the latest user data
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        avatar: data.user.avatar
      }));
      
      // Update the user state in Redux
      dispatch({ 
        type: LOAD_USER_SUCCESS, 
        payload: {
          ...currentUser,
          avatar: data.user.avatar
        }
      });
    }
  } catch (error) {
    dispatch({ 
      type: USER_DETAILS_FAIL, 
      payload: error.response?.data?.message || 'Error fetching user details' 
    });
  }
};

// Get User Details By ID
export const getUserDetailsById = (userId) => async (dispatch) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST });
    const { data } = await axiosInstance.get(`/api/v1/userdetails/${userId}`,{ withCredentials: true });

    dispatch({
      type: USER_DETAILS_SUCCESS,
      payload: data.user,
    });
  } catch (error) {
    dispatch({
      type: USER_DETAILS_FAIL,
      payload:
        error.response && error.response.data
          ? error.response.data.message
          : error.message,
    });
  }
};

// Get Suggested Users
export const getSuggestedUsers = () => async (dispatch) => {
  try {
    dispatch({ type: ALL_USERS_REQUEST });

    const { data } = await axiosInstance.get("/api/v1/users/suggested", { withCredentials: true });

    dispatch({
      type: ALL_USERS_SUCCESS,
      payload: data.users,
    });
  } catch (error) {
    dispatch({
      type: ALL_USERS_FAIL,
      payload:
        error.response && error.response.data
          ? error.response.data.message
          : error.message,
    });
  }
};

// Follow | Unfollow User
export const followUser = (userId) => async (dispatch) => {
  try {
    dispatch({ type: FOLLOW_USER_REQUEST });
    const { data } = await axiosInstance.get(`/api/v1/follow/${userId}`,{withCredentials:true});

    dispatch({
      type: FOLLOW_USER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: FOLLOW_USER_FAIL,
      payload:
        error.response && error.response.data
          ? error.response.data.message
          : error.message,
    });
  }
};

// Update User Profile
export const updateProfile = (formData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_PROFILE_REQUEST });

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        "Accept": "application/json"
      },
      withCredentials: true
    };

    const { data } = await axiosInstance.put(
      "/api/v1/update/profile",
      formData,
      config
    );

    dispatch({
      type: UPDATE_PROFILE_SUCCESS,
      payload: data.success,
    });
  } catch (error) {
    dispatch({
      type: UPDATE_PROFILE_FAIL,
      payload:
        error.response && error.response.data
          ? error.response.data.message
          : error.message,
    });
  }
};

// Update user password
export const updatePassword = (passwords) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_PASSWORD_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const { data } = await axiosInstance.put(
      "/api/v1/update/password",
      passwords,
      config
    );

    dispatch({
      type: UPDATE_PASSWORD_SUCCESS,
      payload: data.success,
    });
  } catch (error) {
    dispatch({
      type: UPDATE_PASSWORD_FAIL,
      payload:
        error.response && error.response.data
          ? error.response.data.message
          : error.message,
    });
  }
};

// clear all errors
export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};
