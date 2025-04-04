import config from "../config/config.js";

const sendCookie = (user = {}, statusCode, res) => {
  const token = user.generateToken();

  const options = {
    expires: new Date(
      Date.now() + config.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: config.NODE_ENV === 'production' ? '.onrender.com' : undefined
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token
  });
};

export default sendCookie;
