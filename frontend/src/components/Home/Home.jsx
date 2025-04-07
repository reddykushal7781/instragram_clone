import PostsContainer from './PostsContainer';
import Sidebar from './Sidebar/Sidebar';
import MetaData from '../Layouts/MetaData';
import StoriesContainer from './StoriesContainer';

const Home = () => {
  return (
    <>
      <MetaData title="Instagram" />

      <div className="flex flex-col h-full w-full max-w-4xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <div className="w-full mb-4">
              <StoriesContainer />
            </div>
            <div className="w-full">
              <PostsContainer />
            </div>
          </div>
          <div className="w-full lg:w-1/3 lg:pl-4">
            <Sidebar />
          </div>
        </div>
      </div>

      {/* <div className="flex h-full w-full mt-14"> 
        <PostsContainer />
        <Sidebar />
      </div> */}
    </>
  );
};

export default Home;
