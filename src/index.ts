import express from "express";
import "express-async-errors";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import helmet from "helmet";
import fileUpload from "express-fileupload";
import passport from "passport";
// middleware
import notFoundMiddleware from "./middleware/notFound";
import errorHandlerMiddleware from "./middleware/errorHandler";
import { workers } from "./jobs/workers";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { dbQueue, mailQueue, storageQueue } from "./jobs/queue";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { authRoutes } from "./routes/authRoutes";
import deserializeUser from "./middleware/deserializeUser";
import { uploadRoutes } from "./routes/uploadRoutes";
import { adminAuthRoutes } from "./routes/adminAuthRoutes";
import { blogRoutes } from "./routes/postRoutes";
import { siteRoutes } from "./routes/siteRoutes";
import { contactRoutes } from "./routes/contactRoutes";

app.use(helmet());

// app.set("trust proxy", true);
app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: ["set-cookie", "x-access-token"],
  })
);

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/queues");
const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullMQAdapter(mailQueue),
    new BullMQAdapter(dbQueue),
    new BullMQAdapter(storageQueue),
  ],
  serverAdapter: serverAdapter,
});
app.use("/queues", serverAdapter.getRouter());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(
  fileUpload({
    createParentPath: true,
  })
);
app.use(deserializeUser);
app.use("/", uploadRoutes);
app.use("/auth", authRoutes);
app.use("/blog", blogRoutes);
app.use("/site", siteRoutes);
app.use("/contact", contactRoutes);
app.use("/admin/auth", adminAuthRoutes);
app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

const port = process.env.PORT || 1337;
const start = async () => {
  try {
    const server = app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
    workers.init();
  } catch (error) {
    console.log(error);
  }
};

start();
