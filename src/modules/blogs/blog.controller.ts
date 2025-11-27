import { Request, Response } from "express";
import { ApiError } from "../../utils/api-error";
import { BlogService } from "./blog.service";

export class BlogController {
    blogService: BlogService;

    constructor() {
        this.blogService = new BlogService();
    }
    createBlog = async (req: Request, res: Response) => {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const thumbnail = files.thumbnail?.[0];
        if (!thumbnail) throw new ApiError("Thumbnail is required", 400);
        const authUserId = Number(res.locals.user.id); // ambil user id dari isi token jwt
    
        const result = await this.blogService.createBlog(
          req.body,
          thumbnail,
          authUserId
        );
        return res.status(200).send(result);
      };
}