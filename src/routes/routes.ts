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
import {LoginGoogleSSO} from '../controller/LoginGoogleSSO/LoginGoogleSSO'
import {login} from '../controller/LoginGoogleSSO/auth'
import { verifyJwt } from '../controller/LoginGoogleSSO/jwtauth';
import { log } from 'console';

const router = express.Router();

// Route for Google SSO login
router.get('/login/sso/google', (req, res) => {
    // Handle Google SSO login logic here
    res.send('Google SSO login endpoint');
});

// Route for SAS URL generation (if needed)


// Route for dashboard access
router.post('/login/sso/google' ,LoginGoogleSSO)
router.post('/login', login);
router.get('/dashboard', dashboard); // Adjust according to your controller logic
router.post('/insertPitchCategory', inserPitchCategory);
// In your router setup
router.post('/updateCategory', updatePitchCategory);

router.post('/deletePitchCategory' ,deletePitchCategory);

router.post('/getAllpitchCategory',getAllPitchCategory);

router.post('/getCategoryById' ,getCategoryById);

router.post('/videos', videos);

router.get('/sasurl', generateSASTokens);

export default router;
