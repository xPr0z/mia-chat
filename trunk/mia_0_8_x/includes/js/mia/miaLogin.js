$(document).ready(function() {
	
    $('#username').focus(); //Give the user name the initial focus
    
    //Show registration form/hide login
	$('#newUser').bind("click", {}, function() {
		$('#registration').removeClass("hideme");
		$('#login').addClass("hideme");     
        $('#regUsername').focus(); //Give the full name the initial focus
	});
	//Show login form/hide registration & reset
	$('.loginUser').bind("click", {}, function() {
		$('#login').removeClass("hideme");
		$('#registration').addClass("hideme");
		$('#passwordReset').addClass("hideme");
        $('#username').focus(); //Give the user name the initial focus
	});
	//Show reset form/hide registration
	$('#reset').bind("click", {}, function() {
		$('#passwordReset').removeClass("hideme");
		$('#login').addClass("hideme");
        $('#resetUsername').focus(); //Give the user name the initial focus
	});
	
	//Validate login form on keyup and submit
	$("#loginFrm").validate({
		rules: {
			username: "required",
			password: "required"
		}
	}); //end login form validation
	
	//Validate signup form on keyup and submit
	$("#regFrm").validate({
		rules: {
			regFullname: {
				required: true
			},
			regUsername: {
				required: true,
				minlength: 5
			},
			regPassword: {
				required: true,
				minlength: 6
			},
			verifyPassword: {
				required: true,
				minlength: 6,
				equalTo: "#regPassword"
			},
			regEmail: {
				required: true,
				email: true
			}, 
			spamcode: "required",
            regAcceptTermsConditions: "required"
		}
     });
	
	//Validate signup form on keyup and submit
	$("#resetFrm").validate({
		rules: {
			resetUsername:  {
				required: true,
				minlength: 5 
			},
			resetEmail: {
				required: true,
                email: true
			}
		}
	});
     
    $("#rerequest-captcha").click(function () {
        var rndmixzer = new Date();
        $("#spamimage").empty();
        $("#spamimage").attr({"src" : "getCaptchaImage.php?rndmixzer=" + rndmixzer.getTime()});
    });
	
});