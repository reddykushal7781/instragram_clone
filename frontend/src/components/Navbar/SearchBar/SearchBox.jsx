import { ClickAwayListener } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import { searchIcon } from '../SvgIcons';
import SearchUserItem from './SearchUserItem';
import { toast } from 'react-toastify';
import axiosInstance from '../../../utils/axios';

const SearchBox = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef(null);

  const fetchUsers = async (term) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/api/v1/users?keyword=${encodeURIComponent(term)}`);
      
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response) {
        toast.error(error.response.data.message || 'Error searching users');
      }
      setUsers([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        fetchUsers(searchTerm);
      } else {
        setUsers([]);
      }
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchTerm]);

  const handleClickAway = () => {
    setSearchResult(false);
    setSearching(false);
  };

  const handleFocus = () => {
    setSearchResult(true);
    setSearching(true);
  };

  const handleUserClick = () => {
    setSearchResult(false);
    setSearching(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div className="relative">
        <div className="flex items-center gap-3 w-full p-2 bg-[#efefef] rounded-lg">
          {!searching && searchIcon}
          <input
            ref={searchInputRef}
            className="bg-transparent text-sm border-none outline-none flex-1 pr-3"
            type="search"
            value={searchTerm}
            onFocus={handleFocus}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
          />
        </div>
        
        {searchResult && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
                </div>
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <div key={user._id} onClick={handleUserClick}>
                    <SearchUserItem {...user} />
                  </div>
                ))
              ) : searchTerm.trim().length > 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No results found for "{searchTerm}"
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Try searching for people, topics, or keywords
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};

export default SearchBox;