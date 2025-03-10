require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// Basic request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// Simple CORS configuration
app.use(cors());

// Enable pre-flight requests for all routes
app.options('*', cors());

// Middleware
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).json({ status: 'healthy' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Email schema
const emailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Email = mongoose.model('Email', emailSchema);

// Email transporter - only create if SMTP is enabled
let transporter = null;
console.log('SMTP Enabled:', process.env.SMTP_ENABLED);

if (process.env.SMTP_ENABLED === 'true') {
    console.log('Initializing SMTP transporter');
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
} else {
    console.log('SMTP is disabled - email notifications will be skipped');
}

// Discord webhook notification function
async function sendDiscordNotification(email) {
    if (process.env.DISCORD_WEBHOOK_ENABLED !== 'true' || !process.env.DISCORD_WEBHOOK_URL) {
        console.log('Discord webhook is disabled or not configured');
        return;
    }

    try {
        const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [{
                    title: '🎉 New Paradox Subscription!',
                    description: `Someone just subscribed to the newsletter!\n\n**Email:** ${email}`,
                    color: 0xFF3366, // Paradox pink color
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: 'Paradox Newsletter'
                    }
                }]
            })
        });

        if (response.ok) {
            console.log('Discord notification sent successfully');
        } else {
            console.error('Failed to send Discord notification:', await response.text());
        }
    } catch (error) {
        console.error('Error sending Discord notification:', error);
    }
}

// Routes
app.post('/api/subscribe', async (req, res) => {
    console.log('Received subscription request:', req.body);
    try {
        const { email } = req.body;
        
        // Save to database
        const newEmail = new Email({ email });
        await newEmail.save();
        console.log('Email saved to database:', email);

        // Send Discord notification
        await sendDiscordNotification(email);

        // Skip email notification if SMTP is disabled
        if (process.env.SMTP_ENABLED !== 'true') {
            console.log('SMTP is disabled - skipping notification');
            res.status(200).json({ message: 'Subscription successful' });
            return;
        }

        // Only try to send email if transporter exists
        if (transporter) {
            try {
                await transporter.sendMail({
                    from: process.env.SMTP_USER,
                    to: process.env.NOTIFICATION_EMAIL,
                    subject: 'New Paradox Subscription',
                    text: `New subscription from: ${email}`,
                    html: `<p>New subscription from: <strong>${email}</strong></p>`
                });
                console.log('Notification email sent');
            } catch (emailError) {
                console.error('Failed to send notification email:', emailError);
                // Don't fail the subscription just because notification failed
            }
        }

        res.status(200).json({ message: 'Subscription successful' });
    } catch (error) {
        console.error('Error processing subscription:', error);
        if (error.code === 11000) { // Duplicate key error
            res.status(400).json({ message: 'Email already subscribed' });
        } else {
            res.status(500).json({ message: 'Subscription failed' });
        }
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Email notifications: ${process.env.SMTP_ENABLED === 'true' ? 'enabled' : 'disabled'}`);
    console.log(`Discord notifications: ${process.env.DISCORD_WEBHOOK_ENABLED === 'true' ? 'enabled' : 'disabled'}`);
});
