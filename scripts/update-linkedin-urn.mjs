import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const coll = mongoose.connection.collection('socialaccounts');
  const res = await coll.updateOne(
    { platform: 'linkedin' },
    {
      $set: {
        accountUrn: 'urn:li:person:4NlxH_FQEr',
        accountName: 'Syed Adil Ali',
        isActive: true,
      },
    }
  );
  console.log('UPDATE STATUS:', res.modifiedCount > 0 ? 'SUCCESS' : 'NO CHANGE');
  const doc = await coll.findOne({ platform: 'linkedin' });
  console.log('VERIFIED ACCOUNT:', {
    urn: doc?.accountUrn,
    name: doc?.accountName,
    hasToken: !!doc?.accessToken,
  });
  await mongoose.disconnect();
}

main().catch(console.error);
