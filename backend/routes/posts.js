const express = require('express');
const Post = require('../models/Post');
const adminAuthMiddleware = require('../middleware/adminAuth');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const router = express.Router();

const dotenv = require('dotenv');
dotenv.config();

console.log('GCLOUD_PROJECT_ID:', process.env.GCLOUD_PROJECT_ID);
console.log('GCLOUD_BUCKET_NAME:', process.env.GCLOUD_BUCKET_NAME);
console.log('GCLOUD_KEY_FILE:', process.env.GCLOUD_KEY_FILE);

const storage = new Storage({
    projectId: process.env.GCLOUD_PROJECT_ID,
    keyFilename: path.join(__dirname, '../config/gorohachi-app-key.json'),
});

const bucketName = process.env.GCLOUD_BUCKET_NAME;
if (!bucketName) {
    throw new Error('A bucket name is needed to use Cloud Storage.');
}

const bucket = storage.bucket(bucketName);

const upload = multer({
    storage: multer.memoryStorage(),
});

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send('Server error');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).send('Server error');
    }
});

router.post('/', adminAuthMiddleware, upload.single('image'), async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);

        const { title, summary, content } = req.body;
        let imageUrl = null;

        if (req.file) {
            const image = req.file;
            const blob = bucket.file(`uploads/${Date.now()}-${image.originalname}`);
            const blobStream = blob.createWriteStream({
                resumable: false,
                contentType: image.mimetype,
            });

            const streamFinishPromise = new Promise((resolve, reject) => {
                blobStream.on('finish', () => {
                    imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                    console.log('Image URL:', imageUrl);  // 追加: アップロード成功時のURLを表示
                    resolve();
                });
                blobStream.on('error', (err) => {
                    console.error('Error uploading image:', err);  // 追加: エラー発生時のログ
                    reject(err);
                });
            });

            blobStream.end(image.buffer);
            await streamFinishPromise;
        }

        // ここで新しいPostを作成し、DBに保存する
        const post = new Post({
            title,
            summary,
            content,
            image: imageUrl
        });

        await post.save();
        console.log('Post saved successfully');  // 追加: 投稿が正常に保存されたことを確認
        res.status(201).send('Post created');
    } catch (error) {
        console.error('Error creating post:', error);  // エラーログの強化
        res.status(500).send('Server error');
    }
});

module.exports = router;

