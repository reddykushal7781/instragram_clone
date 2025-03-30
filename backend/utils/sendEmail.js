const sgMail = require("@sendgrid/mail");

const sendEmail = async (options) => {
  // Check if SendGrid API key is valid
  if (
    !process.env.SENDGRID_API_KEY ||
    !process.env.SENDGRID_API_KEY.startsWith("SG.")
  ) {
    console.log(
      "SendGrid API key is not configured correctly. Email functionality is disabled."
    );
    return; // Exit early if SendGrid isn't properly configured
  }

  // Set API key only if it's valid
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: options.email,
    from: process.env.SENDGRID_MAIL,
    templateId: options.templateId,
    dynamic_template_data: options.data,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email Sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = sendEmail;
