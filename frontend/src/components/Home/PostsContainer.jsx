import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { clearErrors, getPostsOfFollowing } from '../../actions/postAction';
import {
  LIKE_UNLIKE_POST_RESET,
  NEW_COMMENT_RESET,
  POST_FOLLOWING_RESET,
  SAVE_UNSAVE_POST_RESET,
  DELETE_POST_RESET,
} from '../../constants/postConstants';
import UsersDialog from '../Layouts/UsersDialog';
import PostItem from './PostItem';
import StoriesContainer from './StoriesContainer';
import InfiniteScroll from 'react-infinite-scroll-component';
import SpinLoader from '../Layouts/SpinLoader';
import SkeletonPost from '../Layouts/SkeletonPost';
import Loader from '../Layouts/Loader';

const PostsContainer = () => {
  const dispatch = useDispatch();

  const [usersList, setUsersList] = useState([]);
  const [usersDialog, setUsersDialog] = useState(false);
  const [page, setPage] = useState(2);

  const { loading, error, posts, totalPosts } = useSelector(
    (state) => state.postOfFollowing,
  );
  const {
    error: likeError,
    message,
    success,
  } = useSelector((state) => state.likePost);
  const { error: commentError, success: commentSuccess } = useSelector(
    (state) => state.newComment,
  );
  const {
    error: saveError,
    success: saveSuccess,
    message: saveMessage,
  } = useSelector((state) => state.savePost);
  const { error: deleteError, success: deleteSuccess } = useSelector((state) => state.deletePost);

  const handleClose = () => setUsersDialog(false);

  useEffect(() => {
    if (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to load posts";
      console.log(errorMessage);
      toast.error(errorMessage);
      dispatch(clearErrors());
    }
    dispatch(getPostsOfFollowing());
    dispatch({ type: POST_FOLLOWING_RESET });
  }, [dispatch, error]);

  useEffect(() => {
    if (likeError) {
      const errorMessage = likeError.response?.data?.message || likeError.message || "Failed to like post";
      console.log(errorMessage);
      toast.error(errorMessage);
      dispatch(clearErrors());
    }
    if (success) {
      const successMessage = message || "Post liked successfully";
      toast.success(successMessage);
      dispatch({ type: LIKE_UNLIKE_POST_RESET });
    }
    if (commentError) {
      const errorMessage = commentError.response?.data?.message || commentError.message || "Failed to add comment";
      console.log(errorMessage);
      toast.error(errorMessage);
      dispatch(clearErrors());
    }
    if (commentSuccess) {
      toast.success("Comment added successfully");
      dispatch({ type: NEW_COMMENT_RESET });
    }
    if (saveError) {
      const errorMessage = saveError.response?.data?.message || saveError.message || "Failed to save post";
      console.log(errorMessage);
      toast.error(errorMessage);
      dispatch(clearErrors());
    }
    if (saveSuccess) {
      const successMessage = saveMessage || "Post saved successfully";
      toast.success(successMessage);
      dispatch({ type: SAVE_UNSAVE_POST_RESET });
    }
    if (deleteError) {
      const errorMessage = deleteError.response?.data?.message || deleteError.message || "Failed to delete post";
      toast.error(errorMessage);
      dispatch(clearErrors());
    }
    if (deleteSuccess) {
      toast.success("Post deleted successfully");
      dispatch({ type: DELETE_POST_RESET });
      dispatch(getPostsOfFollowing(1));
    }
  }, [
    dispatch,
    success,
    likeError,
    message,
    commentError,
    commentSuccess,
    saveError,
    saveSuccess,
    saveMessage,
    deleteError,
    deleteSuccess
  ]);

  const fetchMorePosts = () => {
    setPage((prev) => prev + 1);
    dispatch(getPostsOfFollowing(page + 1));
  };

  return (
    <div className="flex flex-col items-center w-full">
      <StoriesContainer />
      {loading ? (
        <div className="flex flex-col items-center w-full">
          {[1, 2, 3].map((item) => (
            <SkeletonPost key={item} />
          ))}
        </div>
      ) : (
        <InfiniteScroll
          dataLength={posts?.length || 0}
          next={fetchMorePosts}
          hasMore={true}
          loader={
            <div className="flex justify-center my-5">
              <Loader />
            </div>
          }
        >
          {posts?.map((post) => (
            <PostItem
              key={post._id}
              {...post}
              setUsersDialog={setUsersDialog}
              setUsersList={setUsersList}
            />
          ))}
        </InfiniteScroll>
      )}
      <UsersDialog
        open={usersDialog}
        setOpen={setUsersDialog}
        users={usersList}
      />
    </div>
  );
};

export default PostsContainer;
