import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { philvolcsEarthquakes, PhilvolcsEarthquakeInsert } from '../schemas/earthquake-schema';

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not defined');
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL!,
});

export const db = drizzle(pool);

async function main() {

  console.log('🌱 Start Seeding')

  // Read and parse the CSV file
  const csvFilePath = path.join(__dirname, 'phivolcs_earthquake_data.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  
  // Skip the first line if it contains file path comment
  const csvContent = fileContent.startsWith('//') 
    ? fileContent.split('\n').slice(1).join('\n') 
    : fileContent;
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  // Transform CSV records to match database schema
  // Define an interface for the structure of a parsed CSV record
  interface CsvRecord {
    Date_Time_PH: string;
    Latitude: string;
    Longitude: string;
    Depth_In_Km: string;
    Magnitude: string;
    Location: string;
  }

  // Transform CSV records to match database schema
  const earthquakeData: PhilvolcsEarthquakeInsert[] = (records as CsvRecord[]).map((record: CsvRecord): PhilvolcsEarthquakeInsert => ({
    dateTimePH: new Date(record.Date_Time_PH),
    latitude: parseFloat(record.Latitude),
    longitude: parseFloat(record.Longitude),
    depthInKm: parseFloat(record.Depth_In_Km),
    magnitude: parseFloat(record.Magnitude),
    location: record.Location,
  }));

  // Insert earthquake data into the database
  console.log(`Inserting ${earthquakeData.length} earthquake records...`);
  
  /// Insert in smaller batches to avoid potential issues with large inserts
  const BATCH_SIZE = 100;
  for (let i = 0; i < earthquakeData.length; i += BATCH_SIZE) {
    const batch = earthquakeData.slice(i, i + BATCH_SIZE);
    
    // Use a cast to any to bypass type checking if needed
    await db.insert(philvolcsEarthquakes as any).values(batch);
    
    console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} records)`);
  }
  
  // Close the pool connection when done
  await pool.end();
}

main()
  .then(() => {
    console.log('✅ Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('🚫 Error inserting data:', error);
    process.exit(1);
  });