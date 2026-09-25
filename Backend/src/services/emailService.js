const sendEmail = require("../utils/sendEmail");
const env = require("../config/env");

/*
|--------------------------------------------------------------------------
| Welcome Email
|--------------------------------------------------------------------------
*/

const sendWelcomeEmail = async (user) => {
  const subject = "Welcome to Smart Village Management!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #16a34a; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0;">Smart Village Management</h1>
      </div>
      <div style="padding: 32px; background: #f9fafb;">
        <h2 style="color: #111827;">Welcome, ${user.name}!</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Thank you for joining the Smart Village Management platform.
          You can now access all village services, file complaints, browse
          jobs, and stay connected with your community.
        </p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${env.frontendUrl}/dashboard"
             style="background: #16a34a; color: #fff; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; font-weight: bold;">
            Go to Dashboard
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          If you did not create this account, please ignore this email.
        </p>
      </div>
      <div style="padding: 16px; text-align: center; background: #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} Smart Village Management. All rights reserved.
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to: user.email, subject, html });
};

/*
|--------------------------------------------------------------------------
| Complaint Status Update Email
|--------------------------------------------------------------------------
*/

const sendComplaintStatusEmail = async (user, complaint) => {
  const statusColors = {
    pending: "#f59e0b",
    in_progress: "#3b82f6",
    resolved: "#16a34a",
    rejected: "#ef4444",
    closed: "#6b7280",
  };
  const color = statusColors[complaint.status] || "#111827";

  const subject = `Your Complaint "${complaint.title}" has been updated`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #16a34a; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0;">Smart Village Management</h1>
      </div>
      <div style="padding: 32px; background: #f9fafb;">
        <h2 style="color: #111827;">Complaint Update</h2>
        <p style="color: #4b5563;">Your complaint status has been updated:</p>
        <div style="background: #fff; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid ${color};">
          <p style="margin: 0 0 8px; font-weight: bold; color: #111827;">${complaint.title}</p>
          <p style="margin: 0; color: ${color}; font-weight: bold; text-transform: uppercase; font-size: 14px;">
            ${complaint.status.replace("_", " ")}
          </p>
          ${complaint.adminNote ? `<p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">${complaint.adminNote}</p>` : ""}
        </div>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${env.frontendUrl}/citizen/complaints"
             style="background: #16a34a; color: #fff; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; font-weight: bold;">
            View Complaint
          </a>
        </div>
      </div>
      <div style="padding: 16px; text-align: center; background: #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} Smart Village Management.
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to: user.email, subject, html });
};

/*
|--------------------------------------------------------------------------
| Job Application Status Email
|--------------------------------------------------------------------------
*/

const sendJobApplicationStatusEmail = async (user, job, application) => {
  const statusMessages = {
    pending: "Your application has been received and is under review.",
    reviewed: "Your application has been reviewed by the employer.",
    shortlisted: "Congratulations! You have been shortlisted for this position.",
    rejected: "Unfortunately, your application was not selected at this time.",
    hired: "Congratulations! You have been selected for this position!",
  };

  const subject = `Job Application Update: ${job.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #16a34a; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0;">Smart Village Management</h1>
      </div>
      <div style="padding: 32px; background: #f9fafb;">
        <h2 style="color: #111827;">Application Update</h2>
        <p style="color: #4b5563; margin-bottom: 4px;">
          <strong>Job:</strong> ${job.title}
        </p>
        <p style="color: #4b5563; margin-bottom: 16px;">
          <strong>Company:</strong> ${job.company}
        </p>
        <p style="color: #374151;">
          ${statusMessages[application.status] || "Your application status has been updated."}
        </p>
        ${application.adminNote ? `<p style="color: #6b7280; font-size: 14px; font-style: italic;">"${application.adminNote}"</p>` : ""}
        <div style="margin: 24px 0; text-align: center;">
          <a href="${env.frontendUrl}/citizen/dashboard"
             style="background: #16a34a; color: #fff; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; font-weight: bold;">
            View Applications
          </a>
        </div>
      </div>
      <div style="padding: 16px; text-align: center; background: #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} Smart Village Management.
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to: user.email, subject, html });
};

/*
|--------------------------------------------------------------------------
| New Notice Alert Email
|--------------------------------------------------------------------------
*/

const sendNewNoticeEmail = async (users, notice) => {
  // Batch: send to all recipients
  const emails = users.map((user) =>
    sendEmail({
      to: user.email,
      subject: `New Notice: ${notice.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #16a34a; padding: 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0;">Smart Village Management</h1>
          </div>
          <div style="padding: 32px; background: #f9fafb;">
            <h2 style="color: #111827;">New Notice: ${notice.title}</h2>
            <p style="color: #4b5563; line-height: 1.6;">${notice.content.substring(0, 300)}${notice.content.length > 300 ? "..." : ""}</p>
            <div style="margin: 24px 0; text-align: center;">
              <a href="${env.frontendUrl}/notices"
                 style="background: #16a34a; color: #fff; padding: 12px 24px;
                        text-decoration: none; border-radius: 6px; font-weight: bold;">
                Read Full Notice
              </a>
            </div>
          </div>
          <div style="padding: 16px; text-align: center; background: #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} Smart Village Management.
            </p>
          </div>
        </div>
      `,
    })
  );

  // Use allSettled so one failure doesn't abort others
  await Promise.allSettled(emails);
};

/*
|--------------------------------------------------------------------------
| Business Approval/Rejection Email
|--------------------------------------------------------------------------
*/

const sendBusinessStatusEmail = async (user, business) => {
  const isApproved = business.status === "approved";
  const subject = `Your Business "${business.name}" has been ${isApproved ? "Approved" : "Rejected"}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #16a34a; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0;">Smart Village Management</h1>
      </div>
      <div style="padding: 32px; background: #f9fafb;">
        <h2 style="color: #111827;">Business Registration Update</h2>
        <p style="color: #4b5563;">
          Your business <strong>${business.name}</strong> has been
          <strong style="color: ${isApproved ? "#16a34a" : "#ef4444"};">
            ${business.status}
          </strong>.
        </p>
        ${!isApproved && business.rejectionReason
          ? `<p style="color: #6b7280;">Reason: ${business.rejectionReason}</p>`
          : ""}
        ${isApproved
          ? `<div style="margin: 24px 0; text-align: center;">
               <a href="${env.frontendUrl}/business-owner/my-business"
                  style="background: #16a34a; color: #fff; padding: 12px 24px;
                         text-decoration: none; border-radius: 6px; font-weight: bold;">
                 View My Business
               </a>
             </div>`
          : ""}
      </div>
      <div style="padding: 16px; text-align: center; background: #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} Smart Village Management.
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to: user.email, subject, html });
};

module.exports = {
  sendWelcomeEmail,
  sendComplaintStatusEmail,
  sendJobApplicationStatusEmail,
  sendNewNoticeEmail,
  sendBusinessStatusEmail,
};
