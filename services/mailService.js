const nodemailer = require('nodemailer');

async function sendMail({from, to, subject, text, html}){

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        host: process.env.WEALTHMAKER_SMTP_HOST,
        port: process.env.WEALTHMAKER_SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USERNAME, // generated ethereal user
            pass: process.env.EMAIL_PASSWORD, // generated ethereal password
        },
    });

    var mailOptions = {
        from: `BajajCapital <${from}>`,
        to: to,
        subject: subject,
        text: text,
        html: html
        // attachments: [
        //   {filename : 'result.pdf', path: 'result.pdf'}
        // ]
    };
    
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Email sent: ', info);
        }
    })
}



module.exports = sendMail;