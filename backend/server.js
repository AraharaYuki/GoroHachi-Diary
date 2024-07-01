const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('YOUR_MONGODB_URI', { useNewUrlParser: true, useUnifiedTopology: true });

const Post = mongoose.model('Post', { content: String });

app.use(bodyParser.json());
app.use(cors());
app.use(session({
    secret: 'SECRET_KEY',
    resave: false,
    saveUninitialized: true
}));

app.use('/api/auth', authRoutes);

app.post('/api/posts', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }
    const post = new Post({ content: req.body.content });
    post.save().then(() => res.json({ message: 'Post saved!' }));
});

app.get('/api/posts', (req, res) => {
    Post.find().then(posts => res.json(posts));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
