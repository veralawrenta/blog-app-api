import { Prisma } from "../../generated/prisma/client";
import { ApiError } from "../../utils/api-error";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBlogDTO } from "./dto/create-blog.dto";
import { GetBlogsDTO } from "./dto/get-blogs.dto";

export class BlogService {
  prisma: PrismaService;
  cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
  }

  createBlog = async (
    body: CreateBlogDTO,
    thumbnail: Express.Multer.File,
    authUserId: number
  ) => {
    // 1. cari dulu data blog di db berdasarkan title sudah ada apa belom
    const blog = await this.prisma.blog.findFirst({
      where: { title: body.title },
    });

    // 2. kalo sudah ada throw error
    if (blog) {
      throw new ApiError("title already exist", 400);
    }

    // 3. upload thumbnail ke cloudinary
    const { secure_url } = await this.cloudinaryService.upload(thumbnail);

    // 4. create data blog baru
    await this.prisma.blog.create({
      data: { ...body, thumbnail: secure_url, userId: authUserId },
    });

    return { message: "create blog success" };
  };

  getBlogs = async (query: GetBlogsDTO) => {
    const {page, sortBy, sortOrder, take, search} = query;

    const whereClause: Prisma.BlogWhereInput = {};

    if (search) {
      whereClause.title = { contains: search };
    }

    const blogs = await this.prisma.blog.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take: take,
    });

    const total = await this.prisma.blog.count({
      where: whereClause
    });

    return {
      data: blogs,
      meta: { page, take, total }, //informasi mengenai data2 yang dikirimkan
    };
  };

  getBlog = async (id: number) => {
    const blog = await this.prisma.blog.findFirst({
      where: { id },
      include: { 
        user: {
          omit: {
            password:true}
          }
        },
    });
    if (!blog) throw new ApiError ("blog not found", 404);
    return blog;
  }
}
