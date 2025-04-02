import axiosInstance from '../utils/axios';
import { ALL_CHATS_FAIL, ALL_CHATS_REQUEST, ALL_CHATS_SUCCESS, CLEAR_ERRORS, NEW_CHAT_FAIL, NEW_CHAT_REQUEST, NEW_CHAT_SUCCESS, SEND_MESSAGE_FAIL, SEND_MESSAGE_REQUEST, SEND_MESSAGE_SUCCESS, ADD_MESSAGE_TO_CHAT } from '../constants/chatConstants';

// Get All Chats
export const getAllChats = () => async (dispatch) => {
  try {
    dispatch({ type: ALL_CHATS_REQUEST });

    const { data } = await axiosInstance.get('/api/v1/chats');

    dispatch({
      type: ALL_CHATS_SUCCESS,
      payload: data.chats,
    });
  } catch (error) {
    dispatch({
      type: ALL_CHATS_FAIL,
      payload: error.response?.data?.message || 'Error fetching chats',
    });
  }
};

// New Chat
export const addNewChat = (userId) => async (dispatch) => {
  try {
    dispatch({ type: NEW_CHAT_REQUEST });
    const config = { headers: { 'Content-Type': 'application/json' } };
    const { data } = await axiosInstance.post('/api/v1/newChat', { receiverId: userId }, config);

    dispatch({
      type: NEW_CHAT_SUCCESS,
      payload: data,
    });
  } catch (error) {
    console.error('New chat error:', error);
    dispatch({
      type: NEW_CHAT_FAIL,
      payload: error.response?.data?.message || 'Error creating new chat',
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
    const config = { headers: { 'Content-Type': 'application/json' } };
    const { data } = await axiosInstance.post('/api/v1/message', messageData, config);

    dispatch({
      type: SEND_MESSAGE_SUCCESS,
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: SEND_MESSAGE_FAIL,
      payload: error.response?.data?.message || 'Error sending message',
    });
  }
};

// Add Message to Chat
export const addMessageToChat = (message) => (dispatch) => {
  dispatch({
    type: ADD_MESSAGE_TO_CHAT,
    payload: message,
  });
};
