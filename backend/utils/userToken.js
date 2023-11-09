import jwt from "jsonwebtoken";

const sendUserToken = (user, statusCode, res) => {
  let token;

  if (user.jti) {
    // User doesn't have account on website and uses one-tap login
    token = jwt.sign({ id: user.jti }, process.env.USER_JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_TIME,
    });
  } else {
    // User has an account on the website, get the user token
    token = user.getJwtToken();
  }

  const options = {
    // Set cookie expires time
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    // Prevent client-side scripts from accessing data
    httpOnly: true,
    path: "/",
  };

  res.status(statusCode).cookie("user_token", token, options).json({
    success: true,
    token,
    user,
    options,
  });
};

export default sendUserToken;
