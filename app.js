const	express					=	require("express"),
		app						=	express(),
		bodyParser				=	require("body-parser"),
		mongoose				=	require("mongoose"),
	    flash       			= 	require("connect-flash"),
		methodOverride 			=	require("method-override"),
		passport				=	require("passport"),
	  	localStrategy			=	require("passport-local"),
	  	passportLocalMongoose   =	require("passport-local-mongoose"),
		PostData				=	require("./models/postSchema"),
	    User					=	require("./models/user"),
		SubscribedData			=	require("./models/subscribeSchema");

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
//routes
const PostRoute	=	require("./routes");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/assets'));
app.use(methodOverride("_method"));
app.use(flash());

app.use(require("express-session")({
    secret: "Node JS Blog",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.presentPage = undefined;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", PostRoute);
app.listen(process.env.PORT || 3000,()=> console.log('launched!'));