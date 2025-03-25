import { relations } from 'drizzle-orm';
import {
  sqliteTable,
  text,
  integer,
  primaryKey
} from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  username: text('username').unique(),
  password: text('password'), // Add password field
  image: text('image'),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(Date.now),
});

export const usersRelations = relations(users, ({ many }) => ({
  bets: many(bets),
}));

export const races = sqliteTable('races', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  season: integer('season').notNull(),
  round: integer('round').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  bettingDeadline: integer('betting_deadline', { mode: 'timestamp' }).notNull(),
  fastestLapDriver: text('fastest_lap_driver'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(Date.now),
});

export const racesRelations = relations(races, ({ many }) => ({
  results: many(results),
  bets: many(bets),
}));

export const drivers = sqliteTable('drivers', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  number: integer('number').notNull(),
  team: text('team').notNull(),
  code: text('code').unique().notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(Date.now),
});

export const driversRelations = relations(drivers, ({ many }) => ({
  results: many(results),
}));

export const results = sqliteTable('results', {
  id: text('id').primaryKey().notNull(),
  raceId: text('race_id').notNull().references(() => races.id, { onDelete: 'cascade' }),
  driverId: text('driver_id').notNull().references(() => drivers.id),
  position: integer('position'),
  dnf: integer('dnf', { mode: 'boolean' }).default(false).notNull(),
  fastestLap: integer('fastest_lap', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(Date.now),
}, (table) => {
  return {
    raceDriverUnique: primaryKey({ columns: [table.raceId, table.driverId] }),
  };
});

export const resultsRelations = relations(results, ({ one }) => ({
  race: one(races, {
    fields: [results.raceId],
    references: [races.id],
  }),
  driver: one(drivers, {
    fields: [results.driverId],
    references: [drivers.id],
  }),
}));

export const bets = sqliteTable('bets', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  raceId: text('race_id').notNull().references(() => races.id, { onDelete: 'cascade' }),
  predictions: text('predictions', { mode: 'json' }).notNull(),
  score: integer('score'),
  scoringDetails: text('scoring_details', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(Date.now),
}, (table) => {
  return {
    userRaceUnique: primaryKey({ columns: [table.userId, table.raceId] }),
  };
});

export const betsRelations = relations(bets, ({ one }) => ({
  user: one(users, {
    fields: [bets.userId],
    references: [users.id],
  }),
  race: one(races, {
    fields: [bets.raceId],
    references: [races.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Race = typeof races.$inferSelect;
export type Driver = typeof drivers.$inferSelect;
export type Result = typeof results.$inferSelect;
export type Bet = typeof bets.$inferSelect;

export type NewUser = typeof users.$inferInsert;
export type NewRace = typeof races.$inferInsert;
export type NewDriver = typeof drivers.$inferInsert;
export type NewResult = typeof results.$inferInsert;
export type NewBet = typeof bets.$inferInsert;
