import "dotenv/config";
import validateEnv from "./utils/validateEnv";
import App from "./app";
import PostsController from "./posts/posts.controller";
import AuthenticationController from "./authentication/authentication.controller";
import UsersController from "./users/user.controller";
import ReportController from "./report/report.controller";

validateEnv();

const app = new App([
  new PostsController(),
  new AuthenticationController(),
  new UsersController(),
  new ReportController(),
]);
app.listen();
