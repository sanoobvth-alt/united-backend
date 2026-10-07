import "dotenv/config";
import bcrypt from "bcrypt";
import { ADMIN } from "../src/constants/roles.js";
import {
  trendingTags,
  blogCategoryData,
  courseCategoryData,
} from "../src/constants/data.js";
import prisma from "../src/config/prisma.js";
import toSlug from "../src/utils/toSlug.js";

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("✓ Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      firstName: "Super",
      lastName: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: ADMIN,
      isActive: true,
    },
  });

  console.log("✅ Admin created successfully");
}

async function seedTags() {
  console.log("\n🌱 Seeding trending blog tags...");

  let created = 0;
  let skipped = 0;

  for (const tagName of trendingTags) {
    const slug = toSlug(tagName);

    try {
      const existingTag = await prisma.tag.findUnique({
        where: { name: tagName },
      });

      if (existingTag) {
        skipped++;
      } else {
        await prisma.tag.create({
          data: {
            name: tagName,
            slug: slug,
          },
        });
        created++;
        console.log(`  ✅ Created: ${tagName}`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing tag "${tagName}":`, error.message);
    }
  }

  console.log(`\n📊 Tags seeding summary:`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped (already exist): ${skipped}`);
  console.log(`  Total: ${created + skipped}`);
}

async function seedBlogCategories() {
  console.log("\n🌱 Seeding blog categories...");

  let created = 0;
  let skipped = 0;

  for (const category of blogCategoryData) {
    try {
      const existingCategory = await prisma.blogCategory.findUnique({
        where: { slug: category.slug },
      });

      if (existingCategory) {
        skipped++;
      } else {
        await prisma.blogCategory.create({
          data: {
            name: category.name,
            slug: category.slug,
          },
        });
        created++;
        console.log(`  ✅ Created: ${category.name}`);
      }
    } catch (error) {
      console.error(
        `  ❌ Error processing blog category "${category.name}":`,
        error.message,
      );
    }
  }

  console.log(`\n📊 Blog categories seeding summary:`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped (already exist): ${skipped}`);
  console.log(`  Total: ${created + skipped}`);
}

async function seedCourseCategories() {
  console.log("\n🌱 Seeding course categories...");

  let created = 0;
  let skipped = 0;

  for (const category of courseCategoryData) {
    try {
      const existingCategory = await prisma.courseCategory.findUnique({
        where: { slug: category.slug },
      });

      if (existingCategory) {
        skipped++;
      } else {
        await prisma.courseCategory.create({
          data: {
            name: category.name,
            slug: category.slug,
            image: "", // Placeholder image URL
          },
        });
        created++;
        console.log(`  ✅ Created: ${category.name}`);
      }
    } catch (error) {
      console.error(
        `  ❌ Error processing course category "${category.name}":`,
        error.message,
      );
    }
  }

  console.log(`\n📊 Course categories seeding summary:`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped (already exist): ${skipped}`);
  console.log(`  Total: ${created + skipped}`);
}

async function main() {
  console.log("🚀 Starting database seeding...\n");
  await seedAdmin();
  await seedTags();
  await seedBlogCategories();
  await seedCourseCategories();
  console.log("\n✨ All seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
