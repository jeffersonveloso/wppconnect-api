import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';

const server: express.Express = express();
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

async function bootstrap(expressInstance: express.Express) {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  app.setGlobalPrefix('rest');

  const options = new DocumentBuilder()
    .setTitle('WppConnect Server')
    .setDescription('Backend WppConnect')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('rest', app, document);

  app.enableCors();
  await app.init();
  await app.listen(3000);
}

bootstrap(server);
