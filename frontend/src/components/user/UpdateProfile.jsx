import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Loader from "../layout/Loader";
import PageTitle from "../layout/PageTitle";
import Alert from "../utils/Alert";

import { loadUser } from "../../features/user/authSlice";
import {
  clearErrors,
  updateProfile,
  updateProfileReset,
} from "../../features/user/userSlice";

import { EmailIcon, UploadFileIcon, UserIcon } from "../../icons/FormIcons";
import "../Form.css";

const UpdateProfile = () => {
  const dispatch = useDispatch();

  // Extract user and auth state from redux store
  const { user } = useSelector((state) => state.auth);
  const { error, isUpdated, loading } = useSelector((state) => state.user);

  // Define the initial state for form data
  const initialFormData = {
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatar: user.avatar.url,
  };

  const [formData, setFormData] = useState(initialFormData);

  // Destructure the form data for easier access
  const { username, firstName, lastName, email, avatar } = formData;

  // Update the formData state whenever an input field changes
  const onChange = (e) => {
    if (e.target.name === "avatar") {
      const files = Array.from(e.target.files);
      const reader = new FileReader();
      // Update the image state to the base64 data URL provided by FileReader
      reader.onload = () => {
        setFormData({
          ...formData,
          [e.target.name]: reader.result,
        });
      };
      reader.readAsDataURL(files[0]);
    } else {
      // Update other form data fields
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Dispatch updateProfile and loadUser actions to the Redux store
  const onSubmit = async (e) => {
    e.preventDefault();
    // Check if profile data has been modified
    if (JSON.stringify(initialFormData) !== JSON.stringify(formData)) {
      await dispatch(updateProfile(formData));
      await dispatch(loadUser());
    }
  };

  return (
    <>
      {/* Page title */}
      <PageTitle title="Update Profile" />

      {/* Display loader while loading */}
      {loading && <Loader />}

      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Display success message upon successful update */}
      {isUpdated && (
        <Alert
          message={"Profile updated successfully"}
          clear={updateProfileReset}
          type={"success"}
        />
      )}

      <div className="background-authentication">
        <div className="form-style">
          <form onSubmit={onSubmit}>
            <h1>Edit Profile</h1>
            <div>
              {/* Username input field */}
              <label htmlFor="update-username">Username</label>
              <UserIcon />
              <input
                type="text"
                id="update-username"
                name="username"
                value={username}
                placeholder="Username"
                onChange={onChange}
                autoComplete="username"
                required
              />
            </div>
            <div className="inline-flex">
              <div>
                {/* First name input field */}
                <label htmlFor="update-first-name">First Name</label>
                <input
                  type="text"
                  id="update-first-name"
                  name="firstName"
                  value={firstName}
                  placeholder="First name"
                  onChange={onChange}
                  autoComplete="given-name"
                  required
                />
              </div>
              <div>
                {/* Last name input fiend */}
                <label htmlFor="update-last-name">Last Name</label>
                <input
                  type="text"
                  id="update-last-name"
                  name="lastName"
                  value={lastName}
                  placeholder="Last name"
                  onChange={onChange}
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>
            <div>
              {/* Email input field */}
              <label htmlFor="update-email">Email</label>
              <EmailIcon />
              <input
                type="email"
                id="update-email"
                name="email"
                value={email}
                placeholder="Email"
                onChange={onChange}
                autoComplete="email"
                required
              />
            </div>
            <div>
              {/* Avatar input field */}
              <label htmlFor="update-avatar">Avatar</label>
              <div className="avatar-wrapper">
                <div>
                  <img
                    src={avatar}
                    className="rounded-circle"
                    alt="Avatar Image"
                    width="96px"
                    height="96px"
                  />
                </div>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="update-avatar"
                    name="avatar"
                    className="avatar-input-upload"
                    accept="images/*"
                    onChange={onChange}
                  />
                  <UploadFileIcon />
                </div>
              </div>
            </div>
            {/* Submit button */}
            <button type="submit" className="submit-button">
              Update Profile
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdateProfile;
