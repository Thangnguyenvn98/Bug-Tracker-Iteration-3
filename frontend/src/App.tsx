
import SignIn from './components/SignIn'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from './layouts/Layout';
import Home from './components/Home';
import BugDetail from './components/BugDetail';
import Register from './components/Register';
import RequestReset from './components/RequestReset';
import ResetPassword from './components/ResetPassword';
import BugForm from './components/BugForm';
import ChangePassword from './components/ChangePassword';
import BugLibrary from './components/BugLibrary';



function App() {

  return (
    
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/buglibrary"
            element={
              <Layout>
                <BugLibrary/>
              </Layout>
            }
          />
          <Route
            path="/bug/:id"
            element={
              <Layout>
                <BugDetail/>
              </Layout>
            }
          />
          <Route
              path="/add-bug"
              element={
                <Layout>
                  <BugForm />
                </Layout>
              }
            />
          <Route
            path="/register"
            element={
              <Layout>
                <Register />
              </Layout>
            }
          />
          <Route
            path="/sign-in"
            element={
              <Layout>
                <SignIn />
              </Layout>
            }
          />
           <Route
            path="/password-reset-request"
            element={
              <Layout>
                <RequestReset />
              </Layout>
            }
          />
               <Route
            path="/reset-password"
            element={
              <Layout>
                <ResetPassword />
              </Layout>
            }
          />
           <Route
            path="/change-password"
            element={
              <Layout>
                <ChangePassword/>
              </Layout>
            }
          />
  
          {/* {isLoggedIn && (
            <>
              <Route
                path="/hotel/:hotelId/booking"
                element={
                  <Layout>
                    <Booking />
                  </Layout>
                }
              />
  
              <Route
                path="/add-hotel"
                element={
                  <Layout>
                    <AddHotel />
                  </Layout>
                }
              />
              <Route
                path="/edit-hotel/:hotelId"
                element={
                  <Layout>
                    <EditHotel />
                  </Layout>
                }
              />
              <Route
                path="/my-hotels"
                element={
                  <Layout>
                    <MyHotels />
                  </Layout>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <Layout>
                    <MyBookings />
                  </Layout>
                }
              />
            </>
          )} */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    );
}

export default App
