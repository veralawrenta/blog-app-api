import cors from "cors";
import express, { Express } from "express";
import { PORT } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import { SampleRouter } from "./modules/sample/sample.router";

export class App {
  app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure() {
    this.app.use(express.json());
    this.app.use(cors());
  }

  private routes() {
    const sampleRouter = new SampleRouter();

    this.app.use("/samples", sampleRouter.getRouter());
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
