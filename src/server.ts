import "dotenv/config";
import validateEnv from "./utils/validateEnv";
import App from "./app";
import PostsController from "./posts/posts.controller";

validateEnv();

const app = new App([new PostsController()]);
app.listen();
