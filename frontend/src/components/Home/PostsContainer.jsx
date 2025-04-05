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
import InfiniteScroll from 'react-infinite-scroll-component';
import SpinLoader from '../Layouts/SpinLoader';
import SkeletonPost from '../Layouts/SkeletonPost';

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
      // console.log(error);
      // toast.error(error);
      dispatch(clearErrors());
    }
    dispatch(getPostsOfFollowing());
    dispatch({ type: POST_FOLLOWING_RESET });
  }, [dispatch, error]);

  useEffect(() => {
    if (likeError) {
      // console.log(likeError);
      // toast.error(likeError);
      dispatch(clearErrors());
    }
    if (success) {
      // toast.success(message);
      dispatch({ type: LIKE_UNLIKE_POST_RESET });
    }
    if (commentError) {
      console.log(commentError);
      // toast.error(commentError);
      dispatch(clearErrors());
    }
    if (commentSuccess) {
      // toast.success('Comment Added');
      dispatch({ type: NEW_COMMENT_RESET });
    }
    if (saveError) {
      console.log(saveError);
      // toast.error(saveError);
      dispatch(clearErrors());
    }
    if (saveSuccess) {
      // toast.success(saveMessage);
      dispatch({ type: SAVE_UNSAVE_POST_RESET });
    }
    if (deleteError) {
      // toast.error(deleteError);
      dispatch(clearErrors());
    }
    if (deleteSuccess) {
      // toast.success('Post Deleted');
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
    dispatch(getPostsOfFollowing(page));
  };

  return (
    <div className="w-full">
      <InfiniteScroll
        dataLength={posts?.length || 0}
        next={fetchMorePosts}
        hasMore={posts?.length !== totalPosts}
        loader={<SpinLoader />}
        endMessage={
          <p className="text-center my-4">
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        {loading ? (
          <SkeletonPost />
        ) : (
          posts?.map((post) => (
            <PostItem
              key={post._id}
              post={post}
              setUsersList={setUsersList}
              setUsersDialog={setUsersDialog}
            />
          ))
        )}
      </InfiniteScroll>

      <UsersDialog
        open={usersDialog}
        handleClose={handleClose}
        users={usersList}
      />
    </div>
  );
};

export default PostsContainer;
