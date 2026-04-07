/**
 * Seed script to create admin user and sample data
 * Run: npx tsx scripts/seed.ts
 */
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function seed() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "projectgizi",
  });

  console.log("Connected to MySQL. Creating seed data...");

  // Create admin user
  const passwordHash = await bcrypt.hash("admin", 10);
  try {
    await connection.execute(
      `INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)`,
      ["Admin UKS", "ramadhanstark05@gmail.com", passwordHash]
    );
    console.log("Admin user created: ramadhanstark05@gmail.com / admin");
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "ER_DUP_ENTRY") {
      console.log("Admin user already exists.");
    } else {
      throw e;
    }
  }

  // Create sample students
  const sampleStudents = [
    ["2024001", "Ahmad Fauzi", "L", "2009-03-15", "Kelas IV", "Budi Santoso", "081234567890"],
    ["2024002", "Siti Nurhaliza", "P", "2009-07-22", "Kelas IV", "Hartini", "081234567891"],
    ["2024003", "Rizki Ramadhan", "L", "2010-01-10", "Kelas III", "Dedi Kurniawan", "081234567892"],
    ["2024004", "Putri Ayu", "P", "2010-05-05", "Kelas III", "Yuniati", "081234567893"],
    ["2024005", "Bagas Prakoso", "L", "2008-11-20", "Kelas V", "Supriyadi", "081234567894"],
  ];

  for (const student of sampleStudents) {
    try {
      await connection.execute(
        `INSERT INTO students (nis, full_name, gender, birth_date, class_name, parent_name, parent_phone) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        student
      );
      console.log(`Added student: ${student[1]}`);
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code === "ER_DUP_ENTRY") {
        console.log(`Student ${student[1]} already exists.`);
      }
    }
  }

  await connection.end();
  console.log("Seed complete!");
}

seed().catch(console.error);
