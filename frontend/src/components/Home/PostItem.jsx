import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { addComment, likePost, savePost, deletePost } from "../../actions/postAction";
import { likeFill } from "../Navbar/SvgIcons";
import {
  commentIcon,
  emojiIcon,
  likeIconOutline,
  moreIcons,
  saveIconFill,
  saveIconOutline,
  shareIcon,
} from "./SvgIcons";
import { Picker } from "emoji-mart";
import ScrollToBottom from "react-scroll-to-bottom";
import axios from "axios";
import moment from "moment";
import { Dialog } from "@mui/material";
import { toast } from "react-toastify";

const PostItem = ({
  _id,
  caption,
  likes = [],
  comments = [],
  image,
  postedBy,
  savedBy = [],
  createdAt,
  setUsersDialog,
  setUsersList,
}) => {
  const dispatch = useDispatch();
  const commentInput = useRef(null);

  const { user } = useSelector((state) => state.user);
  const [deleteModal, setDeleteModal] = useState(false);

  const [allLikes, setAllLikes] = useState(likes || []);
  const [allComments, setAllComments] = useState(comments || []);
  const [allSavedBy, setAllSavedBy] = useState(savedBy || []);

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comment, setComment] = useState("");
  const [viewComment, setViewComment] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [likeEffect, setLikeEffect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    try {
      setLiked(!liked);
      await dispatch(likePost(_id));
      setIsLoading(true);
      const { data } = await axios.get(`/api/v1/post/detail/${_id}`);
      if (data && data.post) {
        setAllLikes(data.post.likes || []);
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
      toast.error("Failed to update like status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addComment(_id, comment));
      setComment("");
      setIsLoading(true);
      const { data } = await axios.get(`/api/v1/post/detail/${_id}`);
      if (data && data.post) {
        setAllComments(data.post.comments || []);
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaved(!saved);
      await dispatch(savePost(_id));
      setIsLoading(true);
      const { data } = await axios.get(`/api/v1/post/detail/${_id}`);
      if (data && data.post) {
        setAllSavedBy(data.post.savedBy || []);
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
      toast.error("Failed to save post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = () => {
    dispatch(deletePost(_id));
    setDeleteModal(false);
  };

  const closeDeleteModal = () => {
    setDeleteModal(false);
  };

  const handleLikeModal = () => {
    setUsersDialog(true);
    setUsersList(allLikes);
  };

  const setLike = () => {
    setLikeEffect(true);
    setTimeout(() => {
      setLikeEffect(false);
    }, 500);
    if (liked) {
      return;
    }
    handleLike();
  };

  useEffect(() => {
    if (allLikes && user) {
      setLiked(allLikes.some((u) => u._id === user._id));
    }
  }, [allLikes, user]);

  useEffect(() => {
    if (allSavedBy && user) {
      setSaved(allSavedBy.some((id) => id === user._id));
    }
  }, [allSavedBy, user]);

  // Ensure we have safe arrays to work with
  const safeComments = Array.isArray(allComments) ? allComments : [];
  const safeLikes = Array.isArray(allLikes) ? allLikes : [];

  return (
    <div className="flex flex-col border rounded bg-white relative">
      <div className="flex justify-between px-3 py-2.5 border-b items-center">
        <div className="flex space-x-3 items-center">
          <Link to={`/${postedBy?.username}`}>
            <img
              draggable="false"
              className="w-10 h-10 rounded-full object-cover"
              src={postedBy?.avatar}
              alt="avatar"
            />
          </Link>
          <Link
            to={`/${postedBy?.username}`}
            className="text-black text-sm font-semibold"
          >
            {postedBy?.username}
          </Link>
        </div>
        <span 
          className="cursor-pointer"
          onClick={() => setDeleteModal(true)}
        >
          {moreIcons}
        </span>
      </div>

      <Dialog open={deleteModal} onClose={closeDeleteModal} maxWidth="xl">
        <div className="flex flex-col items-center w-80">
          {postedBy?._id === user?._id && (
            <button
              onClick={handleDeletePost}
              className="text-red-600 font-medium border-b py-2.5 w-full hover:bg-red-50"
            >
              Delete
            </button>
          )}
          <button
            onClick={closeDeleteModal}
            className="py-2.5 w-full hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </Dialog>

      {/* post image container */}
      <div
        className="relative flex items-center justify-center"
        onDoubleClick={setLike}
      >
        <img
          draggable="false"
          loading="lazy"
          className="w-full h-full object-cover object-center"
          src={image}
          alt="post image"
        />
        {likeEffect && (
          <img
            draggable="false"
            height="80px"
            className="likeEffect"
            alt="heart"
            src="https://img.icons8.com/ios-filled/2x/ffffff/like.png"
          />
        )}
      </div>

      {/* like comment container */}
      <div className="flex flex-col px-4 space-y-1 border-b pb-2 mt-2">
        {/* icons container */}
        <div className="flex items-center justify-between py-2">
          <div className="flex space-x-4">
            <button onClick={handleLike} disabled={isLoading}>
              {liked ? likeFill : likeIconOutline}
            </button>
            <button onClick={() => commentInput.current.focus()}>
              {commentIcon}
            </button>
            {shareIcon}
          </div>
          <button onClick={handleSave} disabled={isLoading}>
            {saved ? saveIconFill : saveIconOutline}
          </button>
        </div>

        {/* likes  */}
        <span
          onClick={handleLikeModal}
          className="font-semibold text-sm cursor-pointer"
        >
          {safeLikes.length} likes
        </span>

        {/* comment */}
        <div className="flex flex-auto items-center space-x-1">
          <Link
            to={`/${postedBy?.username}`}
            className="text-sm font-semibold hover:underline"
          >
            {postedBy?.username}
          </Link>
          <span className="text-sm truncate">{caption}</span>
        </div>

        {/* time */}
        {safeComments.length > 0 ? (
          <span
            onClick={() => setViewComment(!viewComment)}
            className="text-[13px] text-gray-500 cursor-pointer"
          >
            {viewComment
              ? "Hide Comments"
              : safeComments.length === 1
              ? `View ${safeComments.length} Comment`
              : `View All ${safeComments.length} Comments`}
          </span>
        ) : (
          <span className="text-[13px] text-gray-500">No Comments Yet!</span>
        )}
        <span className="text-xs text-gray-500 cursor-pointer">
          {moment(createdAt).fromNow()}
        </span>

        {viewComment && (
          <ScrollToBottom className="w-full h-52 overflow-y-auto py-1">
            {safeComments.map((c) => (
              <div className="flex items-start mb-2 space-x-2" key={c._id}>
                <img
                  draggable="false"
                  className="h-7 w-7 rounded-full object-cover mr-0.5"
                  src={c.user?.avatar}
                  alt="avatar"
                />
                <Link
                  to={`/${c.user?.username}`}
                  className="text-sm font-semibold hover:underline"
                >
                  {c.user?.username}
                </Link>
                <p className="text-sm">{c.comment}</p>
              </div>
            ))}
          </ScrollToBottom>
        )}
      </div>

      {/* comment input container */}
      <form
        onSubmit={handleComment}
        className="flex items-center justify-between p-3 w-full space-x-3"
      >
        <span
          onClick={() => setShowEmojis(!showEmojis)}
          className="cursor-pointer"
        >
          {emojiIcon}
        </span>

        {showEmojis && (
          <div className="absolute bottom-12 -left-2">
            <Picker
              set="google"
              onSelect={(e) => setComment(comment + e.native)}
              title="Emojis"
            />
          </div>
        )}

        <input
          className="flex-auto text-sm outline-none border-none bg-transparent"
          type="text"
          value={comment}
          ref={commentInput}
          required
          onFocus={() => setShowEmojis(false)}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button
          type="submit"
          className={`${
            comment.trim().length < 1 ? "text-blue-300" : "text-blue-600"
          } text-sm font-semibold`}
          disabled={comment.trim().length < 1 || isLoading}
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default PostItem;
