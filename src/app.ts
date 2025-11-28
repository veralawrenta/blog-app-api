import cors from "cors";
import express, { Express } from "express";
import { PORT } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import { SampleRouter } from "./modules/sample/sample.router";
import { AuthRouter } from "./modules/auth/auth.router";
import { BlogRouter } from "./modules/blogs/blog.router";
import { TransactionRouter } from "./modules/transaction/transaction.router";
import { initScheduler } from "./scripts";

export class App {
  app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
    initScheduler();
  }

  private configure() {
    this.app.use(express.json());
    this.app.use(cors());
  }

  private routes() {
    const sampleRouter = new SampleRouter();
    const authRouter = new AuthRouter();
    const blogRouter = new BlogRouter();
    const transactionRouter = new TransactionRouter();

    this.app.use("/samples", sampleRouter.getRouter());
    this.app.use("/auth", authRouter.getRouter())
    this.app.use("/blogs", blogRouter.getRouter())
    this.app.use("/blogs", transactionRouter.getRouter())
  }

  private handleError() {
    this.app.use(errorMiddleware);
  }

  start() {
    this.app.listen(PORT, () => {
      console.log(`Server running on port : ${PORT}`);
    });
  }
}
