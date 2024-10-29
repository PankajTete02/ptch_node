import express from 'express';
// import { sasurl } from '../controller/sasurl'; // Uncomment and use the correct path to your sasurl function
import { jwtMiddleware } from '../middleware/jwtMiddelware'; // Correct path to jwtMiddleware function
import { dashboard } from '../controller/Dashboard/dashboard'; // Correct path to dashboard controller
import { inserPitchCategory } from '../controller/PitchCategory/pitchCategory';
import { updatePitchCategory } from '../controller/PitchCategory/pitchCategory';
import { deletePitchCategory } from '../controller/PitchCategory/pitchCategory';
import { getAllPitchCategory } from '../controller/PitchCategory/pitchCategory';
import { getCategoryById } from '../controller/PitchCategory/pitchCategory';
import { videos } from '../controller/Video/video'; // Correct path to video controller
import {generateSASTokens} from '../controller/SasUrl/sasUrl'


const router = express.Router();

// Route for Google SSO login
router.get('/login/sso/google', (req, res) => {
    // Handle Google SSO login logic here
    res.send('Google SSO login endpoint');
});

// Route for SAS URL generation (if needed)


// Route for dashboard access
router.get('/dashboard', jwtMiddleware, dashboard); // Adjust according to your controller logic
router.post('/insertPitchCategory', jwtMiddleware, inserPitchCategory);
// In your router setup
router.put('/updateCategory', jwtMiddleware, updatePitchCategory);

router.post('/deletePitchCategory', jwtMiddleware ,deletePitchCategory);

router.post('/getAllpitchCategory', jwtMiddleware ,getAllPitchCategory);

router.post('/getCategoryById', jwtMiddleware ,getCategoryById);

router.post('/videos', jwtMiddleware, videos);

router.get('/sasurl', jwtMiddleware, generateSASTokens);

export default router;
