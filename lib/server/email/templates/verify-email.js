function renderVerifyEmailTemplate(username, otp) {
  return `<!Doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>Verify Your Email</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 50px auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #4CAF50;
        }
        .content {
          line-height: 1.6;
        }
        .otp {
          display: inline-block;
          background-color: #4CAF50;
          color: #fff;
          padding: 10px 20px;
          font-size: 24px;
          border-radius: 5px;
          margin: 20px 0;
          letter-spacing: 4px;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #777;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Hi ${username},</p>
          <p>Thank you for registering with us! Please use the following One-Time Password (OTP) to verify your email address:</p>
          <div class="otp">${otp}</div>
          <p>This OTP is valid for the next 10 minutes. Please do not share this code with anyone.</p>
          <p>If you did not request this, please ignore this email.</p>
          <p>Best regards,<br/>The Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>`;
}

export { renderVerifyEmailTemplate };
