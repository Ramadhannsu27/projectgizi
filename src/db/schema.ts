import {
  mysqlTable,
  varchar,
  text,
  decimal,
  datetime,
  date,
  int,
  boolean,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  full_name: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  created_at: datetime("created_at").default(sql`(NOW())`),
});

export const students = mysqlTable("students", {
  id: int("id").primaryKey().autoincrement(),
  nis: varchar("nis", { length: 50 }).notNull().unique(),
  full_name: varchar("full_name", { length: 255 }).notNull(),
  gender: varchar("gender", { length: 1 }).notNull(), // 'L' or 'P'
  birth_date: date("birth_date").notNull(),
  class_name: varchar("class_name", { length: 50 }).notNull(),
  school_name: varchar("school_name", { length: 255 }).notNull().default("SD / MI / SMP / SMA Negeri"),
  parent_name: varchar("parent_name", { length: 255 }),
  parent_phone: varchar("parent_phone", { length: 20 }),
  created_at: datetime("created_at").default(sql`(NOW())`),
});

export const measurements = mysqlTable("measurements", {
  id: int("id").primaryKey().autoincrement(),
  student_id: int("student_id").notNull().references(() => students.id),
  user_id: int("user_id").notNull().references(() => users.id),
  height: decimal("height", { precision: 5, scale: 2 }).notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  bmi: decimal("bmi", { precision: 5, scale: 2 }).notNull(),
  z_score: decimal("z_score", { precision: 6, scale: 4 }),
  status_category: varchar("status_category", { length: 50 }).notNull(),
  notes: text("notes"),
  checked_at: datetime("checked_at").default(sql`(NOW())`),
  is_synced: boolean("is_synced").default(true),
});

export const usersRelations = relations(users, ({ many }) => ({
  measurements: many(measurements),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  measurements: many(measurements),
}));
