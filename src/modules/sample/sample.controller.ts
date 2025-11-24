import { Request, Response } from "express";
import { SampleService } from "./sample.service";

export class SampleController {
  sampleService: SampleService;

  constructor() {
    this.sampleService = new SampleService();
  }

  getSamples = async (req: Request, res: Response) => {
    const result = await this.sampleService.getSamples();
    return res.status(200).send(result);
  };
}
