import * as express from "express";
import Controller from "interfaces/controller.interface";
import Post from "./post.interface";
import postModel from "./posts.model";

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
    this.router.patch(`${this.path}/:id`, this.modifyPost);
    this.router.delete(`${this.path}/:id`, this.deletePost);
    this.router.post(this.path, this.createPost);
  }

  private getAllPosts = async (
    _req: express.Request,
    res: express.Response
  ) => {
    const posts = await this.post.find().select("-__v").lean().exec();
    return res.json({ posts });
  };

  private getPostById = async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const post = await this.post.findById(id).select("-__v").lean().exec();
    if (post) {
      res.json({ post });
    }
    res.status(404).send({ error: "Post Not Found" });
  };

  private modifyPost = async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const postData: Post = req.body;
    const post = await this.post
      .findByIdAndUpdate(id, postData, { new: true })
      .select("-__v")
      .exec();
    res.json({ post });
  };

  private createPost = async (req: express.Request, res: express.Response) => {
    const postData: Post = req.body;
    const createdPost = new this.post(postData);
    const savedPost = await createdPost.save();
    res.json({ savedPost });
  };

  private deletePost = async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const successResponse = await this.post.findByIdAndDelete(id).exec();
    if (successResponse) {
      res.status(200).send();
    }

    res.status(400).send();
  };
}

export default PostsController;
