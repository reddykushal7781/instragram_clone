import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  clearErrors,
  loadUser,
  updateProfile,
  getUserDetails,
} from '../../../actions/userAction';
import profile from '../../../assets/images/hero.png';
import { UPDATE_PROFILE_RESET } from '../../../constants/userConstants';
import MetaData from '../../Layouts/MetaData';

const UpdateProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const avatarInput = useRef(null);

  const { user } = useSelector((state) => state.userDetails);
  const { error, isUpdated, loading } = useSelector((state) => state.profile);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [oldAvatar, setOldAvatar] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = (e) => {
    e.preventDefault();

    const userCheck = /^[a-z0-9_.-]{6,25}$/gim;

    if (!userCheck.test(username)) {
      toast.error('Invalid Username');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.set('name', name);
    formData.set('username', username);
    formData.set('bio', bio);
    formData.set('email', email);
    formData.set('avatar', avatar);

    dispatch(updateProfile(formData));
  };

  const handleAvatarChange = (e) => {
    const reader = new FileReader();
    setAvatar('');
    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    setAvatar(e.target.files[0]);
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setUsername(user.username);
      setBio(user.bio);
      setEmail(user.email);
      setOldAvatar(user.avatar);
    }
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
      setIsSubmitting(false);
    }
    if (isUpdated) {
      toast.success('Profile Updated');
      dispatch(loadUser());
      dispatch(getUserDetails(username));
      navigate(`/${username}`);

      dispatch({ type: UPDATE_PROFILE_RESET });
    }
  }, [dispatch, user, error, isUpdated, username]);

  return (
    <>
      <MetaData title="Edit Profile • Instagram" />

      <form
        onSubmit={handleUpdate}
        encType="multipart/form-data"
        className="flex flex-col gap-4 py-4 px-4 sm:py-10 sm:px-24 sm:w-3/4"
      >
        <div className="flex items-center gap-8 ml-20">
          <div className="w-11 h-11">
            <img
              draggable="false"
              className="w-full h-full rounded-full border object-cover"
              src={avatarPreview ? avatarPreview : oldAvatar}
              alt="avatar"
            />
          </div>
          <div className="flex flex-col gap-0">
            <span className="text-xl">{username}</span>
            <label
              onClick={(e) => avatarInput.current.click()}
              className="text-sm font-medium text-blue-600 cursor-pointer"
            >
              Change Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              name="avatar"
              ref={avatarInput}
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>
        <div className="flex w-full gap-8 text-right items-center">
          <span className="w-1/4 font-semibold">Name</span>
          <input
            className="border rounded p-1 w-3/4"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex w-full gap-8 text-right items-center">
          <span className="w-1/4 font-semibold">Username</span>
          <input
            className="border rounded p-1 w-3/4"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled
            required
          />
        </div>
        <div className="flex w-full gap-8 text-right items-start">
          <span className="w-1/4 font-semibold">Bio</span>
          <textarea
            className="border rounded outline-none resize-none p-1 w-3/4"
            name="bio"
            placeholder="Bio"
            rows="3"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="flex w-full gap-8 text-right items-center">
          <span className="w-1/4 font-semibold">Email</span>
          <input
            className="border rounded p-1 w-3/4"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || isSubmitting}
          className={`bg-blue-600 font-medium rounded text-white py-2 w-40 mx-auto text-sm flex items-center justify-center ${(loading || isSubmitting) ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading || isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </>
          ) : (
            'Submit'
          )}
        </button>
      </form>
    </>
  );
};

export default UpdateProfile;
