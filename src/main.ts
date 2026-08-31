import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'https://aubox.netlify.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);

  console.log(
    `✅ Servidor corriendo en http://localhost:${process.env.PORT || 3000}`,
  );
}

bootstrap().catch((error) => {
  console.error('❌ Error al iniciar el servidor:', error);
});
