function buddyRemoved(event) {
	var buddyid = event.data.buddyid;
	
	$.ajax({
	   type: "POST",
	   url: "doRemoveBuddy.php",
	   data: 'buddyid='+buddyid
	});
	
	//Now fade out the selected buddy
	$('#buddyremove_'+buddyid).fadeOut("slow");
	window.parent.miaChat.removeBuddyFromList(buddyid); //Remove this buddy on the parent page as well
}

function getBuddies() {
	$.getJSON("getBuddies.php", function(buddyData) {
		//Since we have results append a table to hold them
		var activeBuddyListTableHeader='<h2>Active Buddy List</h2>' +
		                                '<table id="activeBuddyListTable" border="1">' +
                                		'<thead><tr>' +
                                		'<th>Fullname</th>' +
                                		'<th>Username</th>' +
                                		'<th>Email</th>' +
                                		'<th>Remove</th>' +
                                		'</tr></thead>';
		
		//Remove any previous results and start outputting the new table
		$('#activeBuddyList h2').remove();
		$('#activeBuddyListTable').remove();
		$('#activeBuddyList').append(activeBuddyListTableHeader);
					
		$.each(buddyData,function(i,item) {
			var buddyid  = buddyData[i].bid,
			    fullname = buddyData[i].full_name,
			    username = buddyData[i].username,
			    email    = buddyData[i].email,
			    buddyTableRow;
			    
			buddyTableRow = '<tr id="buddyremove_'+buddyid+'">' + 
			                '<td>'+fullname+'</td>' +
                			'<td>'+username+'</td>' +
                			'<td>'+email+'</td>' +
                			'<td class="removeContact"><img id="rmbuddyid_'+buddyid+'" src="images/famfamfam_silk_icons/user_delete.png" alt="Remove buddy" /></td>' +
                			'</tr>';
			
			//append table row
			$('#activeBuddyListTable').append(buddyTableRow);
			//setup an onclick event handler to add the contact
			$('#rmbuddyid_'+buddyid).bind("click", {buddyid: buddyid}, buddyRemoved);
		}); //end each
		
		var activeBuddyListTableFooter='</table>';
		//append table footer
		$('#activeBuddyList').append(activeBuddyListTableFooter);
	}); //end getJSON
}

function buddyAdded(event) {
	var buddyid = event.data.buddyid;
	
	$.ajax({
	   type: "POST",
	   url: "doAddBuddy.php",
	   data: 'buddyid='+buddyid
	});
	
	//Now fade out the selected buddy
	$('#buddyrow_'+buddyid).fadeOut("slow");
	getBuddies(); //Now refresh the active buddy list
	window.parent.miaChat.getBuddies(); //Refresh buddies on parent
}

function buddySearch(event) {
	var username = $('#username').val(),
	    fullname = $('#fullname').val(),
	    email    = $('#email').val();
	
	if (username === '' && fullname === '' && email === '') {
		return false;
	} else {
		$.getJSON("searchBuddies.php", {username: username, fullname: fullname, email: email}, function(json) {
			//Since we have results append a table to hold them
			var buddyTableHeader = '<p>Search Results</p>' +
			                        '<table id="searchResultsTable" border="1">' +
                        			'<thead><tr>' +
                        			'<th>Fullname</th>' +
                        			'<th>Username</th>' +
                        			'<th>Email</th>' +
                        			'<th>Add</th>' +
                        			'</tr></thead>';
			
			//Remove any previous results and start outputting the new table
			$('p').remove();
			$('#searchResultsTable').remove();
			$('#searchResults').append(buddyTableHeader);
						
			$.each(json,function(i,item) {
				var buddyid  = json[i].bid,
				    fullname = json[i].full_name,
				    username = json[i].username,
				    email    = json[i].email,
				    buddyTableRow,
				    buddyTableFooter;

				buddyTableRow = '<tr id="buddyrow_'+buddyid+'">' + 
				                '<td>'+fullname+'</td>' +
                				'<td>'+username+'</td>' +
                				'<td>'+email+'</td>' +
                				'<td class="addContact"><img id="buddyid_'+buddyid+'" src="images/famfamfam_silk_icons/user_add.png" alt="Add buddy" /></td>' +
                				'</tr>';
				
				//append table row
				$('#searchResultsTable').append(buddyTableRow);
				//setup an onclick event handler to add the contact
				$('#buddyid_'+buddyid).bind("click", {buddyid: buddyid}, buddyAdded);
			}); //end each
			
			buddyTableFooter='</table>';
			//append table footer
			$('#searchResults').append(buddyTableFooter);
		}); //end getJSON
	}
}

$(document).ready(function() {
	$('#addBuddyButton').bind("click", {}, buddySearch);	
	getBuddies(); //Load list of curent buddies
    $('#username').focus(); //DOM give focus
});