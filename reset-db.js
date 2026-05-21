const mongoose = require('mongoose');

async function resetDb() {
  await mongoose.connect('mongodb://localhost:27017/stake_clone');
  console.log('Connected to DB. Dropping database...');
  await mongoose.connection.db.dropDatabase();
  console.log('Database dropped successfully to clear old schema indexes.');
  await mongoose.disconnect();
}

resetDb();
