import nodemailer from "nodemailer";

type EAddress =
  | "contact@bayah.app"
  | "invoice@bayah.app"
  | "expense@bayah.app"
  | "notification@bayah.app"
  | "support@bayah.app"
  | "verify@bayah.app";

const getTransporter = (sendFrom: EAddress) => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: sendFrom,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

interface ISendMail {
  from: EAddress;
  fromName?: string;
  to: string | string[];
  subject: string;
  html: string;
  attachments?: any;
}

const sendMail = async ({
  from,
  fromName = "Bayah",
  to,
  subject,
  html,
  attachments,
}: ISendMail) => {
  const mailOptions = {
    from: `"${fromName}" <${from}>`,
    to: process.env.NODE_ENV === "production" ? to : "avikhandakar@gmail.com",
    subject: subject,
    html: html,
    ...(attachments && {
      attachments: attachments,
    }),
  };
  const transporter = getTransporter(from);
  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(info);
        resolve(info);
      }
    });
  });
};

export { sendMail };
