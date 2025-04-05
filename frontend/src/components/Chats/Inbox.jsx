import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  clearErrors,
  getAllMessages,
  sendMessage,
} from '../../actions/messageAction';
import { getUserDetailsById } from '../../actions/userAction';
import {
  ALL_MESSAGES_ADD,
  NEW_MESSAGE_RESET,
} from '../../constants/messageConstants';
import { SOCKET_ENDPOINT } from '../../utils/constants';
import config from '../../utils/config'; // Import the config
import Sidebar from './Sidebar';
import { io } from 'socket.io-client';
import Message from './Message';
import { Picker } from 'emoji-mart';
import SearchModal from './SearchModal';
import SpinLoader from '../Layouts/SpinLoader';
import MetaData from '../Layouts/MetaData';
import { USER_DETAILS_RESET } from '../../constants/userConstants';

const Inbox = () => {
  const dispatch = useDispatch();
  const params = useParams();

  const [message, setMessage] = useState('');
  const scrollRef = useRef(null);
  const socket = useRef(null);
  const socketInitialized = useRef(false);
  const messageQueue = useRef([]); // Queue for messages waiting to be sent
  const pendingMessages = useRef(new Map()); // Map to track pending messages
  const reconnectInterval = useRef(null);

  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [isOnline, setIsOnline] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const { user: loggedInUser } = useSelector((state) => state.user);
  const { user: friend } = useSelector((state) => state.userDetails);
  const { error, messages, loading } = useSelector(
    (state) => state.allMessages,
  );
  const { success, newMessage } = useSelector((state) => state.newMessage);

  const userId = params.userId;

  // Initialize socket connection
  useEffect(() => {
    if (!socket.current) {
      console.log('Initializing socket connection to:', SOCKET_ENDPOINT);

      // Use config for socket options
      socket.current = io(SOCKET_ENDPOINT, config.SOCKET_OPTIONS);

      socket.current.on('connect', () => {
        console.log('Socket connected successfully!', socket.current.id);
        console.log('Transport used:', socket.current.io.engine.transport.name);
        socketInitialized.current = true;
        setConnectionStatus('connected');

        // Register user after successful connection
        if (loggedInUser && loggedInUser._id) {
          console.log('Registering user:', loggedInUser._id);
          socket.current.emit('addUser', loggedInUser._id);
        }

        // Send any queued messages
        while (messageQueue.current.length > 0) {
          const queuedMessage = messageQueue.current.shift();
          sendMessageViaSocket(queuedMessage);
        }

        // Clear reconnect interval if it exists
        if (reconnectInterval.current) {
          clearInterval(reconnectInterval.current);
          reconnectInterval.current = null;
        }
      });

      socket.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnectionStatus('error');
        setReconnectAttempts((prev) => prev + 1);
      });

      socket.current.on('disconnect', () => {
        console.log('Socket disconnected');
        socketInitialized.current = false;
        setConnectionStatus('disconnected');

        // Set up reconnect interval
        if (!reconnectInterval.current) {
          reconnectInterval.current = setInterval(() => {
            console.log('Attempting to reconnect...');
            if (socket.current) {
              socket.current.connect();
            }
          }, 5000);
        }
      });
    }

    return () => {
      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current);
        reconnectInterval.current = null;
      }

      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
        socketInitialized.current = false;
      }
    };
  }, [reconnectAttempts]);

  // Register user ID when user changes
  useEffect(() => {
    if (
      socket.current &&
      socketInitialized.current &&
      loggedInUser &&
      loggedInUser._id
    ) {
      console.log('Registering user after change:', loggedInUser._id);
      socket.current.emit('addUser', loggedInUser._id);
    }
  }, [loggedInUser]);

  // Set up message and typing event handlers
  useEffect(() => {
    if (!socket.current || !socketInitialized.current || !userId) return;

    const handleNewMessage = (data) => {
      console.log('Received message from other user:', data);
      // Only process messages from the user we're chatting with
      if (data.senderId === userId) {
        // Create a properly formatted message object that matches Redux structure
        const newMsg = {
          _id: data.messageId || Date.now() + Math.random().toString(), // Generate unique ID if none exists
          sender: data.senderId,
          content: data.content,
          createdAt: data.timestamp || Date.now(),
        };

        console.log('Adding received message to Redux:', newMsg);

        // Force a setTimeout to ensure the dispatch happens in a separate JS event cycle
        setTimeout(() => {
          dispatch({
            type: ALL_MESSAGES_ADD,
            payload: newMsg,
          });

          // Force scroll after a delay to ensure render completes
          setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }, 10);
      }
    };

    // Log all messages for debugging
    const logMessages = () => {
      console.log('Current messages in Redux:', messages);
    };
    const intervalId = setInterval(logMessages, 5000);

    const handleMessageDelivered = (data) => {
      console.log('Message delivered confirmation:', data);
      if (pendingMessages.current.has(data.messageId)) {
        pendingMessages.current.delete(data.messageId);
      }
    };

    const handleMessageDeliveryError = (data) => {
      console.log('Message delivery error:', data);
      toast.error('Message could not be delivered. Recipient is offline.');

      // Remove from pending messages
      if (data.messageId && pendingMessages.current.has(data.messageId)) {
        pendingMessages.current.delete(data.messageId);
      }
    };

    const handleTypingStart = (senderId) => {
      console.log('User is typing:', senderId);
      if (senderId === userId) {
        setIsTyping(true);
      }
    };

    const handleTypingStop = (senderId) => {
      console.log('User stopped typing:', senderId);
      if (senderId === userId) {
        setIsTyping(false);
      }
    };

    // Clear previous listeners to avoid duplicates
    socket.current.off('getMessage');
    socket.current.off('messageDelivered');
    socket.current.off('messageDeliveryError');
    socket.current.off('typing');
    socket.current.off('typing stop');

    // Set up new listeners
    socket.current.on('getMessage', handleNewMessage);
    socket.current.on('messageDelivered', handleMessageDelivered);
    socket.current.on('messageDeliveryError', handleMessageDeliveryError);
    socket.current.on('typing', handleTypingStart);
    socket.current.on('typing stop', handleTypingStop);

    return () => {
      clearInterval(intervalId);
      if (socket.current) {
        socket.current.off('getMessage', handleNewMessage);
        socket.current.off('messageDelivered', handleMessageDelivered);
        socket.current.off('messageDeliveryError', handleMessageDeliveryError);
        socket.current.off('typing', handleTypingStart);
        socket.current.off('typing stop', handleTypingStop);
      }
    };
  }, [userId, dispatch, messages]);

  // Monitor user's online status
  useEffect(() => {
    if (!socket.current || !socketInitialized.current) return;

    const handleUserStatus = (users) => {
      console.log('Online users:', users);
      const isUserOnline = users.some((u) => u.userId === userId);
      setIsOnline(isUserOnline);
      console.log(`User ${userId} online status:`, isUserOnline);
    };

    socket.current.on('getUsers', handleUserStatus);

    return () => {
      if (socket.current) {
        socket.current.off('getUsers', handleUserStatus);
      }
    };
  }, [userId]);

  // Fetch messages and user details
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (params.chatId && userId) {
      dispatch(getAllMessages(params.chatId));
      dispatch(getUserDetailsById(userId));
    }

    return () => {
      dispatch({ type: USER_DETAILS_RESET });
    };
  }, [dispatch, error, params.chatId, userId]);

  // Handle successful message sending
  useEffect(() => {
    if (success) {
      dispatch({
        type: ALL_MESSAGES_ADD,
        payload: newMessage,
      });
      dispatch({ type: NEW_MESSAGE_RESET });

      // Force scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [dispatch, success, newMessage]);

  // Ensure scroll to bottom when messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  // Function to send message via socket
  const sendMessageViaSocket = (content) => {
    if (!socket.current || !socketInitialized.current) {
      console.log('Socket not ready, queueing message:', content);
      messageQueue.current.push(content);
      return false;
    }

    const messageId = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    pendingMessages.current.set(messageId, {
      content,
      timestamp: Date.now(),
    });

    const messageData = {
      senderId: loggedInUser._id,
      receiverId: userId,
      content,
      messageId,
    };

    console.log('Sending message via socket:', messageData);
    socket.current.emit('sendMessage', messageData);
    return messageId;
  };

  const handleSubmit = (e, msg = message) => {
    e.preventDefault();

    if (!msg.trim()) return;

    console.log('Sending message:', msg);

    // Try to send via socket first
    const messageId = sendMessageViaSocket(msg);

    if (!messageId) {
      toast.warning('You\'re offline. Message will be sent when you reconnect.');
    }

    // Also save to database
    const msgData = {
      chatId: params.chatId,
      content: msg,
    };
    dispatch(sendMessage(msgData));

    setMessage('');

    // Reset typing state
    if (socket.current && socketInitialized.current) {
      socket.current.emit('typing stop', {
        senderId: loggedInUser._id,
        receiverId: userId,
      });
    }
    setTyping(false);

    // Force scroll after a delay to ensure render completes
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!socket.current || !socketInitialized.current) return;

    if (!typing && e.target.value.trim()) {
      setTyping(true);
      socket.current.emit('typing', {
        senderId: loggedInUser._id,
        receiverId: userId,
      });

      // Use a debounce approach for typing
      if (window.typingTimeout) {
        clearTimeout(window.typingTimeout);
      }

      window.typingTimeout = setTimeout(() => {
        if (socket.current && socketInitialized.current) {
          socket.current.emit('typing stop', {
            senderId: loggedInUser._id,
            receiverId: userId,
          });
        }
        setTyping(false);
      }, 2000);
    }

    // Stop typing indicator if input is empty
    if (!e.target.value.trim()) {
      if (socket.current && socketInitialized.current) {
        socket.current.emit('typing stop', {
          senderId: loggedInUser._id,
          receiverId: userId,
        });
      }
      setTyping(false);
      if (window.typingTimeout) {
        clearTimeout(window.typingTimeout);
      }
    }
  };

  const handleModalClose = () => {
    setShowSearch(false);
  };

  const openModal = () => {
    setShowSearch(true);
  };

  return (
    <>
      <MetaData title="Instagram • Chats" />

      <div className=" pb-4 rounded h-[100vh] xl:w-2/3 mx-auto sm:pr-14 sm:pl-8">
        <div className="flex border h-full rounded w-full bg-white">
          {/* sidebar */}
          <Sidebar openModal={openModal} />

          {!userId ? (
            <div className="flex flex-col items-center justify-center w-full sm:w-4/6 gap-2">
              <div className="w-24 h-24 flex items-center p-2 justify-center border-2 border-black rounded-full">
                <img
                  draggable="false"
                  loading="lazy"
                  className="w-full h-full rotate-12 object-contain"
                  src="https://static.thenounproject.com/png/172101-200.png"
                  alt="message"
                />
              </div>
              <h2 className="text-2xl font-thin">Your Messages</h2>
              <p className="text-gray-400 text-sm">
                Send private photos and messages to a friend or group.
              </p>
              <button
                onClick={openModal}
                className="bg-blue-600 rounded px-2.5 mt-2 py-1.5 text-white text-sm font-medium hover:drop-shadow-lg"
              >
                Send Message
              </button>
            </div>
          ) : (
            <div className="flex flex-col justify-between w-full sm:w-4/6">
              {/* header */}
              <div className="flex py-3 px-6 border-b items-center justify-between">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 relative">
                    <img
                      draggable="false"
                      loading="lazy"
                      className="w-full h-full rounded-full object-cover"
                      src={friend.avatar}
                      alt="avatar"
                    />
                    {isOnline && (
                      <div className="absolute -right-0.5 -bottom-0.5 h-3 w-3 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <Link to={`/${friend.username}`} className="font-medium cursor-pointer">
                      {friend.name}
                    </Link>
                    {connectionStatus === 'connected' ? (
                      <span className="text-xs text-green-600">Connected</span>
                    ) : connectionStatus === 'disconnected' ? (
                      <span className="text-xs text-gray-500">
                        Reconnecting...
                      </span>
                    ) : (
                      <span className="text-xs text-red-500">
                        Connection error
                      </span>
                    )}
                  </div>
                </div>
                <svg
                  className="cursor-pointer"
                  aria-label="View Thread Details"
                  color="#262626"
                  fill="#262626"
                  height="24"
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <circle
                    cx="12.001"
                    cy="12.005"
                    fill="none"
                    r="10.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></circle>
                  <circle cx="11.819" cy="7.709" r="1.25"></circle>
                  <line
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    x1="10.569"
                    x2="13.432"
                    y1="16.777"
                    y2="16.777"
                  ></line>
                  <polyline
                    fill="none"
                    points="10.569 11.05 12 11.05 12 16.777"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></polyline>
                </svg>
              </div>

              {/* messages */}
              <div className="w-full flex-1 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden p-4">
                {loading ? (
                  <SpinLoader />
                ) : (
                  messages.map((m, i) => (
                    <React.Fragment key={m._id || i}>
                      <Message
                        ownMsg={m.sender === loggedInUser._id}
                        {...friend}
                        {...m}
                      />
                      {i === messages.length - 1 && <div ref={scrollRef}></div>}
                    </React.Fragment>
                  ))
                )}
                {isTyping && (
                  <>
                    <div className="flex items-center gap-3 max-w-xs">
                      <img
                        draggable="false"
                        loading="lazy"
                        className="w-7 h-7 rounded-full object-cover"
                        src={friend.avatar}
                        alt="avatar"
                      />
                      <span className="text-sm text-gray-500">typing...</span>
                    </div>
                    <div ref={scrollRef}></div>
                  </>
                )}
              </div>

              {/* message input */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-3 justify-between border rounded-full py-2.5 px-4 m-5 relative"
              >
                <span
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="cursor-pointer hover:opacity-60"
                >
                  <svg
                    aria-label="Emoji"
                    color="#262626"
                    fill="#262626"
                    height="24"
                    role="img"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M15.83 10.997a1.167 1.167 0 101.167 1.167 1.167 1.167 0 00-1.167-1.167zm-6.5 1.167a1.167 1.167 0 10-1.166 1.167 1.167 1.167 0 001.166-1.167zm5.163 3.24a3.406 3.406 0 01-4.982.007 1 1 0 10-1.557 1.256 5.397 5.397 0 008.09 0 1 1 0 00-1.55-1.263zM12 .503a11.5 11.5 0 1011.5 11.5A11.513 11.513 0 0012 .503zm0 21a9.5 9.5 0 119.5-9.5 9.51 9.51 0 01-9.5 9.5z"></path>
                  </svg>
                </span>

                {showEmojis && (
                  <div className="absolute bottom-14 -left-10">
                    <Picker
                      set="google"
                      onSelect={(e) => setMessage(message + e.native)}
                      title="Emojis"
                    />
                  </div>
                )}

                <input
                  className="flex-1 outline-none text-sm"
                  type="text"
                  placeholder={isOnline ? 'Message...' : 'User is offline...'}
                  value={message}
                  onFocus={() => setShowEmojis(false)}
                  onChange={handleTyping}
                  disabled={connectionStatus !== 'connected'}
                  required
                />
                {message.trim().length > 0 ? (
                  <button
                    className={`font-medium text-sm ${
                      connectionStatus === 'connected'
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                    disabled={connectionStatus !== 'connected'}
                  >
                    Send
                  </button>
                ) : (
                  <>
                    <svg
                      className="cursor-pointer"
                      aria-label="Add Photo or Video"
                      color="#262626"
                      fill="#262626"
                      height="24"
                      role="img"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path
                        d="M6.549 5.013A1.557 1.557 0 108.106 6.57a1.557 1.557 0 00-1.557-1.557z"
                        fillRule="evenodd"
                      ></path>
                      <path
                        d="M2 18.605l3.901-3.9a.908.908 0 011.284 0l2.807 2.806a.908.908 0 001.283 0l5.534-5.534a.908.908 0 011.283 0l3.905 3.905"
                        fill="none"
                        stroke="currentColor"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                      <path
                        d="M18.44 2.004A3.56 3.56 0 0122 5.564h0v12.873a3.56 3.56 0 01-3.56 3.56H5.568a3.56 3.56 0 01-3.56-3.56V5.563a3.56 3.56 0 013.56-3.56z"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                    <svg
                      onClick={(e) => handleSubmit(e, '❤️')}
                      className={`cursor-pointer ${
                        connectionStatus === 'connected'
                          ? 'hover:opacity-70'
                          : 'opacity-50'
                      }`}
                      aria-label="Like"
                      color="#262626"
                      fill="#262626"
                      height="24"
                      role="img"
                      viewBox="0 0 24 24"
                      width="24"
                      disabled={connectionStatus !== 'connected'}
                    >
                      <path d="M16.792 3.904A4.989 4.989 0 0121.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 014.708-5.218 4.21 4.21 0 013.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 013.679-1.938m0-2a6.04 6.04 0 00-4.797 2.127 6.052 6.052 0 00-4.787-2.127A6.985 6.985 0 00.5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 003.518 3.018 2 2 0 002.174 0 45.263 45.263 0 003.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 00-6.708-7.218z"></path>
                    </svg>
                  </>
                )}
              </form>
            </div>
          )}
        </div>

        <SearchModal open={showSearch} onClose={handleModalClose} />
      </div>
    </>
  );
};

export default Inbox;
