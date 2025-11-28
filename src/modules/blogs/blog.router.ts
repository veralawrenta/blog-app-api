import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { UploaderMiddleware } from "../../middlewares/uploader.middleware";
import { BlogController } from "./blog.controller";
import { Router } from "express";

export class BlogRouter {
  router: Router;
  blogController: BlogController;
  jwtMiddleware: JwtMiddleware;
  uploaderMiddleware: UploaderMiddleware;

  constructor() {
    this.router = Router();
    this.blogController = new BlogController();
    this.jwtMiddleware = new JwtMiddleware();
    this.uploaderMiddleware = new UploaderMiddleware();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get("/", this.blogController.getBlogs);
    this.router.get("/:id", this.blogController.getBlog);
    this.router.post(
      "/",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.uploaderMiddleware
        .upload()
        .fields([{ name: "thumbnail", maxCount: 1 }]),
      this.blogController.createBlog
    );
  };

  getRouter = () => {
    return this.router;
  };
}
