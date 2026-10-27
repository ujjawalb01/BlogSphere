
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const verifyEmailConnection = async () => {
  await transporter.verify();
  console.log("Email service connected successfully.");
};

export const sendOTPEmail = async (email, otp, purpose) => {
  if (!email || !/^\d{6}$/.test(otp)) {
    throw new Error("Invalid email or OTP.");
  }

  if (!["register", "forgot-password"].includes(purpose)) {
    throw new Error("Invalid OTP purpose.");
  }

  const isRegistration = purpose === "register";

  const subject = isRegistration
    ? "Verify your BlogSphere account"
    : "BlogSphere password reset OTP";

  const heading = isRegistration
    ? "Verify your email"
    : "Reset your password";

  await transporter.sendMail({
    from: `"BlogSphere" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,

    text: `Your BlogSphere verification code is ${otp}. It expires in 5 minutes. Do not share it with anyone.`,

    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;">
        <h2>${heading}</h2>

        <p>Your BlogSphere verification code is:</p>

        <h1 style="letter-spacing:10px;color:#32174d;">
          ${otp}
        </h1>

        <p>This code expires in 5 minutes.</p>
        <p>Never share this code with anyone.</p>

        <hr />

        <p style="color:#888;font-size:12px;">
          If you did not request this code, you can ignore this email.
        </p>
      </div>
    `,
  });
};
