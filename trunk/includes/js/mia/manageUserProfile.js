$(document).ready(function() {	
	getUserProfile(); //Load list of curent buddies
    $('#profFullname').focus(); //DOM give focus
    
    $('#updateProfileFrm').validate({
        rules: {
            profFullName: {
                required: true,
                maxLength:100 
            },
            profEmail: {
                required: true,
                email: true,
                maxLength: 100
            },
            verifyPassword : {
                required: true
            }
        },
        submitHandler: function(form) {
            updateUserProfile();
        } 
     });
     
     $('#profFullName').focus();
});


function updateUserProfile() {
    $('#profUpdateProcess').text('Updating your profile');
    $('#profUpdateProcess').fadeIn('slow');    
    

	var inputFields = [];
	$(':input', $('#updateProfileFrm')).each(function() {
        inputFields.push(this.name + '=' + escape(this.value));
	})
    
	$.ajax({
		type: 'POST',
		url: 'doUpdateUserProfile.php',		
		data: inputFields.join('&'),
		timeout: 10000,
		error: function() {
		  $('#profUpdateProcess').text('failed to send your request');
		},
		success: function(r) { 
		  //$('#profUpdateProcess').fadeOut('slow');
		  $('#profUpdateProcess').text(r);
          if (r === 'Your profile successully updated.')
            window.parent.$('#who-am-i').text($('#profFullName').val()); //Remove this buddy on the parent page as well
		}
	});	
	return false;
}

function getUserProfile() {
    $.getJSON('getUserProfile.php', function(userProfile) {
		$.each(userProfile,function(i,item) {
			//we only need those so far.
            $('#profFullName').val(userProfile[i].full_name) ;
            $('#profEmail').val(userProfile[i].email) ;             
		}); //end each
	}); //end getJSON
}