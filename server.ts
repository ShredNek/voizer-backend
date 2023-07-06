import express, { Request, Response } from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import { MailOptions } from "nodemailer/lib/json-transport";
import { InvoiceFields } from "../frontend/interfaces/invoices";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
const port = process.env.EXPRESS_PORT;

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.SMTP_HOST as string,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_KEY as string,
  },
});

app.post("/send", async (req: Request, res: Response) => {
  const invoiceDetails = req.body.invoiceDetails as InvoiceFields;
  const mailOptions: MailOptions = {
    // from: '"Daniel from Voizer" <danielleemusic98@gmail.com>', // sender address
    from: `"${invoiceDetails.from.name} from Voizer" <${invoiceDetails.from.name}@voizer.com>`, // sender address
    to: invoiceDetails.to.email, // list of receivers
    subject: `Hi, ${invoiceDetails.to.name}! Please find your invoice from ${invoiceDetails.from.name} attached`, // Subject line
    text: "Thanks for doing business with us :)", // plain text body
    html: "<h1>Thanks for doing business with us :)</h1>", // html body
    attachments: [
      {
        filename: `#INV${invoiceDetails.invoiceNumber}.pdf`,
        content: req.body.encodedInvoice, // your base64 encoded pdf
        encoding: "base64",
        contentType: "application/pdf",
      },
    ],
  };

  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log("Error " + err);
      res.status(400).json({ status: "fail" });
    } else {
      console.log("Email sent successfully");
      res.status(200).json({ status: "success" });
    }
  });
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log(`Server is ready to take messages: ${success}`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
