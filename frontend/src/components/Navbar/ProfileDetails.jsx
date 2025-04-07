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
    <div
      className="fixed bg-white rounded-lg shadow-lg z-50 overflow-hidden"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '230px',
      }}
    >


      <div className="py-1">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleMenuClick(tab.redirect)}
          >
            <div className="w-5 h-5">{tab.icon}</div>
            <span className="text-sm">{tab.title}</span>
          </div>
        ))}
      </div>

      <div className="border-t py-1">
        <div
          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
          onClick={handleLogout}
        >
          <span className="text-sm text-red-600">Log Out</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
