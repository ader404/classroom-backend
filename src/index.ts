import express from "express";
import cors from "cors";
import subjectRoutes from "./routes/subjects";


const app = express();
const PORT = 8000;


if (!process.env.FRONTEND_URL) {
    throw new Error("FRONTEND_URL is not defined");
}



app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true

}));

app.use(express.json());

app.use('/api/subjects', subjectRoutes);

app.get("/", (req, res) => {
    res.send("Hello welcom to the classroom API!");
});

app.listen(PORT, () => {
    console.log(`Server started running on port ${PORT}`);
});