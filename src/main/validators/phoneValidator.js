const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');

class PhoneValidator {
  validate(phoneNumber) {
    const result = {
      isValid: false,
      formatted: null,
      original: phoneNumber,
      error: null,
      countryCode: null
    };

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      result.error = 'Phone number is required';
      return result;
    }

    const cleaned = phoneNumber.trim().replace(/[\s\-\(\)]/g, '');

    if (cleaned.length === 0) {
      result.error = 'Phone number cannot be empty';
      return result;
    }

    try {
      const testNumbers = [
        cleaned,
        cleaned.startsWith('+') ? cleaned : '+' + cleaned,
        cleaned.startsWith('1') ? '+' + cleaned : '+1' + cleaned
      ];

      for (const testNumber of testNumbers) {
        try {
          if (isValidPhoneNumber(testNumber)) {
            const parsed = parsePhoneNumber(testNumber);
            
            result.isValid = true;
            result.formatted = parsed.number;
            result.countryCode = parsed.country;
            
            return result;
          }
        } catch (e) {
          continue;
        }
      }

      result.error = 'Invalid phone number. Use format: +[country code][number] (e.g., +12368788095)';
      return result;

    } catch (error) {
      result.error = `Invalid phone number: ${error.message}`;
      return result;
    }
  }

  validateBatch(phoneNumbers) {
    const results = {
      valid: [],
      invalid: []
    };

    phoneNumbers.forEach(phone => {
      const validation = this.validate(phone);
      
      if (validation.isValid) {
        results.valid.push(validation);
      } else {
        results.invalid.push(validation);
      }
    });

    return results;
  }

  format(phoneNumber) {
    const validation = this.validate(phoneNumber);
    return validation.isValid ? validation.formatted : null;
  }

  isValid(phoneNumber) {
    const validation = this.validate(phoneNumber);
    return validation.isValid;
  }
}

module.exports = new PhoneValidator();
