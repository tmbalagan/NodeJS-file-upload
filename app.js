const http = require('http');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const isEmpty = require('is-empty');
var PORT = 3000
var URL = "http://localhost/"
var DB_NAME = "userDetails"


app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'build')));
app.use('/uploads', express.static(__dirname + "/uploads"));


mongoose.connect("mongodb://localhost/" + DB_NAME, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('MongoDB connected')
}).catch((err) => {
    console.log('MongoDB err ', err);
});

const userSchema = new mongoose.Schema({
    name: String,
    mobileNo: String,
    status: { type: Number, default: 1 },// 1 is-Active, 0 is in-Active
    image: String,
}, { timestamps: true, versionKey: false });
var userModel = mongoose.model('user', userSchema)

var upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, callback) {
            var dir = './uploads';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            callback(null, dir);
        },
        filename: function (req, file, callback) {
            var ext = path.extname(file.originalname)
            callback(null, file.fieldname + '-' + Date.now() + ext);
        }
    }),
    fileFilter: function (req, file, callback) {
        console.log("innnnn ", file.originalname)
        var ext = path.extname(file.originalname)
        console.log("ext ", ext)

        if (ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('Only JPEG and JPG images allowed'), null)
        }
        callback(null, true)
    }
}).single('image');


app.post('/api/addUser', function (req, res) {
    upload(req, res, function (err) {
        if (err) return res.status(500).json({ "error": err.message });
        var data = {
            name: req.body.name,
            mobileNo: req.body.mobileNo,
            image: '/' + req.file.path.replace(/\\/g, "/")
        }
        userModel.findOne({ "mobileNo": req.body.mobileNo }, {}, function (err, doc) {
            if (!isEmpty(doc)) return res.status(200).json({ "error": "Mobile Number already exists" });
            userModel.create(data, function (err, doc) {
                if (err) {
                    res.status(500).json({ "error": err.message });
                } else {
                    res.status(200).json({ "status": "Success " })
                }
            });
        })

    });

})

app.post('/api/findUser', function (req, res) {
    console.log(req.body)
    if (isEmpty(req.body.mobileNo)) return res.status(200).json({ "error": "Mobile Number required" })
    userModel.findOne({ "mobileNo": req.body.mobileNo }, {}, function (err, doc) {
        if (err) {
            res.status(500).json({ "error": err.message });
        } else {
            res.status(200).json({ "status": "Success ", data: doc })
        }
    });
})


// catch 404 and forward to error handler
app.use((req, res, next) => {
    console.log(req.path)
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

http.createServer(app, () => {
    console.log('Server running at http://127.0.0.1:1337/');
}).listen(PORT);
