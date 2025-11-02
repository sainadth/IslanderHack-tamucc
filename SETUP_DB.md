# Database Setup

The system now uses SQLite3 instead of JSON files for user data.

## Database Structure

The `users` table has the following structure:
- `user_id` (TEXT, PRIMARY KEY) - Unique identifier for each user
- `name` (TEXT) - User's name
- `age` (TEXT) - User's age
- `sex` (TEXT) - User's gender
- `emergencyContact` (TEXT) - Emergency contact number
- `location` (TEXT) - User's location/address
- `medicalInfo` (TEXT) - Medical information

## Default Data

When you first run the server, it will automatically create the database and insert default users:
- `user1`: John Peter (existing from users.json)
- `user2`: Jane Smith (existing from users.json)

## Adding/Updating Users

You can programmatically add users using the `upsertUser` function in `db.js`, or manually insert into the database.

Example SQL:
```sql
INSERT INTO users (user_id, name, age, sex, emergencyContact, location, medicalInfo)
VALUES ('user3', 'Jane Doe', '25', 'Female', '+1-555-1234', '123 Main St', 'No allergies');
```

Or use the upsertUser function which handles both insert and update.

