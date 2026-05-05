import "dotenv/config";
import { Role } from "../src/generated/prisma/enums";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Seeding database...");

  // Hash password
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: "danuadmin@gmail.com" },
    update: {},
    create: {
      name: "Ridwandanu Admin",
      email: "danuadmin@gmail.com",
      password: hash("admin123"),
      role: Role.ADMIN,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "danumanager@gmail.com" },
    update: {},
    create: {
      name: "Ridwandanu Admin",
      email: "danumanager@gmail.com",
      password: hash("manager123"),
      role: Role.MANAGER,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "danustaff@gmail.com" },
    update: {},
    create: {
      name: "Ridwandanu Staff",
      email: "danustaff@gmail.com",
      password: hash("staff123"),
      role: Role.STAFF,
    },
  });

  // Menus
  const menus = await Promise.all([
    prisma.menu.upsert({
      where: { id: "menu-nasi-goreng" },
      update: {},
      create: {
        id: "menu-nasi-goreng",
        name: "Nasi Goreng Spesial",
        category: "Makanan Utama",
        unit: "porsi",
        baseCost: 12000,
        price: 35000,
      },
    }),
    prisma.menu.upsert({
      where: { id: "menu-es-teh" },
      update: {},
      create: {
        id: "menu-es-teh",
        name: "Es Teh Manis",
        category: "Minuman",
        unit: "gelas",
        baseCost: 2000,
        price: 10000,
      },
    }),
    prisma.menu.upsert({
      where: { id: "menu-beef-burger" },
      update: {},
      create: {
        id: "menu-beef-burger",
        name: "Beef Burger",
        category: "Makanan Utama",
        unit: "porsi",
        baseCost: 30000,
        price: 45000,
      },
    }),
    prisma.menu.upsert({
      where: { id: "menu-salad-buah" },
      update: {},
      create: {
        id: "menu-salad-buah",
        name: "Salad Buah",
        category: "Dessert",
        unit: "porsi",
        baseCost: 21000,
        price: 25000,
        isActive: false,
      },
    }),
    prisma.menu.upsert({
      where: { id: "menu-ayam-bakar" },
      update: {},
      create: {
        id: "menu-ayam-bakar",
        name: "Ayam Bakar Madu",
        category: "Makanan Utama",
        unit: "porsi",
        baseCost: 22000,
        price: 55000,
      },
    }),
  ]);

  // Daily records — 30 hari ke belakang
  const today = new Date();
  for (let d = 29; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    date.setHours(0, 0, 0, 0);

    for (const menu of menus.filter((m) => m.isActive)) {
      const prod = Math.floor(Math.random() * 60) + 40;
      const waste = Math.floor(Math.random() * 15);
      const sales = prod - waste;

      await prisma.dailyRecord.upsert({
        where: {
          menuId_date_staffId: { menuId: menu.id, date, staffId: staff.id },
        },
        update: {},
        create: {
          date,
          actualProduction: prod,
          actualSales: sales,
          wasteAmount: waste,
          menuId: menu.id,
          staffId: staff.id,
        },
      });
    }
  }

  // System settings
  await prisma.systemSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      restaurantName: "Bistro Ekologi Pusat",
      timezone: "Asia/Jakarta",
      currency: "IDR",
      wasteTolerancePercent: 15,
      notifyDailySummary: true,
      notifyWarningEscalation: true,
    },
  });

  console.log("✅ Seed selesai!");
  console.log("---");
  console.log("Akun tersedia:");
  console.log("  Admin   → admin@wastewise.id    / admin123");
  console.log("  Manager → manager@wastewise.id  / manager123");
  console.log("  Staff   → staff@wastewise.id    / staff123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
