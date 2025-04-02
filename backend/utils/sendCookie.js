const sendCookie = (user = {}, statusCode, res) => {
  const token = user.generateToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
  });
};

export default sendCookie;
