import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JsonContentTypeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.path.startsWith('/v') && req.headers['content-type'] !== 'application/json') {
      throw new BadRequestException('Unsupported content type.');
    }
    next();
  }
}