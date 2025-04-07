import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@mui/material';

const SearchUserItem = ({ _id, username, name, avatar }) => {
  return (
    <Link to={`/${username}`} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
      <Avatar
        src={avatar}
        alt={username}
        className="w-10 h-10"
      />
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{username}</span>
        <span className="text-xs text-gray-500">{name}</span>
      </div>
    </Link>
  );
};

export default SearchUserItem;