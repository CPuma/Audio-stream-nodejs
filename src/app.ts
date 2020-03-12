import express from "express";
import morgan from "morgan";
import cors from "cors";
import trackRouter from './routes/tracks.routes'

// Initializations
const app = express();

// configs
app.set("port", 3000);

// Middlewares
app.use(morgan("dev"));
app.use(cors());

// Routes
app.use('/api/tracks',trackRouter)

// Exports
export default app;
