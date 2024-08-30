require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const quizRoutes = require('./routes/quiz');
const path = require('path');
const commentRoutes = require('./routes/comments');

// 環境変数を読み込む
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('SECRET_KEY:', process.env.SECRET_KEY);
console.log('GCLOUD_PROJECT_ID:', process.env.GCLOUD_PROJECT_ID);
console.log('GCLOUD_BUCKET_NAME:', process.env.GCLOUD_BUCKET_NAME);
console.log('GCLOUD_KEY_FILE:', process.env.GCLOUD_KEY_FILE);

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDBに接続
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5秒
        socketTimeoutMS: 45000, // 45秒
    })
    .then(() => console.log("Database connected!"))
    .catch(err => console.log('MongoDB connection error:', err));

// ミドルウェアの設定
app.use(bodyParser.json());
app.use(cors());
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } // プロダクション環境ではセキュアクッキーを使用
}));

// ルートの設定
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/comments', commentRoutes);

// 静的ファイルとアップロードされた画像の提供
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

// catch-allルートでフロントエンドアプリを提供
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// サーバーを起動
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
