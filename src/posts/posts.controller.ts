import PostNotFoundException from "../exceptions/PostNotFoundException";
import * as express from "express";
import Controller from "interfaces/controller.interface";
import Post from "./post.interface";
import postModel from "./posts.model";
import validationMiddleware from "../middleware/validation.middleware";
import CreatePostDto from "./post.dto";

class PostsController implements Controller {
  public path = "/posts";
  public router = express.Router();
  private post = postModel;

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById);
    this.router.patch(
      `${this.path}/:id`,
      validationMiddleware(CreatePostDto, true),
      this.modifyPost
    );

    this.router.delete(`${this.path}/:id`, this.deletePost);
    this.router.post(
      this.path,
      validationMiddleware(CreatePostDto),
      this.createPost
    );
  }

  private getAllPosts = async (
    _req: express.Request,
    res: express.Response
  ) => {
    const posts = await this.post.find().select("-__v").lean().exec();
    return res.json({ posts });
  };

  private getPostById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { id } = req.params;
    const post = await this.post.findById(id).select("-__v").lean().exec();
    if (post) {
      res.json({ post });
    }
    next(new PostNotFoundException(id));
  };

  private modifyPost = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { id } = req.params;
    const postData: Post = req.body;
    const post = await this.post
      .findByIdAndUpdate(id, postData, { new: true })
      .select("-__v")
      .exec();
    if (post) {
      res.json({ post });
    }
    next(new PostNotFoundException(id));
  };

  private createPost = async (req: express.Request, res: express.Response) => {
    const postData: Post = req.body;
    const createdPost = new this.post(postData);
    const savedPost = await createdPost.save();
    res.json({ savedPost });
  };

  private deletePost = async (
    req: express.Request,
    res: express.Response,
    next: express.NestFunction
  ) => {
    const { id } = req.params;
    const successResponse = await this.post.findByIdAndDelete(id).exec();
    if (successResponse) {
      res.status(200).json({ message: "Deleted Successfully" });
    }
    next(new PostNotFoundException(id));
  };
}

export default PostsController;
