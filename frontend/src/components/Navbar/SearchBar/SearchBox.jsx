import { ClickAwayListener } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { searchIcon } from '../SvgIcons';
import SearchUserItem from './SearchUserItem';
import { toast } from 'react-toastify';

const SearchBox = () => {

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(false);
  const [searching, setSearching] = useState(false);

  const fetchUsers = async (term) => {
    try {
      setLoading(true);
      console.log('Fetching users with term:', term);
      const { data } = await axios.get(`/api/v1/users?keyword=${encodeURIComponent(term)}`);
      console.log('Search response:', data);
      
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        console.error('Invalid response format:', data);
        setUsers([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response) {
        console.error('Error response:', error.response.data);
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
    }, 500); // Add debounce delay

    return () => {
      clearTimeout(debounceTimer);
      setUsers([]);
    };
  }, [searchTerm]);

  const handleClickAway = () => {
    setSearchTerm('');
    setSearchResult(false);
    setSearching(false);
    setUsers([]);
  };

  const handleFocus = () => {
    setSearchResult(true);
    setSearching(true);
  };

  const handleUserClick = () => {
    setSearchTerm('');
    setSearchResult(false);
    setSearching(false);
    setUsers([]);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div className="hidden sm:flex items-center gap-3 pl-4 ml-36 w-64 py-2 bg-[#efefef] rounded-lg relative">
        {!searching && searchIcon}
        <input
          className="bg-transparent text-sm border-none outline-none flex-1 pr-3"
          type="search"
          value={searchTerm}
          onFocus={handleFocus}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search"
        />
        {searchResult &&
                    <>
                      <div className="absolute right-1/2 -bottom-5 rotate-45 h-4 w-4 drop-shadow-lg bg-white rounded-sm border-l border-t"></div>

                      <div className={`${loading ? 'justify-center items-center' : users && users.length < 1 && 'justify-center items-center'} absolute overflow-y-auto overflow-x-hidden flex flex-col top-[49px] w-[23rem] -left-11 h-80 bg-white drop-shadow-xl rounded`}>
                        {loading ? (
                          <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                          </div>
                        ) : users && users.length > 0 ? (
                          users.map((user) => (
                            <div key={user._id} onClick={handleUserClick}>
                              <SearchUserItem {...user} />
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">No results found.</span>
                        )}
                      </div>
                    </>
        }
      </div>
    </ClickAwayListener>
  );
};

export default SearchBox;