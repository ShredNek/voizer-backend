"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const port = process.env.EXPRESS_PORT;
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_KEY,
    },
});
app.post("/send", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userRequest = req.body;
    const invoiceDetails = userRequest.invoiceDetails;
    const mailOptions = {
        from: `"${invoiceDetails.from.name} from Voizer"`,
        to: invoiceDetails.to.email,
        subject: `Hi, ${invoiceDetails.to.name}! Please find your invoice from ${invoiceDetails.from.name} attached`,
        text: "Thanks for doing business with us :)",
        html: "<h1>Thanks for doing business with us :)</h1>",
        attachments: [
            {
                filename: `#INV${invoiceDetails.invoiceNumber}.pdf`,
                content: userRequest.encodedInvoice,
                encoding: "base64",
                contentType: "application/pdf",
            },
        ],
    };
    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            console.log("Error " + err);
            res.status(400).json({ status: "fail" });
        }
        else {
            console.log("Email sent successfully");
            res.status(200).json({ status: "success" });
        }
    });
}));
transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    }
    else {
        console.log(`Server is ready to take messages: ${success}`);
    }
});
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
