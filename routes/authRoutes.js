import {Router} from 'express';
import {body, validationResult} from 'express-validator';
import AuthController from '../controllers/AuthController.js'
import authMiddleware from '../middleware/authMiddleware.js'


const authRouter = new Router()

authRouter.post('/registration',
    body('email', 'Uncorrected email').isEmail(),
    body('password', 'Password must be longer than 3 and shorter than 12').isLength({min: 3, max: 32}),
    AuthController.registration)
authRouter.post('/login',
    AuthController.login)
authRouter.post('/logout',
    AuthController.logout)
authRouter.get('/activate/:link',
    AuthController.activateLink)
authRouter.get('/refresh',
    AuthController.refresh)
authRouter.get('/users',authMiddleware,
    AuthController.getUsers)

authRouter.post('/',)


export default authRouter;