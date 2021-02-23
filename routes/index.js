const	express			=	require('express'),
		router			=	express.Router(),
		mongoose		=	require("mongoose"),
	  	flash       	= 	require("connect-flash"),
		passport		=	require("passport"),
		{toKebabCase}	=	require("casing-converter"),
		rateLimit		=	require("express-rate-limit"),
		User        	=	require("../models/user"),
		PostData		=	require("../models/postSchema"),
		SubscribedData	=	require("../models/subscribeSchema");

const createPassSafe	=	rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // start blocking after 5 requests
  message:
    "Too many accounts created from this IP, please try again after an hour"
});

router.get("/", (req, res)=>{
	res.redirect("/posts");
});

// index route
router.get("/posts", (req, res)=>{
	var perPage=8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
	
    PostData.find({}).sort("-created").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, returnData) {
        PostData.countDocuments().exec(function (err, count) {
			PostData.find({Featured:true}).exec(function (err, featuredData) {
				if (err) {
					console.log(err);
					req.flash("error", error.message);
					res.redirect("/posts");
				} else {
					res.render("landing", {
						presentPage:"home",
						returnData:returnData,
						featuredData:featuredData,
						current: pageNumber,
						pages: Math.ceil(count / perPage)
					});
				}
			});
        });
    });
	
});

//keywords
string_to_array = function (str) {
     return str.trim().split(" ");
};

// newpost POST page
router.post("/posts", isLoggedIn, (req, res)=>{
	req.body.posts.author={
		id:req.user._id,
		username:req.user.username
	};
	req.body.posts.kababCasedTitle=toKebabCase(req.body.posts.title);
	req.body.posts.keywords=string_to_array(req.body.posts.keywords);
	PostData.create(req.body.posts, (error, returnData)=>{
		if(error || (returnData && returnData.length===0) || returnData===null){
			(error)?console.log(error):
			req.flash("error", "Could not create the data, please try again");
			res.render("back");
		} else {
			req.flash("success", "Post creation success");
			return res.redirect("/posts/"+returnData.kababCasedTitle);
		}
	});
});

// new post route
router.get("/posts/new", isLoggedIn, (req, res)=>{
	res.render("new");
});

// showpage route
router.get("/posts/:title", (req, res)=>{
	PostData.findOne({kababCasedTitle: req.params.title}).exec((error, returnData)=>{
		PostData.find({}).exec(function (err, AllPostData) {
			if(error || (returnData && returnData.length===0) || returnData===null){
				(error)?console.log(error):
				res.render("pagenotfound");
			} else {
				res.render("show", {presentPage:"show",returnData:returnData, AllPostData:AllPostData});
			}
		});
	});
});

//edit route
router.get("/posts/:title/edit", isLoggedIn, (req,res)=>{
	PostData.findOne({kababCasedTitle: req.params.title}, (error, returnData)=>{
		if(error || (returnData && returnData.length===0) || returnData===null){
			(error)?console.log(error):
			res.render("pagenotfound");
		}
		else {
			res.render("edit", {returnData:returnData});
		}
	});
});

// edit logic
router.put("/posts/:title", isLoggedIn, (req,res)=>{
	req.body.updatedPost.created=Date.now();
	req.body.updatedPost.kababCasedTitle=toKebabCase(req.body.updatedPost.title);
	req.body.updatedPost.keywords=string_to_array(req.body.updatedPost.keywords);
	PostData.findOneAndUpdate({kababCasedTitle: req.params.title}, req.body.updatedPost,{new: true}, (error, returnData)=>{
		if(error || (returnData && returnData.length===0) || returnData===null){
			(error)?console.log(error):
			req.flash("error", "Could not update the post, please try again");
			res.redirect("/");
		}
		else{
			req.flash("success", "Post edited sucessfully!");
			return res.redirect("/posts/"+returnData.kababCasedTitle);
		}
	});
});

//delete route
router.delete("/posts/:title", isLoggedIn, (req,res)=>{
	PostData.findOneAndRemove({kababCasedTitle: req.params.title}, (error, returnData)=>{
		if(error || (returnData && returnData.length===0) || returnData===null){
			(error)?console.log(error):
			req.flash("error", "Could not delete the data, please try again");
			res.render("back");
		}
		else{
			req.flash("success", "Post deleted sucessfully!");
			return res.redirect("/posts");
		}
	});
});

// router.get("/register", (req, res)=>{
// 	res.render("register");
// });

// // //verifying sign up
// router.post("/register", (req, res)=>{
//     var newUser = new User({username: req.body.username});
//     User.register(newUser, req.body.password, (err, user)=>{
//         if(err){
//             console.log(err);
//             return res.render("register");
//         }
//         passport.authenticate("local")(req, res, function(){
//            res.redirect("/secret"); 
//         });
//     });
// });

// LOGIN ROUTES
router.get("/anemone", (req, res)=>{
   res.render("login");
});

router.post("/anemone", createPassSafe, passport.authenticate("local", {
	successFlash: 'Welcome Administrator, how you doin!',
    successRedirect: "/posts",
	failureFlash: 'Login failed, please try again',
    failureRedirect: "/anemone"
}));


router.get("/logout", isLoggedIn, (req, res)=>{
    req.logout();
	req.flash("success", "Successfully logged you out!");
    res.redirect("/posts");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.render("pagenotfound");
}

//Newsletter
router.get("/subscribe", isLoggedIn, (req, res)=>{
	SubscribedData.find({}).sort("-date").exec(function (err, returnData) {
		if(err){
			console.log(err);
			req.flash("error", "unable to view subscribed data, please try again");
			res.redirect("/posts");
		} else {
			res.render("subscribe", {returnData:returnData});
		}
	});
});

router.post("/subscribe", (req, res)=>{
	SubscribedData.create(req.body.sub, (error, returnData)=>{
		if(error || (returnData && returnData.length===0) || returnData===null){
			(error)?console.log(error):
			req.flash("error", "Could not submit the email, please try again");
			return res.redirect("/posts");
		} else {
			// console.log(returnData);
			req.flash("success", "Thank You For Subscribing!");
			return res.redirect("/posts");
		}
	});
});

router.get("/about", (req, res)=>{
	res.render("about")
});

router.get("/contactus", (req, res)=>{
	res.render("contactus");
});

router.get("/disclaimer", (req, res)=>{
	res.render("disclaimer")
});

router.get("/privacy", (req, res)=>{
	res.render("privacy")
});

router.get("/terms", (req, res)=>{
	res.render("terms")
});

router.get("*", (req, res)=>{
	res.render("pagenotfound");
});

module.exports = router;