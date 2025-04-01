import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { SOCKET_ENDPOINT } from '../../utils/constants';
import config from '../../utils/config'; // Import the config
import { io } from 'socket.io-client';

const ChatListItem = ({ _id, users = [], latestMessage }) => {
  const dispatch = useDispatch();
  const params = useParams();
  const [friend, setFriend] = useState({});

  const socket = useRef(null);
  const [isOnline, setIsOnline] = useState(false);
  const [socketInitialized, setSocketInitialized] = useState(false);

  const { user } = useSelector((state) => state.user);

  // Safely find friend details
  useEffect(() => {
    if (!users || !Array.isArray(users) || !user) return;

    const friendDetails = users.find((u) => u && user && u._id !== user._id);
    if (friendDetails) {
      setFriend(friendDetails);
    }
  }, [users, user]);

  // Initialize socket only once
  useEffect(() => {
    if (!socket.current) {
      console.log('ChatListItem connecting to socket:', SOCKET_ENDPOINT);
      socket.current = io(SOCKET_ENDPOINT, config.SOCKET_OPTIONS);

      socket.current.on('connect', () => {
        console.log('ChatListItem socket connected');
        setSocketInitialized(true);
      });
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, []);

  // Monitor online status
  useEffect(() => {
    if (!socket.current || !friend || !friend._id) return;

    const handleUserStatus = (users) => {
      if (friend && friend._id) {
        const isUserOnline = users.some((u) => u.userId === friend._id);
        setIsOnline(isUserOnline);
      }
    };

    socket.current.on('getUsers', handleUserStatus);

    return () => {
      if (socket.current) {
        socket.current.off('getUsers', handleUserStatus);
      }
    };
  }, [friend]);

  if (!friend || !friend._id) {
    return null; // Don't render if friend data isn't available yet
  }

  return (
    <Link
      to={`/direct/t/${_id}/${friend._id}`}
      className={`${
        params.chatId === _id && 'bg-gray-100'
      } flex gap-3 items-center py-2 px-4 cursor-pointer hover:bg-gray-100`}
    >
      <div className="w-14 h-14 relative">
        <img
          draggable="false"
          className="w-full h-full rounded-full object-cover"
          src={friend.avatar || 'https://via.placeholder.com/150'}
          alt="avatar"
        />
        {isOnline && (
          <div className="absolute right-0 bottom-0.5 h-3 w-3 bg-green-500 rounded-full"></div>
        )}
      </div>
      <div className="flex flex-col items-start">
        <span className="text-sm">{friend.name || 'User'}</span>
        <span className="text-sm truncate w-36 text-gray-400">
          {latestMessage?.content || ''}
        </span>
      </div>
    </Link>
  );
};

export default ChatListItem;
