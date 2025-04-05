import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { profileIcon, savedIcon, settingsIcon, switchAccountIcon } from './SvgIcons';
import { logoutUser } from '../../actions/userAction';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ClickAwayListener } from '@mui/material';

const ProfileDetails = ({ setProfileToggle, position = { top: 0, left: 0 } }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const tabs = [
    { title: 'Profile', icon: profileIcon, redirect: `/${user?.username || ''}` },
    { title: 'Saved', icon: savedIcon, redirect: `/${user?.username || ''}` },
    { title: 'Settings', icon: settingsIcon, redirect: '/accounts/edit' },
    { title: 'Switch Account', icon: switchAccountIcon, redirect: '/' },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
    toast.success('Logout Successfully');
    setProfileToggle(false);
  };

  const handleMenuClick = (redirect) => {
    navigate(redirect);
    setProfileToggle(false);
  };

  return (
    <ClickAwayListener onClickAway={() => setProfileToggle(false)}>
      <div
        className="fixed w-56 bg-white rounded drop-shadow-lg border z-[9999]"
        style={{ 
          top: `${position.top}px`, 
          left: `${position.left}px`,
        }}
      >
        <div className="absolute right-5 bottom-[-8px] rotate-45 h-4 w-4 bg-white rounded-sm border-r border-b"></div>

        <div className="flex flex-col w-full overflow-hidden">
          {tabs.map((el, i) => (
            <div
              key={i}
              onClick={() => handleMenuClick(el.redirect)}
              className="flex items-center gap-3 p-2.5 text-sm pl-4 cursor-pointer hover:bg-gray-50"
            >
              {el.icon}
              {el.title}
            </div>
          ))}
          <button 
            onClick={handleLogout} 
            className="flex rounded-b border-t-2 items-center gap-3 p-2.5 text-sm pl-4 cursor-pointer hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>
    </ClickAwayListener>
  );
};

export default ProfileDetails;
