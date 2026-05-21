const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, required: true, default: 1000 },
});

const User = mongoose.model('UserTest', UserSchema);

async function testConnection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/stake_clone');
    console.log('Connected successfully.');

    console.log('Clearing old test users...');
    await User.deleteMany({ username: 'test_db_user' });

    console.log('Creating test user...');
    const user = await User.create({
      username: 'test_db_user',
      password: 'password123',
      balance: 1500
    });
    console.log('User created:', user.username);

    console.log('Finding test user...');
    const foundUser = await User.findOne({ username: 'test_db_user' });
    console.log('User found:', foundUser.username);

    console.log('Test successful! MongoDB is working.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Test failed:', error.message);
    await mongoose.disconnect();
  }
}

testConnection();
