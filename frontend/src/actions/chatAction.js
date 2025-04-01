import axios from 'axios';
import { ALL_CHATS_FAIL, ALL_CHATS_REQUEST, ALL_CHATS_SUCCESS, CLEAR_ERRORS, NEW_CHAT_FAIL, NEW_CHAT_REQUEST, NEW_CHAT_SUCCESS, SEND_MESSAGE_FAIL, SEND_MESSAGE_REQUEST, SEND_MESSAGE_SUCCESS, ADD_MESSAGE_TO_CHAT } from '../constants/chatConstants';

// Get All Chats
export const getAllChats = () => async (dispatch) => {
  try {
    dispatch({ type: ALL_CHATS_REQUEST });

    const { data } = await axios.get('/api/v1/chats');

    dispatch({
      type: ALL_CHATS_SUCCESS,
      payload: data.chats,
    });
  } catch (error) {
    dispatch({
      type: ALL_CHATS_FAIL,
      payload: error.response.data.message,
    });
  }
};

// New Chat
export const addNewChat = (userId) => async (dispatch) => {
  try {
    dispatch({ type: NEW_CHAT_REQUEST });
    const config = { header: { 'Content-Type': 'application/json' } };
    const { data } = await axios.post('/api/v1/newChat', { receiverId: userId }, config);

    dispatch({
      type: NEW_CHAT_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: NEW_CHAT_FAIL,
      payload: error.response.data.message,
    });
  }
};

// Clear All Errors
export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};

// Send Message
export const sendMessage = (messageData) => async (dispatch) => {
  try {
    dispatch({ type: SEND_MESSAGE_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true
    };

    const { data } = await axios.post(
      "/api/v1/message",
      messageData,
      config
    );

    // Only dispatch success, don't add message to state here
    // The message will be added through the socket event
    dispatch({
      type: SEND_MESSAGE_SUCCESS,
      payload: data.success,
    });

    return data.success;
  } catch (error) {
    dispatch({
      type: SEND_MESSAGE_FAIL,
      payload:
        error.response && error.response.data
          ? error.response.data.message
          : error.message,
    });
    throw error;
  }
};

// Add Message to Chat
export const addMessageToChat = (message) => (dispatch) => {
  dispatch({
    type: ADD_MESSAGE_TO_CHAT,
    payload: message,
  });
};
