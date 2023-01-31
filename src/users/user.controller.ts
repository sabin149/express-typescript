import * as express from "express";
import postModel from "../posts/posts.model";
import Controller from "../interfaces/controller.interface";
import authMiddleware from "../middleware/auth.middleware";
import NotAuthorizedException from "../exceptions/NotAuthorizedException";

class UsersController implements Controller {
  public path = "/users";
  public router = express.Router();
  private post = postModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/:id/posts`,
      authMiddleware,
      this.getAllPostsOfUser
    );
  }

  private getAllPostsOfUser = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const userId = request.params.id;
    if (userId === request.user._id.toString()) {
      const posts = await this.post.find({ author: userId }).exec();
      response.status(200).json({ posts });
    }
    next(new NotAuthorizedException());
  };
}

export default UsersController;
