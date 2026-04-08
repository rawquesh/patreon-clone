import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

async function migrateCreatorVisits() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB successfully');

    const db = client.db();

    const collections = await db
      .listCollections({ name: 'creator_visits' })
      .toArray();

    if (collections.length > 0) {
      console.log(
        'creator_visits collection already exists. Checking for indexes...',
      );
    } else {
      console.log('Creating creator_visits collection...');
      await db.createCollection('creator_visits');
    }

    const creatorVisits = db.collection('creator_visits');

    console.log('Creating indexes on creator_visits collection...');

    await Promise.all([
      creatorVisits.createIndex({ visitor: 1, creator: 1 }, { unique: true }),
      creatorVisits.createIndex({ visitor: 1, lastVisitedAt: -1 }),
      creatorVisits.createIndex({ creator: 1, lastVisitedAt: -1 }),
    ]);

    console.log('Indexes created successfully');

    const existingVisitsCount = await creatorVisits.countDocuments();
    console.log(
      `Current number of documents in creator_visits: ${existingVisitsCount}`,
    );

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

migrateCreatorVisits().catch(console.error);
