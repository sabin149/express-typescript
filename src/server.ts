import "dotenv/config";
import App from "./app";
import mongoose from "mongoose";
import PostsController from "./posts/posts.controller";
import validateEnv from "utils/validateEnv";

validateEnv();
const { MONGO_URI, PORT } = process.env;

mongoose.connect(MONGO_URI);

const app = new App([new PostsController()], PORT);
app.listen();
