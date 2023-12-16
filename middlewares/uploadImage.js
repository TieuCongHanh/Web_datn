const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: 'dsx9jangu',
    api_key: 623454983997955,
    api_secret: 'oT4pUcsYaUFYhz7tI_59NimI4Cw'
});

const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ['jpg', 'png'],
    folder: 'OutstandFood'
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;