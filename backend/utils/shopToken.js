const sendShopToken = (shop, statusCode, res) => {
  // Get shop token
  const token = shop.getJwtToken();

  const options = {
    // Set cookie expires time
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    // Prevent client-side scripts from accessing data
    httpOnly: true,
    sameSite: "none",
    path: "/",
  };

  res.status(statusCode).cookie("shop_token", token, options).json({
    success: true,
    token,
    shop,
    options,
  });
};

export default sendShopToken;
