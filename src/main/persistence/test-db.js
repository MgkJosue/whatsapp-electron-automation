const db = require('./storage');
const userRepository = require('./repositories/userRepository');
const sessionRepository = require('./repositories/sessionRepository');
const configRepository = require('./repositories/configRepository');
const contactRepository = require('./repositories/contactRepository');
const messageRepository = require('./repositories/messageRepository');

async function testDatabase() {
  console.log('=== Starting Database Tests ===\n');

  try {
    await db.initialize();
    console.log('✓ Database initialized successfully\n');

    console.log('--- Testing User Repository ---');
    const user = userRepository.create('+1234567890');
    console.log('✓ User created:', user);

    const foundUser = userRepository.findById(user.id);
    console.log('✓ User found by ID:', foundUser);

    userRepository.updateLastLogin(user.id);
    console.log('✓ User last login updated\n');

    console.log('--- Testing Session Repository ---');
    const session = sessionRepository.create(user.id, '{"test": "session"}');
    console.log('✓ Session created:', session);

    sessionRepository.setAuthenticated(user.id, true);
    console.log('✓ Session authenticated');

    const isAuth = sessionRepository.isAuthenticated(user.id);
    console.log('✓ Session authentication status:', isAuth, '\n');

    console.log('--- Testing Config Repository ---');
    const config = configRepository.create(user.id, './sessions', 10, 5, true);
    console.log('✓ Config created:', config);

    const updatedConfig = configRepository.update(user.id, { delayBetweenMessages: 15 });
    console.log('✓ Config updated:', updatedConfig, '\n');

    console.log('--- Testing Contact Repository ---');
    const contact1 = contactRepository.create(user.id, 'John Doe', '+1234567890', '+1 (234) 567-890');
    console.log('✓ Contact 1 created:', contact1);

    const contact2 = contactRepository.create(user.id, 'Jane Smith', '+0987654321', '+0 (987) 654-321');
    console.log('✓ Contact 2 created:', contact2);

    const allContacts = contactRepository.findByUserId(user.id);
    console.log('✓ All contacts found:', allContacts.length, 'contacts');

    const searchResults = contactRepository.search(user.id, 'John');
    console.log('✓ Search results for "John":', searchResults.length, 'found');

    const isDuplicate = contactRepository.checkDuplicate(user.id, '+1234567890');
    console.log('✓ Duplicate check:', isDuplicate);

    contactRepository.update(contact1.id, 'John Updated', '+1234567890', '+1 (234) 567-890');
    console.log('✓ Contact updated\n');

    console.log('--- Testing Message Repository ---');
    const message1 = messageRepository.create(user.id, '+1234567890', 'Hello World!', contact1.id);
    console.log('✓ Message 1 created:', message1);

    const message2 = messageRepository.create(user.id, '+0987654321', 'Test message', contact2.id, '/path/to/file.jpg', 'file.jpg');
    console.log('✓ Message 2 created with file:', message2);

    messageRepository.updateStatus(message1.id, 'SENT');
    console.log('✓ Message 1 status updated to SENT');

    messageRepository.updateStatus(message2.id, 'FAILED', 'Network error');
    console.log('✓ Message 2 status updated to FAILED with error');

    const pendingMessages = messageRepository.findByStatus(user.id, 'PENDING');
    console.log('✓ Pending messages:', pendingMessages.length);

    const sentMessages = messageRepository.findByStatus(user.id, 'SENT');
    console.log('✓ Sent messages:', sentMessages.length);

    const stats = messageRepository.getStatistics(user.id);
    console.log('✓ Message statistics:', stats);

    const messageCount = messageRepository.count(user.id);
    console.log('✓ Total messages:', messageCount, '\n');

    console.log('--- Testing Bulk Operations ---');
    const bulkContacts = [
      { name: 'Contact 3', phoneNumber: '+1111111111', formattedNumber: '+1 (111) 111-111' },
      { name: 'Contact 4', phoneNumber: '+2222222222', formattedNumber: '+2 (222) 222-222' },
      { name: 'Duplicate', phoneNumber: '+1234567890', formattedNumber: '+1 (234) 567-890' }
    ];

    const bulkResult = contactRepository.bulkCreate(user.id, bulkContacts);
    console.log('✓ Bulk create results:');
    console.log('  - Success:', bulkResult.success.length);
    console.log('  - Duplicates:', bulkResult.duplicates.length);
    console.log('  - Errors:', bulkResult.errors.length, '\n');

    console.log('--- Final Counts ---');
    const finalContactCount = contactRepository.count(user.id);
    const finalMessageCount = messageRepository.count(user.id);
    console.log('✓ Total contacts:', finalContactCount);
    console.log('✓ Total messages:', finalMessageCount);

    console.log('\n=== All Tests Passed Successfully! ===');
    
    db.close();
    process.exit(0);

  } catch (error) {
    console.error('\n✗ Test failed:', error);
    db.close();
    process.exit(1);
  }
}

testDatabase();
