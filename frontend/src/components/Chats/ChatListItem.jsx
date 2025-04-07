import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { USER_DETAILS_RESET } from '../../constants/userConstants';

const ChatListItem = ({ _id, users = [], latestMessage, socket, onClick, isActive }) => {
  const dispatch = useDispatch();
  const params = useParams();
  const [friend, setFriend] = useState({});
  const [isOnline, setIsOnline] = useState(false);

  const { user } = useSelector((state) => state.user);

  // Safely find friend details
  useEffect(() => {
    if (!users || !Array.isArray(users) || !user) return;

    // Find the friend (user that is not the current user)
    const friendDetails = users.find((u) => u && user && u._id !== user._id);
    if (friendDetails) {
      setFriend(friendDetails);
    }
  }, [users, user]);

  // Monitor online status using the parent socket
  useEffect(() => {
    if (!socket || !friend || !friend._id) return;

    const handleUserStatus = (users) => {
      if (friend && friend._id) {
        const isUserOnline = users.some((u) => u.userId === friend._id);
        setIsOnline(isUserOnline);
      }
    };

    socket.on('getUsers', handleUserStatus);

    return () => {
      socket.off('getUsers', handleUserStatus);
    };
  }, [socket, friend]);

  const handleClick = () => {
    // Reset user details before switching chats
    dispatch({ type: USER_DETAILS_RESET });
    onClick(_id, friend._id);
  };

  if (!friend || !friend._id) {
    return null; // Don't render if friend data isn't available yet
  }

  return (
    <div
      onClick={handleClick}
      className={`${
        isActive ? 'bg-gray-100' : ''
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
    </div>
  );
};

export default ChatListItem;