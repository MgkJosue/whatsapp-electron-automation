const Papa = require('papaparse');
const { parsePhoneNumber } = require('libphonenumber-js');

class GoogleContactsParser {
  constructor(countryCode = '+593') {
    this.countryCode = countryCode;
    this.processedPhones = new Set();
  }

  /**
   * Combina First Name, Middle Name y Last Name en un solo nombre
   */
  combineName(firstName, middleName, lastName) {
    const parts = [firstName, middleName, lastName]
      .filter(part => part && part.trim())
      .map(part => part.trim());
    
    return parts.join(' ') || 'Sin Nombre';
  }

  /**
   * Limpia y formatea un número de teléfono
   * - Elimina espacios, guiones, paréntesis
   * - Agrega código de país +593 si no lo tiene
   * - Maneja números que empiezan con 0
   */
  cleanAndFormatPhone(phone) {
    if (!phone || typeof phone !== 'string') {
      return null;
    }

    // Limpiar el número: eliminar espacios, guiones, paréntesis
    let cleaned = phone.trim()
      .replace(/\s+/g, '')
      .replace(/-/g, '')
      .replace(/\(/g, '')
      .replace(/\)/g, '');

    // Si está vacío después de limpiar, retornar null
    if (!cleaned) {
      return null;
    }

    // Si ya tiene código de país (+593 o 593), normalizarlo
    if (cleaned.startsWith('+593')) {
      cleaned = cleaned.substring(4); // Remover +593
    } else if (cleaned.startsWith('593')) {
      cleaned = cleaned.substring(3); // Remover 593
    }

    // Si empieza con 0, removerlo (formato local ecuatoriano)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // Validar que tenga 9 dígitos (formato móvil Ecuador)
    if (cleaned.length !== 9) {
      console.warn(`Número inválido (debe tener 9 dígitos): ${phone} -> ${cleaned}`);
      return null;
    }

    // Validar que empiece con 9 (móviles en Ecuador)
    if (!cleaned.startsWith('9')) {
      console.warn(`Número no es móvil (debe empezar con 9): ${phone} -> ${cleaned}`);
      return null;
    }

    // Retornar con código de país
    return `${this.countryCode}${cleaned}`;
  }

  /**
   * Extrae múltiples números de un campo que puede contener varios números separados por :::
   */
  extractMultiplePhones(phoneValue) {
    if (!phoneValue) {
      return [];
    }

    // Separar por ::: si hay múltiples números
    const phoneStrings = phoneValue.split(':::').map(p => p.trim());
    
    const phones = [];
    for (const phoneStr of phoneStrings) {
      const formatted = this.cleanAndFormatPhone(phoneStr);
      if (formatted && !this.processedPhones.has(formatted)) {
        phones.push(formatted);
        this.processedPhones.add(formatted);
      }
    }

    return phones;
  }

  /**
   * Procesa una fila del CSV de Google Contacts
   */
  processRow(row) {
    const contacts = [];

    // Combinar nombre
    const name = this.combineName(
      row['First Name'],
      row['Middle Name'],
      row['Last Name']
    );

    // Procesar Phone 1
    const phones1 = this.extractMultiplePhones(row['Phone 1 - Value']);
    
    // Procesar Phone 2 si existe
    const phones2 = this.extractMultiplePhones(row['Phone 2 - Value']);

    // Combinar todos los números
    const allPhones = [...phones1, ...phones2];

    // Crear un contacto por cada número único
    for (const phone of allPhones) {
      contacts.push({
        name: name,
        phone: phone
      });
    }

    return contacts;
  }

  /**
   * Parsea el archivo CSV completo de Google Contacts
   */
  async parseCSV(csvContent) {
    return new Promise((resolve, reject) => {
      // Resetear el set de números procesados
      this.processedPhones.clear();

      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const allContacts = [];
            const errors = [];

            for (let i = 0; i < results.data.length; i++) {
              const row = results.data[i];
              
              try {
                const contacts = this.processRow(row);
                allContacts.push(...contacts);
              } catch (error) {
                errors.push({
                  row: i + 2, // +2 porque empieza en 1 y hay header
                  error: error.message,
                  data: row
                });
              }
            }

            // Eliminar duplicados finales (por si acaso)
            const uniqueContacts = this.removeDuplicates(allContacts);

            resolve({
              success: true,
              contacts: uniqueContacts,
              total: uniqueContacts.length,
              duplicatesRemoved: allContacts.length - uniqueContacts.length,
              errors: errors
            });
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * Elimina contactos duplicados basándose en el número de teléfono
   */
  removeDuplicates(contacts) {
    const seen = new Map();
    const unique = [];

    for (const contact of contacts) {
      if (!seen.has(contact.phone)) {
        seen.set(contact.phone, true);
        unique.push(contact);
      }
    }

    return unique;
  }

  /**
   * Genera un reporte de la importación
   */
  generateReport(result) {
    const report = {
      totalProcessed: result.total,
      duplicatesRemoved: result.duplicatesRemoved,
      errors: result.errors.length,
      summary: `
Importación de Google Contacts completada:
- Contactos procesados: ${result.total}
- Duplicados eliminados: ${result.duplicatesRemoved}
- Errores: ${result.errors.length}
      `.trim()
    };

    if (result.errors.length > 0) {
      report.errorDetails = result.errors.map(e => 
        `Fila ${e.row}: ${e.error}`
      ).join('\n');
    }

    return report;
  }
}

module.exports = GoogleContactsParser;
