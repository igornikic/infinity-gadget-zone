import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Loader from "../layout/Loader";
import PageTitle from "../layout/PageTitle";
import Background from "../layout/Background";
import Alert from "../utils/Alert";

import { clearErrors } from "../../features/user/authSlice";

import "../Profile.css";
import "../Form.css";

const Profile = () => {
  // Extract auth state from redux store
  const { user, loading, error } = useSelector((state) => state.auth);

  return (
    <>
      {/* Page title */}
      <PageTitle title={`${user.username} Profile`} />

      {/* Display loader while loading */}
      {loading && <Loader />}

      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Background animation */}
      <Background />

      <div className="profile-row">
        <div className="profile-col">
          <h1>{user.username} Profile</h1>
          <div className="profile-image">
            {/* Avatar image */}
            <img
              src={user.avatar ? user.avatar.url : user.picture}
              alt={user.username}
              width="96px"
              height="96px"
              preload="auto"
            />
          </div>
          {/* Profile update link */}
          <Link to="/me/update">
            <button type="button" className="submit-button">
              Edit Profile
            </button>
          </Link>
        </div>
        {/* User info */}
        <div className="profile-col">
          <div>
            <p>Username</p>
            <strong>{user.username}</strong>
          </div>
          <div>
            <p>First Name</p>
            <strong>{user.firstName}</strong>
          </div>
          <div>
            <p>Last Name</p>
            <strong>{user.lastName}</strong>
          </div>
        </div>
        <div className="profile-col">
          <div>
            <p>Email</p>
            <strong>{user.email}</strong>
          </div>
          {/* Allowed only for users with website account */}
          {!user.isGuest && (
            <>
              <div>
                <p>Member Since</p>
                <strong>
                  {String(user.createdAt)
                    .substring(0, 10)
                    .split("-")
                    .reverse()
                    .join("/")}
                </strong>
              </div>
              {/* Update password link */}
              <Link to="/password/update">
                <button type="button" className="submit-button">
                  Change Password
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
