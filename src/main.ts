import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './shared/api/all-exceptions.filter';
import { JsonContentTypeMiddleware } from './shared/api/json-content-type-middleware';
import { ResponseInterceptor } from './shared/api/response.interceptor';
import mongoose from 'mongoose';

async function bootstrap() {
  console.log('Starting application...');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:8080', // Replace with the port of your other localhost application
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Apply the global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());
  // Apply the global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  app.use(new JsonContentTypeMiddleware().use);

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI, // Use URI versioning (/v1/endpoint)
    defaultVersion: '1', // Optional: Set a default version
  });

  const config = new DocumentBuilder()
    .setTitle('Peer Feedback API')
    .setDescription('API documentation for Peer Feedback')
    .setVersion('0.3.2')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);

  mongoose.set('strictPopulate', false); // Disable strict populate check
  await app.listen(process.env.PORT ?? 3000);
  console.log('Application is running on port', process.env.PORT ?? 3000);
}
bootstrap();
