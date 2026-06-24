import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached && cached.conn) {
    return cached.conn;
  }

  if (cached && !cached.promise) {
    const opts = {
      bufferCommands: false,
      // Vercel serverless: cap the pool so we never hit Atlas free-tier
      // connection limit (512 on M0 / 500 on M2) under ad traffic spikes.
      maxPoolSize: 10,
      minPoolSize: 1,
      // If Atlas doesn't respond within 10 s, fail fast instead of hanging
      // the serverless function until its 30 s timeout.
      serverSelectionTimeoutMS: 10_000,
      // Drop idle sockets after 45 s so Lambda/Vercel warm containers don't
      // hold stale connections across cold-start boundaries.
      socketTimeoutMS: 45_000,
      // Keep-alive prevents NAT gateways from silently dropping idle conns.
      family: 4, // IPv4 — avoids DNS fallback latency on Vercel
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => m);
  }

  try {
    if (cached) {
      cached.conn = await cached.promise;
    }
  } catch (e) {
    // On error clear the promise so the next request retries cleanly.
    if (cached) {
      cached.promise = null;
    }
    throw e;
  }

  return cached ? cached.conn : null;
}

export default dbConnect;
