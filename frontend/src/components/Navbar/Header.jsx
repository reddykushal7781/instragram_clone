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
      <span>{label}</span>
    </div>
  );

  const profileButtonRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const handleProfileClick = () => {
    if (profileButtonRef.current) {
      const rect = profileButtonRef.current.getBoundingClientRect();
      console.log(rect.bottom, rect.left)
      setPosition({ top: rect.bottom + 5, left: rect.left }); // Position below the button
    }
    setProfileToggle((prev) => !prev);
  };

  return (
    // <nav className="fixed top-0 w-full border-b bg-white z-10">
    //   {/* <!-- navbar container --> */}
    //   <div className="flex flex-row justify-between items-center py-2 px-3.5 sm:w-full sm:py-2 sm:px-4 md:w-full md:py-2 md:px-6 xl:w-4/6 xl:py-3 xl:px-8 mx-auto">
    //     {/* <!-- logo --> */}
    //     <Link to="/">
    //       <img
    //         draggable="false"
    //         className="mt-1.5 w-full h-full object-contain"
    //         src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
    //         alt=""
    //       />
    //     </Link>

    //     <SearchBox />

    //     {/* <!-- icons container  --> */}
    //     <div className="flex items-center space-x-6 sm:mr-5">
    //       <Link to="/">
    //         {profileToggle || !onHome ? homeOutline : homeFill}
    //       </Link>

    //       <Link to="/direct/inbox">
    //         {onChat ? messageFill : messageOutline}
    //       </Link>

    //       <div onClick={() => setNewPost(true)} className="cursor-pointer">
    //         {postUploadOutline}
    //       </div>

    //       {/* <span className="hidden sm:block">{exploreOutline}</span> */}
    //       {/* <span className="hidden sm:block">{likeOutline}</span> */}

    //       <div
    //         onClick={() => setProfileToggle(!profileToggle)}
    //         className={`${
    //           (profileToggle && "border-black border") ||
    //           (!onHome && !onChat && "border-black border")
    //         } rounded-full cursor-pointer h-7 w-7 p-[0.5px]`}
    //       >
    //         <img
    //           draggable="false"
    //           loading="lazy"
    //           className="w-full h-full rounded-full object-cover"
    //           src={
    //             user && user.avatar
    //               ? user.avatar
    //               : "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1200px-Default_pfp.svg.png"
    //           }
    //           alt=""
    //         />
    //       </div>
    //     </div>

    //     {profileToggle && (
    //       <ProfileDetails setProfileToggle={setProfileToggle} />
    //     )}

    //     <NewPost newPost={newPost} setNewPost={setNewPost} />
    //   </div>
    // </nav>
    <nav className="fixed w-64 h-screen border-r bg-white">
      <div className="flex flex-col h-full py-6 px-4">
        {/* Logo */}
        <Link to="/">
          <img
            draggable="false"
            className="mb-8 px-2"
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
            <div className="p-3">
              <SearchBox />
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
          
          <NavItem 
            id="explore"
            icon={<Compass size={24} />}
            label="Explore"
          />
          
          <NavItem 
            id="reels"
            icon={<Film size={24} />}
            label="Reels"
          />

          <Link to="/direct/inbox">
            <NavItem 
              id="messages"
              icon={<MessageCircle size={24} />}
              label="Messages"
            />
          </Link>     
          
          <NavItem 
            id="notifications"
            icon={<Heart size={24} />}
            label="Notifications"
          />

          <div onClick={() => setNewPost(true)} className="cursor-pointer">
            <NavItem 
              id="create"
              icon={<PlusSquare size={24} />}
              label="Create"
            />
          </div>

          {/* <div className="relative">
            <button
              ref={profileButtonRef}
              onClick={handleProfileClick}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Profile
            </button>

            {profileToggle && (
              <ProfileDetails setProfileToggle={setProfileToggle} position={position} />
            )}
          </div> */}

        <div
          ref={profileButtonRef} // ✅ Keep the ref here
          className="relative flex items-center p-3 rounded-md hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            handleProfileClick(); // ✅ Ensures correct positioning
            setProfileToggle(true);
            setActiveItem('profile');
          }}
        >
          <div className={`mr-3 rounded-full h-7 w-7 overflow-hidden ${activeItem === 'profile' ? 'border border-black' : ''}`}>
            <img
              className="w-full h-full rounded-full object-cover"
              src={user1.avatar}
              alt="Profile"
            />
          </div>
          <span className={activeItem === 'profile' ? 'font-bold' : ''}>Profile</span>
          {profileToggle && (
              <ProfileDetails setProfileToggle={setProfileToggle} position={position} />
            )}
        </div>

        </div>

        

        
        {/* Bottom items with divider */}
        <div className="mt-auto pt-4 border-t">
          <NavItem 
            id="ai-studio"
            icon={<Zap size={22} />}
            label="AI Studio"
          />
          
          <NavItem 
            id="threads"
            icon={<Hash size={22} />}
            label="Threads"
          />
          
          <NavItem 
            id="more"
            icon={<MoreHorizontal size={22} />}
            label="More"
          />
        </div>

      </div>

      {profileToggle && (
          <ProfileDetails setProfileToggle={setProfileToggle} />
        )}
      <NewPost newPost={newPost} setNewPost={setNewPost} />
    </nav>
    
  );
};

export default Header;
