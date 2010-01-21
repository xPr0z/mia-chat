// post-submit callback 
function showResponse(responseText, statusText)  { 
    if (responseText.created === 'false') {
        alert(responseText.message); //pop the error message
    } else if (responseText.created === 'true') {
        $('#errorMessages').remove();
        $('#setupFrm').remove();
        
        var successHTML = '<div id="messages">' +
                            '<div class="yui-g message">' +
                            '<h2>Installation Information</h2>' +
                            '<p>Mia-Chat has been successfully installed!  For security reasons <strong>remove</strong> the installation folder, then click <a href="../index.php">here</a></p>' +
                            '</div>' +
                            '</div>';

    	$('#messages').replaceWith(successHTML);
    } else {
        alert('Humm... Unknown error!  Please double check your settings.');
    }
}

$(document).ready(function() {
	
	$('#database-fields').hide(); //hide the db field list until we know the type
	
	$(".dbVendor").change(function () {
	    if ($(".dbVendor option:selected").val() === 'none') {
	        $('#database-fields').hide();
	    } else {
	        $('#database-fields').show();
	    }
	    
	    if ($(".dbVendor option:selected").val() === 'sqlite') {
            $('#just-sqlite').show();
            $('#no-sqlite').hide();
        } else { 
            $('#just-sqlite').hide(); //in case this was not the first change and a previous was sqlite
            $('#no-sqlite').show();
        }
    });
    
    var options = { 
        target:     '#installationFrm', //target element(s) to be updated with server response 
        type:       'post',
        dataType:   'json', //'xml', 'script', or 'json' (expected server response type) 
        success:    showResponse  //post-submit callback 
    }; 
 
    //bind to the form's submit event 
    $('#installationFrm').submit(function() { 
        //inside event callbacks 'this' is the DOM element so we first 
        //wrap it in a jQuery object and then invoke ajaxSubmit 
        $(this).ajaxSubmit(options); 
 
        //always return false to prevent standard browser submit and page navigation 
        return false; 
    }); 
});