import { useDispatch, useSelector } from "react-redux";
import { loadUser } from "./actions/userAction";
import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "emoji-mart/css/emoji-mart.css";
import Header from "./components/Navbar/Header";
import PrivateRoute from "./Routes/PrivateRoute";
import Profile from "./components/User/Profile";
import UpdateProfile from "./components/User/Update/UpdateProfile";
import UpdatePassword from "./components/User/Update/UpdatePassword";
import SpinLoader from "./components/Layouts/SpinLoader";

const Home = lazy(() => import("./components/Home/Home"));
const SignUp = lazy(() => import("./components/User/SignUp"));
const Login = lazy(() => import("./components/User/Login"));
const Update = lazy(() => import("./components/User/Update/Update"));
const Inbox = lazy(() => import("./components/Chats/Inbox"));
const NotFound = lazy(() => import("./components/Errors/NotFound"));

function App() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  toast.configure({
    theme: "colored",
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 2500,
  });

  const { isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  // always scroll to top on route/path change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);


  return (
    <div>
      <Suspense fallback={<SpinLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <Home />
                </>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />

          <Route
            path="/:username"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <Profile />
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/accounts/edit"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <Update activeTab={0}>
                    <UpdateProfile />
                  </Update>
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/accounts/password/change"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <Update activeTab={1}>
                    <UpdatePassword />
                  </Update>
                </>
              </PrivateRoute>
            }
          />

          <Route
            path="/direct/inbox"
            element={
              <PrivateRoute>
                <Header />
                <Inbox />
              </PrivateRoute>
            }
          />

          <Route
            path="/direct/t/:chatId/:userId"
            element={
              <PrivateRoute>
                <Header />
                <Inbox />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
