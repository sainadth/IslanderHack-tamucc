const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'users.db');

// Initialize database
function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
    });

    // Create users table
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          user_id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          age TEXT,
          sex TEXT,
          emergencyContact TEXT,
          location TEXT,
          medicalInfo TEXT
        )
      `, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
          return;
        }
        console.log('Users table ready');
        
        // Insert default users if table is empty
        db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
          if (err) {
            console.error('Error checking users:', err);
            reject(err);
            return;
          }
          
          if (row.count === 0) {
            console.log('Inserting default users...');
            const defaultUsers = [
              {
                user_id: 'user1',
                name: 'John Peter',
                age: '35',
                sex: 'Male',
                emergencyContact: '361 555 1110',
                location: '1702 Ennis Joslin Rd, Corpus Christi, TX 72412',
                medicalInfo: 'Specially Abled'
              },
              {
                user_id: 'user2',
                name: 'Jane Smith',
                age: '28',
                sex: 'Female',
                emergencyContact: '+1-555-0101',
                location: '456 Oak Ave, Austin, TX 78702',
                medicalInfo: 'Allergic to penicillin'
              }
            ];
            
            const stmt = db.prepare(`
              INSERT INTO users (user_id, name, age, sex, emergencyContact, location, medicalInfo)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            
            defaultUsers.forEach(user => {
              stmt.run([
                user.user_id,
                user.name,
                user.age,
                user.sex,
                user.emergencyContact,
                user.location,
                user.medicalInfo
              ]);
            });
            
            stmt.finalize((err) => {
              if (err) {
                console.error('Error inserting default users:', err);
                reject(err);
                return;
              }
              console.log('Default users inserted');
              resolve(db);
            });
          } else {
            resolve(db);
          }
        });
      });
    });
  });
}

// Get user by ID
function getUserById(userId) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    
    db.get('SELECT * FROM users WHERE user_id = ?', [userId], (err, row) => {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

// Get all users
function getAllUsers() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    
    db.all('SELECT * FROM users', [], (err, rows) => {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

// Insert or update user
function upsertUser(user) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    
    db.run(`
      INSERT INTO users (user_id, name, age, sex, emergencyContact, location, medicalInfo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        name = excluded.name,
        age = excluded.age,
        sex = excluded.sex,
        emergencyContact = excluded.emergencyContact,
        location = excluded.location,
        medicalInfo = excluded.medicalInfo
    `, [
      user.user_id,
      user.name,
      user.age,
      user.sex,
      user.emergencyContact,
      user.location,
      user.medicalInfo
    ], function(err) {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID });
    });
  });
}

module.exports = {
  initDatabase,
  getUserById,
  getAllUsers,
  upsertUser,
  DB_PATH
};

