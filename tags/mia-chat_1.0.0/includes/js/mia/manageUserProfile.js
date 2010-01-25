function updateUserProfile() {
    $('#profUpdateProcess').text('Updating your profile');
    $('#profUpdateProcess').fadeIn('slow');

    var inputFields = [];
    $(':input', $('#updateProfileFrm')).each(function() {
        inputFields.push(this.name + '=' + escape(this.value));
    });

    $.ajax({
        type: 'POST',
        url: 'doUpdateUserProfile.php',
        data: inputFields.join('&'),
        timeout: 10000,
        error: function() {
            $('#profUpdateProcess').text('failed to send your request');
        },
        success: function(r) {
            $('#profUpdateProcess').text(r);
            if (r === 'Your profile successully updated.') {
                window.parent.$('#who-am-i').text($('#profFullName').val()); //Remove this buddy on the parent page as well
            }
        }
    });
    
    return false;
}

function getUserProfile() {
    $.getJSON('getUserProfile.php', function(userProfile) {
        $.each(userProfile,
        function(i, item) {
            //we only need those so far.
            $('#profFullName').val(userProfile[i].full_name);
            $('#profEmail').val(userProfile[i].email);
        });
    });
}

$(document).ready(function() {
    getUserProfile();
    //Load list of curent buddies
    $('#profFullname').focus();
    //DOM give focus
    $('#updateProfileFrm').validate({
        debug: true,
        rules: {
            profFullName: {
                required: true
            },
            profEmail: {
                required: true,
                email: true
            },
            verifyPassword: {
                required: true
            }
        },
        submitHandler: function(form) {
            updateUserProfile();
        }
    });

    $('#profFullName').focus();
});