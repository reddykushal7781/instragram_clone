import {
  ALL_MESSAGES_ADD,
  ALL_MESSAGES_FAIL,
  ALL_MESSAGES_REQUEST,
  ALL_MESSAGES_SUCCESS,
  CLEAR_ERRORS,
  NEW_MESSAGE_FAIL,
  NEW_MESSAGE_REQUEST,
  NEW_MESSAGE_RESET,
  NEW_MESSAGE_SUCCESS,
} from '../constants/messageConstants';

export const allMessagesReducer = (state = { messages: [] }, action) => {
  switch (action.type) {
  case ALL_MESSAGES_REQUEST:
    return {
      loading: true,
      messages: [],
    };
  case ALL_MESSAGES_SUCCESS:
    return {
      loading: false,
      messages: action.payload,
    };
  case ALL_MESSAGES_ADD: {
    // Basic duplicate prevention
    const isDuplicate = state.messages.some(
      (msg) =>
        msg._id === action.payload._id ||
          (msg.content === action.payload.content &&
            msg.sender === action.payload.sender &&
            Math.abs(
              new Date(msg.createdAt) - new Date(action.payload.createdAt),
            ) < 1000),
    );

    if (isDuplicate) {
      return state;
    }

    // Create completely new state object with new messages array to ensure React detects the change
    return {
      ...state,
      messages: [...state.messages, action.payload],
    };
  }
  case ALL_MESSAGES_FAIL:
    return {
      loading: false,
      error: action.payload,
    };
  case CLEAR_ERRORS:
    return {
      ...state,
      error: null,
    };
  default:
    return state;
  }
};

export const newMessageReducer = (state = {}, action) => {
  switch (action.type) {
  case NEW_MESSAGE_REQUEST:
    return {
      loading: true,
    };
  case NEW_MESSAGE_SUCCESS:
    return {
      loading: false,
      success: true,
      newMessage: action.payload,
    };
  case NEW_MESSAGE_FAIL:
    return {
      loading: false,
      error: action.payload,
    };
  case NEW_MESSAGE_RESET:
    return {
      loading: false,
      success: false,
      newMessage: null,
    };
  case CLEAR_ERRORS:
    return {
      ...state,
      error: null,
    };
  default:
    return state;
  }
};
