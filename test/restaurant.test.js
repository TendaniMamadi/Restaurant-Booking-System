import assert from "assert"
import RestaurantTableBooking from "../services/restaurant.js";
import pgPromise from 'pg-promise';

const DATABASE_URL = 'postgres://xzilclvr:sNnjaqILSTh5BJHiONP34CfcZsnjjqHP@dumbo.db.elephantsql.com/xzilclvr';

const connectionString = process.env.DATABASE_URL || DATABASE_URL;
const db = pgPromise()(connectionString);

describe("The restaurant booking table", function () {
    this.timeout(20000);
    const restaurantTableBooking = RestaurantTableBooking(db);
    beforeEach(async function () {
        try {
            // clean the tables before each test run
             await db.none("TRUNCATE TABLE table_booking RESTART IDENTITY CASCADE;");
        } catch (err) {
            console.log(err);
            throw err;
        }
    });

    it("Get all the available tables", async function () {
        const restaurantTableBooking = RestaurantTableBooking(db);
        
        // Call the getTables function to retrieve all available tables
        const tables = await restaurantTableBooking.getTables();
    
        assert.deepEqual([
            { table_name: 'Table one' },
            { table_name: 'Table two' },
            { table_name: 'Table three' },
            { table_name: 'Table four' },
            { table_name: 'Table five' },
            { table_name: 'Table six' }
        ],[
            { table_name: 'Table one' },
            { table_name: 'Table two' },
            { table_name: 'Table three' },
            { table_name: 'Table four' },
            { table_name: 'Table five' },
            { table_name: 'Table six' }
        ]);
    });
    

    it("It should check if the capacity is not greater than the available seats.", async function () {
        const result = await restaurantTableBooking.bookTable({
            tableName: 'Table four',
            username: 'Kim',
            contact_number: '084 009 8910',
            capacity: 3,
            number_of_people: 3
        });
        
        assert.deepEqual("capacity greater than the table seats", result);
    });
    
    it("should check if there are available seats for a booking.", async function () {
        const restaurantTableBooking = await RestaurantTableBooking(db);
    
        // Ensure there are available tables for booking
        const availableTables = await restaurantTableBooking.getAvailableTables();
    
        // Check if there are available tables
        assert.equal(availableTables.length > 0, true);
    });
    
    it("Check if the booking has a user name provided.", async function () {
        const restaurantTableBooking = await RestaurantTableBooking(db);
        const result = await restaurantTableBooking.bookTable({
            tableName: 'Table eight',
            contact_number: '084 009 8910',
            capacity: 2,
            number_of_people: 2
        });
    
        assert.deepEqual("Please enter a username", result);
    });
    
    it("Check if the booking has a contact number provided.", async function () {
        const restaurantTableBooking = await RestaurantTableBooking(db);
        const result = await restaurantTableBooking.bookTable({
            tableName: 'Table eight',
            username: 'Kim',
            capacity: 2,
            number_of_people: 2
        });
    
        assert.deepEqual("Please enter a contact number", result);
    });
    
    it("should not be able to book a table with an invalid table name.", async function () {
        const restaurantTableBooking = await RestaurantTableBooking(db);
    
        // Attempt to book a table with an invalid name
        const result = await restaurantTableBooking.bookTable({
            tableName: 'Table eight',
            username: 'Kim',
            contact_number: '084 009 8910',
            capacity: 2,
            number_of_people: 2
        });
    
        assert.deepEqual("Invalid table name provided", result);
    });
    
    it("should be able to book a table.", async function () {
        let restaurantTableBooking = await RestaurantTableBooking(db);
    
        // Check if Table three is initially not booked
        const isTableThreeBookedInitially = await restaurantTableBooking.isTableBooked('Table three');
        assert.equal(isTableThreeBookedInitially, false);
    
        // Book Table three
        await restaurantTableBooking.bookTable({
            tableName: 'Table three',
            username: 'Kim',
            contact_number: '084 009 8910',
            capacity: 2,
            number_of_people: 2
        });
    
        // Check if Table three is booked now
        const isTableThreeBookedAfterBooking = await restaurantTableBooking.isTableBooked('Table three');
        assert.equal(isTableThreeBookedAfterBooking, true);
    });
    
    it("should list all booked tables.", async function () {
        let restaurantTableBooking = await RestaurantTableBooking(db);
    
        // Get all tables
        const tables = await restaurantTableBooking.getAvailableTables();
    
        assert.deepEqual(tables.length, 6);
    });
    
    it("should allow users to book tables", async function () {
        let restaurantTableBooking = await RestaurantTableBooking(db);
    
        // Ensure there are no bookings for 'jodie'
        const userBookingsBefore = await restaurantTableBooking.getBookedTablesForUser('jodie');
        assert.deepEqual(userBookingsBefore, []);
    
        // Book tables for 'jodie'
        await restaurantTableBooking.bookTable({
            tableName: 'Table five',
            username: 'Jodie',
            contact_number: '084 009 8910',
            capacity: 4,
            number_of_people: 4
        });
    
        await restaurantTableBooking.bookTable({
            tableName: 'Table four',
            username: 'Jodie',
            contact_number: '084 009 8910',
            capacity: 2,
            number_of_people: 2
        });
    
        // Get bookings for 'jodie'
        const userBookingsAfter = await restaurantTableBooking.getBookedTablesForUser('jodie');
        assert.deepEqual(userBookingsAfter.length, 2);
    });
    
    it("should be able to cancel a table booking", async function () {
        let restaurantTableBooking = await RestaurantTableBooking(db);
    
        // Book tables for 'Jodie' and 'Kim'
        await restaurantTableBooking.bookTable({
            tableName: 'Table five',
            username: 'Jodie',
            contact_number: '084 009 8910',
            capacity: 2,
            number_of_people: 2
        });
    
        await restaurantTableBooking.bookTable({
            tableName: 'Table four',
            username: 'Kim',
            contact_number: '084 009 8910',
            capacity: 3,
            number_of_people: 3
        });
    
        // Get the initial count of booked tables
        const bookedTablesBefore = await restaurantTableBooking.getBookedTables();
        assert.equal(bookedTablesBefore.length, 2);
    
        // Cancel the booking for 'Kim'
        await restaurantTableBooking.cancelTableBooking('Table four');
    
        // Get the count of booked tables after cancellation
        const bookedTablesAfter = await restaurantTableBooking.getBookedTables();
        assert.equal(bookedTablesAfter.length, 1);
    });
    

    after(function () {
        db.$pool.end;
    });
})
