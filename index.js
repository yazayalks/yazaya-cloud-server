import express from 'express';
import dotenv from 'dotenv'
dotenv.config({path: '.env.local'})
import mongoose from 'mongoose';
import authRouter from "./routes/authRoutes.js";
import cookieParser  from 'cookie-parser'
import cors from 'cors'
import errorMiddleware from "./middleware/errorMiddleware.js";
import filePathMiddleware from "./middleware/filePathMiddleware.js";
import fileRouter from "./routes/fileRouters.js";
import fileUpload from 'express-fileupload'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

mongoose.set('strictQuery', true);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);


const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT;
console.log(PORT)

const app = express();

app.use(fileUpload({}))
app.use(express.json())
app.use(express.static('static'))
app.use(cookieParser());
app.use(cors(
    {
        credentials: true,
        origin: process.env.CLIENT_HOST,
    }

));
app.use(filePathMiddleware(path.join(__dirname)))
app.use('/api/auth', authRouter)
app.use('/api/files', fileRouter)


app.use(errorMiddleware);


async function startApp() {
    try {
        await mongoose.connect(DB_URL);
        app.listen(PORT, () => console.log('SERVER STARTED ON PORT ' + PORT))
    }
    catch (e) {
        console.log(e);
    }
}

startApp()
