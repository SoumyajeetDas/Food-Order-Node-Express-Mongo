const nodemailer = require('nodemailer');

const sendEmail = async (options) => {


    // Chack with dedicated email addresses
    // const transporter = nodemailer.createTransport({
    //     service:'Gmail',
    //     auth: {
    //         user: process.env.EMAIL_USERNAME,
    //         pass: process.env.EMAIL_PASSWORD
    //     }
    // });

    // This is checking in MailTrapper
    var transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "9a9b5dd59b8564",
            pass: "ca625243176eab"
        }
    });

    const mailOptions = {
        from: 'Jonas Schmedtmann <hello@jonas.io>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }


    await transporter.sendMail(mailOptions);
}


module.exports = sendEmail;