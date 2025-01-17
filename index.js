import express from "express";
import pgp from "pg-promise";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import flash from "flash-express";
import session from "express-session";
import restaurant from './services/restaurant.js'


const app = express()
const db = pgp()
const restaurantInstance = restaurant(db)

app.use(session({
    secret: "restaurant app",
    resave: false,
    saveUninitialized: true
}));

app.use(express.static('public'));
app.use(flash());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const handlebarSetup = exphbs.engine({
    partialsDir: "./views/partials",
    viewPath: './views',
    layoutsDir: './views/layouts'
});

app.engine('handlebars', handlebarSetup);
app.set('view engine', 'handlebars');

app.get("/", async (req, res) => {
    availableTables = await restaurantInstance.getAvailableTables()
    res.render('index', { tables : [{}, {}, {booked : true}, {}, {}, {}]})
});


app.get("/bookings", (req, res) => {
    res.render('bookings', { tables : [{}, {}, {}, {}, {}, {}]})
});




var portNumber = process.env.PORT || 3000;

//start everything up
app.listen(portNumber, function () {
    console.log('🚀  server listening on:', portNumber);
});



