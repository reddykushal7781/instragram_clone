import PostsContainer from './PostsContainer';
import Sidebar from './Sidebar/Sidebar';
import MetaData from '../Layouts/MetaData';

const Home = () => {
  return (
    <>
      <MetaData title="Instagram" />

      <div className="flex h-full md:w-4/5 lg:w-4/6 mt-14 mx-auto">
        <PostsContainer />
        <Sidebar />
      </div>

      {/* <div className="flex h-full w-full mt-14"> 
        <PostsContainer />
        <Sidebar />
      </div> */}
    </>
  );
};

export default Home;
