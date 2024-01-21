import express from "express";
import morgan from "morgan";
import cors from "cors";
import { albumRouter, musicianRouter } from "./routes/resourceRoutes.js";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
const { MONGODB_URI } = process.env;
const PORT = process.env.PORT || 3000;

//CONFIGURAZIONI
const app = express();
app.use(morgan("dev"));
app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/albums", albumRouter);
app.use("/musicians", musicianRouter);

//SERVER
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log(`Connected to Mongoose`);
        app.listen(PORT, () => {
            console.log(`Server connected at PORT ${PORT}`);
        });
    })
    .catch((error) => console.error(error));

export default app;
