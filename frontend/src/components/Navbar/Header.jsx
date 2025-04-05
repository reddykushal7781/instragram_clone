import React, { useEffect, useRef, useState } from "react";
import {
  exploreOutline,
  homeFill,
  homeOutline,
  likeFill,
  likeOutline,
  messageFill,
  messageOutline,
  postUploadOutline,
} from "./SvgIcons";

import { Home, Search, Compass, Film, Heart, PlusSquare, MessageCircle, Zap, Hash, MoreHorizontal } from 'lucide-react';

import { Link, useLocation } from "react-router-dom";
import ProfileDetails from "./ProfileDetails";
import NewPost from "./NewPost";
import { useSelector } from "react-redux";
import SearchBox from "./SearchBar/SearchBox";
import { ClickAwayListener } from "@mui/material";

const Header = () => {
  const { user } = useSelector((state) => state.user);

  const [profileToggle, setProfileToggle] = useState(false);
  const [newPost, setNewPost] = useState(false);

  const location = useLocation();
  const [onHome, setOnHome] = useState(false);
  const [onChat, setOnChat] = useState(false);

  useEffect(() => {
    setOnHome(location.pathname === "/");
    setOnChat(location.pathname.split("/").includes("direct"));
  }, [location]);

  const [activeItem, setActiveItem] = useState('home');
  
  const [showSearch, setShowSearch] = useState(false);
  
  // Mock user data
  const user1 = {
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1200px-Default_pfp.svg.png"
  };

  // Toggle search box
  const handleSearchClick = () => {
    setShowSearch(!showSearch);
    setActiveItem('search');
  };

  // Navigation item component
  const NavItem = ({ icon, label, id }) => (
    <div 
      className={`flex items-center p-3 rounded-md hover:bg-gray-100 cursor-pointer ${activeItem === id ? 'font-bold' : ''}`}
      onClick={() => {
        setActiveItem(id);
        setShowSearch(false);
      }}
    >
      <div className="mr-3">
        {icon}
      </div>
      <span className={showSearch ? 'hidden' : ''}>{label}</span>
    </div>
  );

  const moreButtonRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const handleMoreClick = () => {
    if (moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      // Position the dropdown above the More button
      setPosition({ 
        top: rect.top -250, 
        left: rect.left 
      });
    }
    setProfileToggle(!profileToggle);
  };

  return (
    <nav className={`fixed h-screen border-r bg-white transition-all duration-300 ${showSearch ? 'w-20' : 'w-64'}`}>
      <div className="flex flex-col h-full py-6 px-4">
        {/* Logo */}
        <Link to="/">
          <img
            draggable="false"
            className={`mb-8 px-2 ${showSearch ? 'w-8' : ''}`}
            src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
            alt=""
          />
        </Link>
        
        {/* Main navigation items */}
        <div className="flex-1 flex flex-col space-y-1">
          <Link to="/">
            <NavItem 
              id="home"
              icon={<Home size={24} />}
              label="Home"
            />
          </Link>
          

          {showSearch ? (
            <div className="relative">
              <div 
                className={`flex items-center p-3 rounded-md hover:bg-gray-100 cursor-pointer ${activeItem === 'search' ? 'font-bold' : ''}`}
                onClick={handleSearchClick}
              >
                <div className="mr-3">
                  <Search size={24} />
                </div>
                <span className="hidden">Search</span>
              </div>
              <div className="fixed top-[0px] left-20 w-[330px] h-[100vh] bg-white shadow-lg z-50 overflow-hidden border-r">
                <div className="p-3 border-b">
                  <h3 className="text-sm font-semibold">Search</h3>
                </div>
                <div className="p-3">
                  <SearchBox />
                </div>
              </div>
            </div>
          ) : (
            <div 
              className={`flex items-center p-3 rounded-md hover:bg-gray-100 cursor-pointer ${activeItem === 'search' ? 'font-bold' : ''}`}
              onClick={handleSearchClick}
            >
              <div className="mr-3">
                <Search size={24} />
              </div>
              <span>Search</span>
            </div>
          )}
          
          <Link to="/">
          <NavItem 
            id="explore"
            icon={<Compass size={24} />}
            label="Explore"
          />
          </Link>
          
          <Link to="/">
          <NavItem 
            id="reels"
            icon={<Film size={24} />}
            label="Reels"
          />
          </Link>

          <Link to="/direct/inbox">
            <NavItem 
              id="messages"
              icon={<MessageCircle size={24} />}
              label="Messages"
            />
          </Link>     
          
          <Link to="/">
          <NavItem 
            id="notifications"
            icon={<Heart size={24} />}
            label="Notifications"
          />
          </Link>

          <div onClick={() => setNewPost(true)} className="cursor-pointer">
            <NavItem 
              id="create"
              icon={<PlusSquare size={24} />}
              label="Create"
            />
          </div>

          {/* Profile link - no dropdown */}
          <Link to={`/${user?.username || ''}`}>
            <div className="flex items-center p-3 rounded-md hover:bg-gray-100 cursor-pointer">
              <div className={`mr-3 rounded-full h-7 w-7 overflow-hidden ${activeItem === 'profile' ? 'border border-black' : ''}`}>
                <img
                  className="w-full h-full rounded-full object-cover"
                  src={user?.avatar}
                  alt="Profile"
                />
              </div>
              <span className={`${activeItem === 'profile' ? 'font-bold' : ''} ${showSearch ? 'hidden' : ''}`}>Profile</span>
            </div>
          </Link>

          <Link to="/">
          <NavItem 
            id="ai-studio"
            icon={<Zap size={22} />}
            label="AI Studio"
          />
          </Link>
          
          <Link to="/">
          <NavItem 
            id="threads"
            icon={<Hash size={22} />}
            label="Threads"
          />
          </Link>
          
          {/* More button with dropdown */}
          <div
            ref={moreButtonRef}
            className="relative flex items-center p-3 rounded-md hover:bg-gray-100 cursor-pointer"
            onClick={handleMoreClick}
          >
            <div className="mr-3">
              <MoreHorizontal size={22} />
            </div>
            <span className={showSearch ? 'hidden' : ''}>More</span>
          </div>
        </div>

      </div>

      {/* Render the dropdown outside the nav to avoid clipping issues */}
      {profileToggle && (
        <ProfileDetails setProfileToggle={setProfileToggle} position={position} />
      )}
      
      <NewPost newPost={newPost} setNewPost={setNewPost} />
    </nav>
    
  );
};

export default Header;
