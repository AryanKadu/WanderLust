if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("../MAJOR PROJECT/models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // for boilerplate code like navbar
app.use(express.static(path.join(__dirname, "public")));
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo"); // connect atlas
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const dbUrl = process.env.ATLASDB_URL;


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600,
});

store.on("error", ()=> {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
};


const listingRouter = require("./routes/listing.js")
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


main()
    .then(()=> {
        console.log("connected to DB");
    })
    .catch(err=> {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate); //for boilerplate code like navbar is same on every page so no need to repeate the same code


app.use(session(sessionOptions));
app.use(flash()); // always before routes

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); // After login storing the info of the user in the session
passport.deserializeUser(User.deserializeUser()); // Removing the info of the user in the session


app.use((req, res, next)=> {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async (req, res)=> {
//     let fakeUser = new User ({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter)
app.use("/", userRouter);



app.all("*", (req, res, next)=> {
    next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next)=> {
    let {statusCode=500, message="Something went wrong!"} = err;
    // res.render("error.ejs", {err});
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
})

app.listen(8080, ()=> {
    console.log("server is listening to port 8080");
});





// const {listingSchema, reviewSchema} = require("./schema.js");
// const { wrap } = require("module");
// const Review = require("./models/review.js");
// const wrapAsync = require("./utils/wrapAsync.js");
