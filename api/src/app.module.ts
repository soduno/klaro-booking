import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnvironment } from 'dotenv';
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CustomersModule } from './modules/customers/customers.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { validateEnvironment } from './config/environment';

const environmentFile = [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../.env')].find(existsSync);
if (!environmentFile) throw new Error('Unable to find the root .env file');
loadEnvironment({ path: environmentFile, quiet: true });

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, validate: validateEnvironment }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BookingsModule,
    ProductsModule,
    OrganizationsModule,
    CategoriesModule,
    CustomersModule,
  ],
})
export class AppModule {}
