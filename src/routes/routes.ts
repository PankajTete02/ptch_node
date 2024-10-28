import express from 'express';
// import { sasurl } from '../controller/sasurl'; // Uncomment and use the correct path to your sasurl function
import { jwtMiddleware } from '../middleware/jwtMiddelware'; // Correct path to jwtMiddleware function
import { dashboard } from '../controller/Dashboard/dashboard'; // Correct path to dashboard controller

const router = express.Router();

// Route for Google SSO login
router.get('/login/sso/google', (req, res) => {
    // Handle Google SSO login logic here
    res.send('Google SSO login endpoint');
});

// Route for SAS URL generation (if needed)
// router.get('/sasurl', jwtMiddleware, sasurl); // Uncomment if needed and add jwtMiddleware

// Route for dashboard access
router.get('/', jwtMiddleware, dashboard); // Adjust according to your controller logic

export default router;
