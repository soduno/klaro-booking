import { config as loadEnvironment } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'argon2';
import { PrismaClient } from '../src/generated/prisma/client';

loadEnvironment({ path: '../.env' });

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
async function main() {
  const organization = await prisma.organization.upsert({
    where: { slug: 'klaro-demo' },
    update: {},
    create: { name: 'Klaro Demo', slug: 'klaro-demo' },
  });
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { organizationId: organization.id },
    create: { firstName: 'System', lastName: 'Admin', email: 'admin@example.com', passwordHash: await hash('ChangeMe123!'), role: 'ADMIN', organizationId: organization.id, emailVerifiedAt: new Date() },
  });
  const categoryDefinitions = [
    { name: 'Cars', slug: 'cars' },
    { name: 'Notebooks', slug: 'notebooks' },
    { name: 'Cameras', slug: 'cameras' },
    { name: 'Tools', slug: 'tools' },
  ];
  const categories = await Promise.all(categoryDefinitions.map((category) => prisma.category.upsert({
    where: { organizationId_name: { organizationId: organization.id, name: category.name } },
    update: {},
    create: { ...category, organizationId: organization.id },
  })));
  const categoryId = Object.fromEntries(categories.map((category) => [category.name, category.id]));
  await prisma.product.createMany({
    data: [
      { organizationId: organization.id, categoryId: categoryId.Cars, sku: 'CAR-VW-ID4', name: 'Volkswagen ID.4', description: 'Electric SUV', quantity: 2, metadata: { fuel: 'Electric', seats: 5, transmission: 'Automatic' } },
      { organizationId: organization.id, categoryId: categoryId.Notebooks, sku: 'NB-MBP-14', name: 'MacBook Pro 14″', description: 'Mobile workstation', quantity: 8, metadata: { cpu: 'Apple M4 Pro', ram: '24 GB', storage: '512 GB' } },
      { organizationId: organization.id, categoryId: categoryId.Cameras, sku: 'CAM-SONY-A7IV', name: 'Sony A7 IV Camera', description: 'Full-frame mirrorless camera body', quantity: 4, metadata: { sensor: '33 MP full-frame', mount: 'Sony E' } },
      { organizationId: organization.id, categoryId: categoryId.Tools, sku: 'TOOL-HAMMER-01', name: 'Rotary Hammer', description: 'Professional SDS-plus rotary hammer', quantity: 6, metadata: { power: '880 W', weight: '3.1 kg' } },
    ],
    skipDuplicates: true,
  });
}
main().finally(() => prisma.$disconnect());
