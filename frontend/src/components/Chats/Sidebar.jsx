import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { clearErrors, getAllChats } from '../../actions/chatAction';
import ChatListItem from './ChatListItem';
import SkeletonUserItem from '../Layouts/SkeletonUserItem';
import { Skeleton } from '@mui/material';
import { USER_DETAILS_RESET } from '../../constants/userConstants';

const Sidebar = ({ openModal, socket }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const { user } = useSelector((state) => state.user);
  const { loading, error, chats } = useSelector((state) => state.allChats);
  const { success: newChatSuccess, chat: newChat } = useSelector((state) => state.newChat);

  // Fetch chats on mount and when chatId changes
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    dispatch(getAllChats());
    console.log("worker 1")
  }, [dispatch, error, params.chatId]);

  // Handle new chat creation
  useEffect(() => {
    if (newChatSuccess && newChat  && Array.isArray(newChat.users)) {
      const myId = user?._id;
      const friendId = newChat.users.find(u => String(u) !== String(myId));
      if (!friendId) return;
  
      // First navigate
      navigate(`/direct/t/${newChat._id}/${friendId}`);
  
      // VERY IMPORTANT: Reset the newChat state after usage
    dispatch({ type: 'NEW_CHAT_RESET' });
    }
  }, [newChatSuccess,newChat,dispatch,navigate,user._id]);

  const handleChatClick = (chatId, friendId) => {
    dispatch({ type: USER_DETAILS_RESET });
    console.log("i am also showing",chatId, friendId)
    navigate(`/direct/t/${chatId}/${friendId}`);
  };

  return (
    <>
      <div className="hidden sm:flex flex-col h-full w-2/6 border-r">
        <div className="flex items-center justify-between border-b p-4">
          <span className="mx-auto font-medium cursor-pointer">
            {user?.username || 'User'}
          </span>
          <svg
            onClick={openModal}
            className="cursor-pointer"
            aria-label="New Message"
            color="#262626"
            fill="#262626"
            height="24"
            role="img"
            viewBox="0 0 24 24"
            width="24"
          >
            <path
              d="M12.202 3.203H5.25a3 3 0 00-3 3V18.75a3 3 0 003 3h12.547a3 3 0 003-3v-6.952"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            ></path>
            <path
              d="M10.002 17.226H6.774v-3.228L18.607 2.165a1.417 1.417 0 012.004 0l1.224 1.225a1.417 1.417 0 010 2.004z"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            ></path>
            <line
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              x1="16.848"
              x2="20.076"
              y1="3.924"
              y2="7.153"
            ></line>
          </svg>
        </div>

        <div className="flex flex-col overflow-y-auto overflow-x-hidden">
          <span className="px-4 py-2 font-medium">Messages</span>

          {loading &&
            Array(5)
              .fill('')
              .map((el, i) => (
                <div className="flex items-center gap-2 py-2 px-4" key={i}>
                  <Skeleton
                    animation="wave"
                    variant="circular"
                    width={65}
                    height={50}
                  />
                  <div className="flex flex-col gap-0 w-full">
                    <Skeleton height={23} width="85%" animation="wave" />
                    <Skeleton height={23} width="60%" animation="wave" />
                  </div>
                </div>
              ))}

          {!loading && chats?.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40">
              <span className="text-gray-400 text-sm">No chats found</span>
              <button
                onClick={openModal}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                Send Message
              </button>
            </div>
          )}

          {!loading &&
            chats?.map((chat) => {
              const friend = chat.users.find((u) => u._id !== user._id);
              if (!friend?._id) return null;
              return (
                <ChatListItem
                  key={chat._id}
                  _id={chat._id}
                  users={chat.users}
                  latestMessage={chat.latestMessage}
                  socket={socket}
                  onClick={() => handleChatClick(chat._id, friend._id)}
                  isActive={params.chatId === chat._id}
                />
              );
            })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;