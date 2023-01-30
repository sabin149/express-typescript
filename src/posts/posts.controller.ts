import * as express from "express";
import Post from "./post.interface";

class PostsController {
  public path = "/posts";
  public router = express.Router();
  private posts: Post[] = [
    {
      author: "John",
      content: "Lorem inspum",
      title: "Lorems",
    },
  ];
  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.post(this.path, this.createAPost);
  }

  getAllPosts = (_request: express.Request, response: express.Response) => {
    response.send(this.posts);
  };

  createAPost = (request: express.Request, response: express.Response) => {
    const { author, content, title } = request.body;
    const post: Post = {
      author,
      content,
      title,
    };
    this.posts.push(post);
    response.send(post);
  };
}

export default PostsController;
