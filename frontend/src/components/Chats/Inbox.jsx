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
  const reconnectInterval = useRef(null); //

  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [isOnline, setIsOnline] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const { user: loggedInUser } = useSelector((state) => state.user);
  const { user: friend, loading: friendLoading } = useSelector((state) => state.userDetails);
  const { error, messages, loading } = useSelector(
    (state) => state.allMessages,
  );
  const { success, newMessage } = useSelector((state) => state.newMessage);

  const userId = params.userId;
  const [currentFriend, setCurrentFriend] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    if (!loggedInUser?._id) return; // Don't initialize if no user

    if (!socket.current) {
      console.log('Initializing socket connection');
      socket.current = io(SOCKET_ENDPOINT, config.SOCKET_OPTIONS);

      socket.current.on('connect', () => {
        console.log('Socket connected successfully');
        socketInitialized.current = true;
        setConnectionStatus('connected');
        setReconnectAttempts(0);

        // Register the current user
        console.log('Registering user:', loggedInUser._id);
        socket.current.emit('addUser', loggedInUser._id);
      });

      socket.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnectionStatus('error');
        socketInitialized.current = false;
      });

      socket.current.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnectionStatus('disconnected');
        socketInitialized.current = false;
      });
    }

    return () => {
      // Don't disconnect socket on component unmount
      // Only clean up other resources
      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current);
        reconnectInterval.current = null;
      }
    };
  }, [loggedInUser?._id]); // Only reinitialize when user changes

  // Cleanup socket on complete unmount
  useEffect(() => {
    return () => {
      if (socket.current) {
        console.log('Cleaning up socket connection');
        socket.current.disconnect();
        socket.current = null;
        socketInitialized.current = false;
      }
    };
  }, []);

  // Reset states when changing chats
  useEffect(() => {
    // Reset states when changing chats
    setIsTyping(false);
    setTyping(false);
    setShowEmojis(false);
    setMessage('');
    setCurrentFriend(null);
    
    // Clear any pending timeouts
    if (window.typingTimeout) {
      clearTimeout(window.typingTimeout);
    }

    // Reset user details only if we're changing to a different user
    if (params.chatId) {
      dispatch({ type: USER_DETAILS_RESET });
    }

    // Fetch new chat data
    if (params.chatId && userId && userId !== loggedInUser?._id) {
      dispatch(getAllMessages(params.chatId));
      dispatch(getUserDetailsById(userId));
    }
  }, [params.chatId, userId, dispatch, loggedInUser]);

  // Set up message and typing event handlers
  useEffect(() => {
    if (!socket.current || !socketInitialized.current) return;

    const handleNewMessage = (data) => {
      // Only process messages for the current chat
      if (data.senderId === userId && params.chatId) {
        const newMsg = {
          _id: data.messageId || Date.now() + Math.random().toString(),
          sender: data.senderId,
          content: data.content,
          createdAt: data.timestamp || Date.now(),
        };

        dispatch({
          type: ALL_MESSAGES_ADD,
          payload: newMsg,
        });

        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    };

    const handleTyping = (data) => {
      if (data.senderId === userId) {
        setIsTyping(true);
      }
    };

    const handleTypingStop = (data) => {
      if (data.senderId === userId) {
        setIsTyping(false);
      }
    };

    // Set up event listeners
    socket.current.on('getMessage', handleNewMessage);
    socket.current.on('typing', handleTyping);
    socket.current.on('typing stop', handleTypingStop);

    return () => {
      // Remove event listeners when changing chats
      socket.current.off('getMessage', handleNewMessage);
      socket.current.off('typing', handleTyping);
      socket.current.off('typing stop', handleTypingStop);
    };
  }, [userId, params.chatId, dispatch]);

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
      <MetaData title="Instagram • Chat" />
      <div className="pb-4 rounded h-[100vh] xl:w-2/3 mx-auto sm:pr-14 sm:pl-8 border">
        <div className="flex h-screen">
          <Sidebar openModal={openModal} socket={socket.current} />
          {!params.chatId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-light">Your Messages</h1>
                <p className="text-gray-500">
                  Send private photos and messages to a friend or group
                </p>
                <button
                  onClick={openModal}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Send Message
                </button>
              </div>
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
                      src={currentFriend?.avatar || 'https://via.placeholder.com/150'}
                      alt="avatar"
                    />
                    {isOnline && (
                      <div className="absolute -right-0.5 -bottom-0.5 h-3 w-3 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <Link 
                      to={`/${currentFriend?.username}`} 
                      className="font-medium cursor-pointer"
                    >
                      {friendLoading ? 'Loading...' : currentFriend?.name || 'User'}
                    </Link>
                    {connectionStatus === 'connected' ? (
                      <span className="text-xs text-green-600">Connected</span>
                    ) : connectionStatus === 'disconnected' ? (
                      <span className="text-xs text-gray-500">Reconnecting...</span>
                    ) : (
                      <span className="text-xs text-red-500">Connection error</span>
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
                  <circle cx="12" cy="16" r="1"></circle>
                  <path d="M12 17.5v-5"></path>
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
                        avatar={currentFriend?.avatar || 'https://via.placeholder.com/150'}
                        content={m.content}
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
                        src={currentFriend?.avatar || 'https://via.placeholder.com/150'}
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
                <button
                  type="button"
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="text-gray-500"
                >
                  😊
                </button>
                <input
                  type="text"
                  placeholder="Message..."
                  value={message}
                  onChange={handleTyping}
                  className="outline-none w-full"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className={`${
                    message.trim() ? "text-blue-500" : "text-blue-300"
                  } font-medium`}
                >
                  Send
                </button>
                {showEmojis && (
                  <div className="absolute bottom-16 right-0">
                    <Picker
                      onSelect={(emoji) => {
                        setMessage((prev) => prev + emoji.native);
                        setShowEmojis(false);
                      }}
                    />
                  </div>
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
