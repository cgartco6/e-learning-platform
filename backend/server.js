const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Database connection (using your Afrihost SQL database)
const db = mysql.createConnection({
    host: 'your-afrihost-mysql-host',
    user: 'your-username',
    password: 'your-password',
    database: 'your-database-name'
});

// AI Agents Manager
class AIAgentsManager {
    constructor() {
        this.agents = new Map();
        this.initializeAgents();
    }

    initializeAgents() {
        // Course Creation Agent
        this.agents.set('courseCreator', {
            name: 'CourseCreator AI',
            status: 'active',
            capabilities: ['content_generation', 'curriculum_design', 'assessment_creation']
        });

        // Marketing Agent
        this.agents.set('marketingAI', {
            name: 'Marketing AI',
            status: 'active',
            capabilities: ['social_media', 'content_creation', 'campaign_management']
        });

        // Chatbot Agent
        this.agents.set('chatbot', {
            name: 'Robyn AI',
            status: 'active',
            capabilities: ['customer_support', 'learning_assistance', 'continuous_learning']
        });
    }

    async generateCourseContent(topic, level, duration) {
        // This would integrate with AI APIs like OpenAI
        return {
            title: `AI-Generated Course: ${topic}`,
            outline: this.generateCourseOutline(topic, level, duration),
            modules: this.generateModules(topic, level, duration),
            assessments: this.generateAssessments(topic, level)
        };
    }

    generateCourseOutline(topic, level, duration) {
        // AI-generated course structure
        return [`Introduction to ${topic}`, `Advanced ${topic} Concepts`, `${topic} Practical Applications`];
    }

    generateModules(topic, level, duration) {
        // Generate module structure based on parameters
        return Array.from({length: 6}, (_, i) => ({
            title: `Module ${i+1}: ${topic} Fundamentals`,
            content: `AI-generated content for ${topic} module ${i+1}`,
            duration: '2 hours',
            resources: ['Video lectures', 'Interactive exercises', 'Reading materials']
        }));
    }

    generateAssessments(topic, level) {
        return {
            quizzes: [
                {
                    question: `What is the fundamental concept of ${topic}?`,
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    correctAnswer: 0
                }
            ],
            assignments: [
                {
                    title: `Practical ${topic} Project`,
                    description: `Create a real-world application using ${topic} principles`,
                    rubric: 'AI-generated assessment criteria'
                }
            ]
        };
    }
}

// Initialize AI Manager
const aiManager = new AIAgentsManager();

// Routes
app.get('/api/courses', async (req, res) => {
    try {
        const [courses] = await db.promise().query('SELECT * FROM courses WHERE status = "active"');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/generate-course', async (req, res) => {
    const { topic, level, duration } = req.body;
    
    try {
        const courseContent = await aiManager.generateCourseContent(topic, level, duration);
        res.json(courseContent);
    } catch (error) {
        res.status(500).json({ error: 'AI generation failed' });
    }
});

app.post('/api/process-payment', async (req, res) => {
    const { amount, method, courseId } = req.body;
    
    try {
        // Calculate payout (60% to owner, 40% to growth fund)
        const ownerPayout = amount * 0.6;
        const growthFund = amount * 0.4;
        
        // Record transaction
        await db.promise().query(
            'INSERT INTO transactions (amount, method, owner_payout, growth_fund) VALUES (?, ?, ?, ?)',
            [amount, method, ownerPayout, growthFund]
        );
        
        res.json({ 
            success: true, 
            ownerPayout, 
            growthFund,
            message: 'Payment processed successfully' 
        });
    } catch (error) {
        res.status(500).json({ error: 'Payment processing failed' });
    }
});

app.get('/api/dashboard-stats', async (req, res) => {
    try {
        const [revenue] = await db.promise().query(`
            SELECT 
                SUM(amount) as totalRevenue,
                SUM(owner_payout) as totalPayout,
                SUM(growth_fund) as totalGrowthFund
            FROM transactions
        `);
        
        const [students] = await db.promise().query('SELECT COUNT(*) as totalStudents FROM users WHERE role = "student"');
        
        res.json({
            totalRevenue: revenue[0].totalRevenue || 0,
            totalPayout: revenue[0].totalPayout || 0,
            totalGrowthFund: revenue[0].totalGrowthFund || 0,
            totalStudents: students[0].totalStudents
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`AI E-Learning Platform running on port ${PORT}`);
});
