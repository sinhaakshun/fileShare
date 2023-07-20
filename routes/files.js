const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const {v4 : uuid4} = require('uuid');
const nodemailer = require('nodemailer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Set the destination directory for file uploads
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName); // Use the original filename for the uploaded file
    }
});

const upload = multer({ storage: storage });

router.post('/', (req, res)=> {
    //STORE FILE  
    upload.single('myfile')(req, res, async (err) => {
        //VALIDATE REQUEST
        if (!req.file) {
            return res.json({ message: 'Send a valid file' })
        }
        if (err) {
            return res.status(500).send({ error: err.message })
        }
        //STORE INTO DB
        const file = new File({
            filename: req.file.filename,
            uuid: uuid4(),
            path: req.file.path,
            size: req.file.size
        });

        const response = await file.save();
        return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });

    })
})

router.post('/send', async(req, res)=>{
    const {uuid, emailTo, emailFrom, expires} = req.body;

    if(!uuid || !emailFrom || !emailFrom){
        return res.status(422).send({error : 'all fields are needed'})
    }

    const file = await File.findOne({uuid : uuid});
    if(file.sender){
        return res.status(422).send({error : 'email already sent'})
    }

    file.sender = emailFrom;
    file.receiver = emailTo;

    const response = await file.save();

    //send email

    const sendMail = require('../services/mailService');
    sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'File sharing',
        text: `${emailFrom} shared a file with you.`,
        html : require('../services/emailTemplate')({
            emailFrom : emailFrom,
            downloadLink : `${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size : parseInt(file.size/1000) + 'KB',
            expires : '24 hours'
        })

    })
        .then(() => {
            return res.json({ success: true });
        }).catch(err => {
            return res.status(500).json({ error: err });
        });
})


module.exports = router;