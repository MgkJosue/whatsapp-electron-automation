const phoneValidator = require('./phoneValidator');

console.log('=== Testing Phone Validation ===\n');

const testCases = [
  '+1234567890',
  '1234567890',
  '+521234567890',
  '+34612345678',
  '123',
  'invalid',
  '',
  '+12345',
  '+5491123456789',
  '12368788095'
];

testCases.forEach(phone => {
  const result = phoneValidator.validate(phone);
  console.log(`Input: "${phone}"`);
  console.log(`Valid: ${result.isValid}`);
  if (result.isValid) {
    console.log(`Formatted: ${result.formatted}`);
    console.log(`Country: ${result.countryCode}`);
  } else {
    console.log(`Error: ${result.error}`);
  }
  console.log('---');
});

console.log('\n=== Testing Batch Validation ===\n');

const batch = ['+1234567890', 'invalid', '+521234567890'];
const batchResult = phoneValidator.validateBatch(batch);

console.log(`Valid numbers: ${batchResult.valid.length}`);
batchResult.valid.forEach(v => console.log(`  - ${v.formatted}`));

console.log(`Invalid numbers: ${batchResult.invalid.length}`);
batchResult.invalid.forEach(v => console.log(`  - ${v.original}: ${v.error}`));
