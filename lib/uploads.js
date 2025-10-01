const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { DATA_DIR } = require('./database');

const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const base = sanitizeFilename(file.originalname || 'file');
        cb(null, `${timestamp}-${base}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'model/gltf-binary',
            'application/octet-stream',
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Недопустимый тип файла'));
        }
    },
});

function toPublicUrl(filename) {
    return `/uploads/${filename}`;
}

module.exports = {
    upload,
    UPLOAD_DIR,
    toPublicUrl,
};
