// Create web server with express
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

// Create express app
const app = express();
// Use cors
app.use(cors());
// Use body-parser
app.use(bodyParser.json());

// Store comments
const commentsByPostId = {};

// Handle events from event bus
app.post('/events', (req, res) => {
    const { type, data } = req.body;
    // Handle comment creation event
    if (type === 'CommentCreated') {
        const { id, content, postId, status } = data;
        // Store comment
        commentsByPostId[postId] = commentsByPostId[postId] || [];
        commentsByPostId[postId].push({ id, content, status });
    }
    // Handle comment moderation event
    if (type === 'CommentModerated') {
        const { postId, id, status, content } = data;
        // Find comment
        const comment = commentsByPostId[postId].find(comment => {
            return comment.id === id;
        });
        // Update comment status
        comment.status = status;
        // Send comment moderation event
        axios.post('http://localhost:4005/events', {
            type: 'CommentUpdated',
            data: {
                id,
                status,
                postId,
                content
            }
        });
    }
    // Send response
    res.send({});
});

// Handle requests for comments
app.get('/posts/:id/comments', (req, res) => {
    // Get comments
    const comments = commentsByPostId[req.params.id] || [];
    // Send comments
    res.send(comments);
});

// Listen for requests
app.listen(4001, () => {
    console.log('Listening on port 4001');
});
