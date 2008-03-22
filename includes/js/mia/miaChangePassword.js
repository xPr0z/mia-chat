$(document).ready(function() {
    
	//Validate signup form on keyup and submit
	$("#chgPassFrm").validate({
		rules: {
			newPassword: {
				required: true,
				minLength: 6
			},
			verifyPassword: {
				required: true,
				equalTo: "#newPassword"
			},
		},
		messages: {
			newPassword: {
				required: "Please provide a new password",
				minLength: "Your password must be at least 6 characters long"
			},
			verifyPassword: {
				required: "Please verify the password",
				equalTo: "Please enter the same password as above"
			}
		}
	});
	
}); //end doc ready