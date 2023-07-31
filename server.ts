import express, { Request, Response } from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import { MailOptions } from "nodemailer/lib/json-transport";
import { InvoiceFields } from "../frontend/interfaces/invoices";
import { EmailEndpointParameter } from "../frontend/interfaces/emails";

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
  const userRequest = req.body as EmailEndpointParameter;
  const invoiceDetails = userRequest.invoiceDetails as InvoiceFields;

  const mailOptions: MailOptions = {
    from: `"${invoiceDetails.from.name} from Voizer"`, // sender address
    to: invoiceDetails.to.email, // list of receivers
    subject: `Please find your invoice from ${invoiceDetails.from.name} attached`, // Subject line
    text: `Hi, ${invoiceDetails.to.name}! If you have any questions regarding the receipt of this invoice, please contact ${invoiceDetails.from.name} @ <${invoiceDetails.from.email}>. \nThank you for your business `, // plain text body
    attachments: [
      {
        filename: `#INV${invoiceDetails.invoiceNumber}.pdf`,
        content: userRequest.encodedInvoice, // your base64 encoded pdf
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
