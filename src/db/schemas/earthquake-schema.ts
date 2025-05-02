import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, serial, timestamp, decimal, text } from 'drizzle-orm/pg-core';
/**
 * Earthquake schema for storing seismic event data from the Philippines
 */
export const philvolcsEarthquakes = pgTable('philvolcs_earthquakes', {
  id: serial('id').primaryKey(),
  dateTimePH: timestamp('date_time_ph').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 6 }).$type<number>().notNull(),
  longitude: decimal('longitude', { precision: 10, scale: 6 }).$type<number>().notNull(),
  depthInKm: decimal('depth_in_km', { precision: 6, scale: 2 }).$type<number>().notNull(),
  magnitude: decimal('magnitude', { precision: 3, scale: 1 }).$type<number>().notNull(),
  location: text('location').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type PhilvolcsEarthquake = InferSelectModel<typeof philvolcsEarthquakes>
export type PhilvolcsEarthquakeInsert = InferInsertModel<typeof philvolcsEarthquakes>
