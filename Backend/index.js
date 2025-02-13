import {app} from "./app.js";
import connectDB from "./src/db/index.js";
import dotenv from "dotenv"
import { exec } from 'child_process';

dotenv.config();

// Kill process occupying port 8000 (for Windows)
exec('netstat -ano | findstr :8000', (err, stdout) => {
    if (stdout) {
        const pid = stdout.trim().split(/\s+/).pop();
        exec(`taskkill /PID ${pid} /F`, (err) => {
            if (!err) {
                console.log(`Killed process on port 8000`);
            }
        });
    }
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        })
    })
.catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })

