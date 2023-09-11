export default function RestaurantTableBooking(db) {

    async function getAvailableTables() {
        try {
            const result = await db.one('SELECT * FROM table_booking WHERE booked = false');
            return result;
        } catch (error) {
            throw error;
        }
    }

    async function bookTable({ tableName, username, contact_number, capacity, number_of_people }) {
        try {
            // Check if the table has capacity
            const isTableBooked = await isTableBooked(tableName);
            if (isTableBooked) {
                return "capacity greater than the table seats";
            }

            // Check if a username is provided
            if (!username) {
                return "Please enter a username";
            }

            // Check if a contact number is provided
            if (!contact_number) {
                return "Please enter a contact number";
            }

            // Insert booking information into the 'table_booking' table
            await db.none(
                'INSERT INTO table_booking (table_name, capacity, username, number_of_people, contact_number) VALUES ($1, $2, $3, $4, $5)',
                [tableName, capacity, username, number_of_people, contact_number]
            );

            return 'Booking successful';
        } catch (error) {
            throw error;
        }
    }

    async function getBookedTables() {
        try {
            const result = await db.any('SELECT * FROM table_booking WHERE booked = true');
            return result;
        } catch (error) {
            throw error;
        }
    }

    async function isTableBooked(tableName) {
        try {
            const result = await db.oneOrNone('SELECT booked FROM table_booking WHERE table_name = $1', [tableName]);
            return result ? result.booked : false;
        } catch (error) {
            throw error;
        }
    }

    async function cancelTableBooking(tableName) {
        try {
            // Check if the table is booked
            const isBooked = await isTableBooked(tableName);
            if (!isBooked) {
                return false;
            }

            // Delete the booking record from the 'table_booking' table
            await db.none('DELETE FROM table_booking WHERE table_name = $1', [tableName]);

            return 'Booking canceled';
        } catch (error) {
            throw error;
        }
    }

    async function getBookedTablesForUser(username) {
        try {
            const result = await db.any('SELECT * FROM table_booking WHERE username = $1', [username]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    return {
        getAvailableTables,
        bookTable,
        getBookedTables,
        isTableBooked,
        cancelTableBooking,
        getBookedTablesForUser
    };
}
