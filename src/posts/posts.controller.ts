import PostNotFoundException from "../exceptions/PostNotFoundException";
import * as express from "express";
import Controller from "interfaces/controller.interface";
import Post from "./post.interface";
import postModel from "./posts.model";
import validationMiddleware from "../middleware/validation.middleware";
import CreatePostDto from "./post.dto";
import authMiddleware from "../middleware/auth.middleware";

class PostsController implements Controller {
  public path = "/posts";
  public router = express.Router();
  private post = postModel;

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router
      .get(this.path, this.getAllPosts)
      .get(`${this.path}/:id`, this.getPostById);
    this.router
      .all(`${this.path}/*`, authMiddleware)
      .patch(
        `${this.path}/:id`,
        validationMiddleware(CreatePostDto, true),
        this.modifyPost
      )
      .delete(`${this.path}/:id`, this.deletePost)
      .post(
        this.path,
        authMiddleware,
        validationMiddleware(CreatePostDto),
        this.createPost
      );
  }

  private getAllPosts = async (
    _req: express.Request,
    res: express.Response
  ) => {
    try {
      const posts = await this.post
        .find()
        .select("-__v")
        .populate("author", "-password -__v")
        .lean()
        .exec();

      res.status(200).json({ posts });
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  private getPostById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { id } = req.params;
    try {
      const post = await this.post
        .find()
        .select("-__v")
        .populate("author", "-password -__v")
        .lean()
        .exec();

      if (!post) {
        throw new PostNotFoundException(id);
      }
      res.status(200).json({ post });
    } catch (error) {
      next(error);
    }
  };

  private modifyPost = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { id } = req.params;
    const postData: Post = req.body;
    try {
      const post = await this.post
        .findByIdAndUpdate(id, postData, { new: true })
        .select("-__v")
        .exec();
      if (post) {
        res.status(201).json({ post });
      } else {
        next(new PostNotFoundException(id));
      }
    } catch (error) {
      next(error);
    }
  };

  private createPost = async (req: express.Request, res: express.Response) => {
    const postData: CreatePostDto = req.body;
    const createdPost = new this.post({
      ...postData,
      author: req.user._id,
    });
    try {
      const savedPost = await createdPost.save();
      await savedPost.populate("author", "-password");
      res.status(201).json({ savedPost });
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  private deletePost = async (
    req: express.Request,
    res: express.Response,
    next: express.NestFunction
  ) => {
    const { id } = req.params;
    try {
      const successResponse = await this.post.findByIdAndDelete(id);
      if (successResponse) {
        res.status(201).json({ message: "Post deleted successfully" });
      } else {
        next(new PostNotFoundException(id));
      }
    } catch (error) {
      next(error);
    }
  };
}

export default PostsController;
