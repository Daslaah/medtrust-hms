// Sample data seeder for MedTrust HMS
// Run with: node backend/seed.js

const mysql = require('mysql2/promise');
require('dotenv').config();

const seedData = async () => {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'medtrust_hms'
    });

    console.log('🌱 Seeding sample data...');

    // Sample users
    const users = [
      ['admin', '$2a$10$//dTQOOVcv00c71R8sj76eNCf7lpSxsF0daPjjWUf45dRcAgRGIhC', 'Admin User', 1],
      ['receptionist', '$2a$10$//dTQOOVcv00c71R8sj76eNCf7lpSxsF0daPjjWUf45dRcAgRGIhC', 'Receptionist User', 2],
      ['doctor1', '$2a$10$//dTQOOVcv00c71R8sj76eNCf7lpSxsF0daPjjWUf45dRcAgRGIhC', 'Dr. John Doe', 3],
      ['lab1', '$2a$10$//dTQOOVcv00c71R8sj76eNCf7lpSxsF0daPjjWUf45dRcAgRGIhC', 'Lab Technician', 4],
      ['pharmacy1', '$2a$10$//dTQOOVcv00c71R8sj76eNCf7lpSxsF0daPjjWUf45dRcAgRGIhC', 'Pharmacist', 5]
    ];

    for (const user of users) {
      await connection.execute(
        'INSERT IGNORE INTO users (username, password, full_name, role_id) VALUES (?, ?, ?, ?)',
        user
      );
    }

    // Sample medicines
    const medicines = [
      ['Paracetamol', 'Pain Relief', 500.00, 100, '2025-12-31', 'Common pain reliever'],
      ['Amoxicillin', 'Antibiotic', 1200.00, 50, '2025-10-15', 'Antibiotic medication'],
      ['Ibuprofen', 'Anti-inflammatory', 800.00, 75, '2025-11-20', 'Anti-inflammatory drug'],
      ['Insulin', 'Diabetes', 2500.00, 25, '2025-08-30', 'Diabetes medication']
    ];

    for (const medicine of medicines) {
      await connection.execute(
        'INSERT IGNORE INTO medicines (name, category, unit_price, quantity_in_stock, expiry_date, description) VALUES (?, ?, ?, ?, ?, ?)',
        medicine
      );
    }

    // Sample patients
    const patients = [
      ['John Smith', 'male', '1985-03-15', '+255712345678', 'john@example.com', 'Dar es Salaam', 'Jane Smith', '+255712345679', 'unpaid', 'registration'],
      ['Mary Johnson', 'female', '1990-07-22', '+255723456789', 'mary@example.com', 'Arusha', 'Bob Johnson', '+255723456780', 'paid', 'doctor'],
      ['David Wilson', 'male', '1978-11-08', '+255734567890', 'david@example.com', 'Mwanza', 'Sarah Wilson', '+255734567891', 'partial', 'lab']
    ];

    for (const patient of patients) {
      await connection.execute(
        'INSERT IGNORE INTO patients (full_name, gender, date_of_birth, phone, email, address, emergency_contact, emergency_phone, payment_status, current_stage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        patient
      );
    }

    console.log('✅ Sample data seeded successfully!');
    console.log('📋 You can now test the complete workflow:');
    console.log('   1. Login as receptionist (receptionist/receptionist)');
    console.log('   2. Register/update patients');
    console.log('   3. Login as doctor (doctor1/doctor1)');
    console.log('   4. Create medical records and move patients through stages');
    console.log('   5. Login as lab (lab1/lab1) for lab tests');
    console.log('   6. Login as pharmacy (pharmacy1/pharmacy1) for dispensing');
    console.log('   7. Use billing system for payments');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData };