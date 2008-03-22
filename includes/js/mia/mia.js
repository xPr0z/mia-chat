$(document).ready(function() {

        //Setup the Manage Buddies greybox effect
        $("a.greybox").click(function(){
            var t = this.title || $(this).text() || this.href;
            GB_show(t,this.href,600,800);
            return false;
        });

        $("#uStatus").change(function () {
                var selectedStatus=$("#uStatus option:selected").val();

                $.ajax({
                   type: "POST",
                   url: "updateStatus.php",
                   data: 'ustatus='+selectedStatus
                }); //end ajax
        });

        $(".showoffline").change(function () {
                var showoffline=$('input[name=showoffline]:checked').val();
                $.ajax({
                   type: "POST",
                   url: "updatePreferences.php",
                   data: 'showoffline='+showoffline
                }); //end ajax

                //Clear and run full buddylist refresh
                $('#buddylist').empty(function() {
                        getBuddies();
                });
        });

        //Allow the budy list to be minimized and maximized
        $('#minmax').bind("click", {}, function(){
                $('#nav').slideToggle("slow");
        });

        //Hide user preferences by default and allow user to toggle as needed
        $('#userPreferences').hide();
        $('#preferences').bind("click", {}, function(){
                $('#userPreferences').slideToggle("slow");
        });

        //Startup the tabs interface
        $('.first > ul').tabs()
                .bind('select.ui-tabs', function(e, ui) {
                //Event select
                        //alert('event: ' + e.type);
        })
                .bind('show.ui-tabs', function(e, ui) {
                    //Push the scrollbar to the bottom
                        var chatSelected = $('.ui-tabs-selected > a > span').text();
                        //@@TODO It might be better that we try to grab the id of the first tab, instead of text
                        if (chatSelected !== 'Welcome')
                            scrollToBottom(chatSelected+'Inner');
                }
        );
                
        //well, add the first tab for news, updates, etc etc etc...
        addWelcomeTab();
        
        //set the splitter
        $("#mia-splitter").splitter({
            type: 'v',
            initA: true,	// use width of A (#LeftPane) from styles
            accessKey: '|'
        });
        // Firefox doesn't fire resize on page elements
        $(window).bind("resize", function(){
            $("#mia-splitter").trigger("resize"); 
        }).trigger("resize");
        
        //Setup the message routines
        $.timer(5000, function() {
		$.getJSON("getMessages.php", function(json) {
			$.each(json,function(i,item) {
				var messageid=json[i].mid;
				var usernameTo = json[i].username_to;
				var usernameFrom=json[i].username_from;
				var rand_insert_key=json[i].rand_insert_key;

				startChat(usernameFrom, false); //Start or resume chat
                
                //change the window title as a notification to the user.
				resetDocumentTitle('from ' + usernameFrom + ' a message you got');
				
                //Build the new message
				var userMessage='<ul>' + 
				'<li class="messageHeaderFriend">'+usernameFrom+' ('+json[i].sent_date_time+')</li>' +
				'<li class="messageBodyFriend">'+json[i].message+'</li>' +
				'</ul>';
				
				var inputelement=usernameFrom+'Input';
				$('#'+usernameFrom+'Inner').append(userMessage); //Add the message to our grid block
				$('#'+usernameFrom+'Inner ul li.messageBodyFriend a').attr("target", "_blank"); //Make any urls open in a new window
				
				scrollToBottom(usernameFrom+'Inner'); //Push the scrollbar to the bottom
				
				//Remove the message after it has been delivered
				$.ajax({
				   type: "POST",
				   url: "removeMessage.php",
				   data: 'message_id='+messageid+'&insert_key='+rand_insert_key
				}); //end ajax
			}); //end each
		}); //end getJSON
	}); //end timer
	
	//Update buddy list
	$.timer(15000, function() {
		getBuddies();
	}); //end timer
	
	//Checkin to confirm online status
	$.timer(10000, function() {
		$.post("doHeartbeat.php");
	});
         
    getBuddies(); //Run buddy check at login

}); //end doc ready


function addWelcomeTab() {
        $('.first > ul').tabs('add', '#welcome', 'Welcome'); 
        var containerDiv='<div id="welcome-tab">we welcome you!!! <br/><br/><br/><br/><br/>....</div>';
        $('div#welcome.ui-tabs-panel').append(containerDiv);
    
}

function getBuddies() {
	$.getJSON("getBuddies.php", function(buddyData) {
		$.each(buddyData,function(i,item) {
			var userID=buddyData[i].bid;
			var userName=buddyData[i].username;
			var buddyName=buddyData[i].full_name;
			var buddyHeartbeat=buddyData[i].heartbeat;
			if (typeof buddyHeartbeat=='undefined' || buddyHeartbeat===undefined || buddyHeartbeat===null) {
				buddyHeartbeat=500; //force offline
			}
			
			var buddyStatus=buddyData[i].status;
			if (typeof buddyStatus=='undefined' || buddyStatus===undefined || buddyStatus===null) {
				if (buddyHeartbeat<120) {
					buddyStatus="online";
				} else {
					buddyStatus="offline";
				}
			}

			//First verify a grid block exists for this conversation and create it if not
			var buddyExists=$('#buddy'+userID).length;
			if (buddyExists===0) {
				var buddyListItem='<li class="'+buddyStatus+'" id="buddy'+userID+'"><a href="#" title="'+buddyName+'">'+userName+'</a></li>';
				$('#buddylist').append(buddyListItem); //Add the buddy
				$('#buddy'+userID).bind("dblclick", {username: userName}, buddyClick); //Setup an dblclick event handler
			} else {
				var sameStatus = $('#buddy'+userID).hasClass(buddyStatus); //does current status match previous?
				if (sameStatus==false) {
					$('#buddy'+userID).removeClass(); //remove old status
					$('#buddy'+userID).addClass(buddyStatus); //add/update status
				}
			}
			
			//end chat window check
			if (buddyHeartbeat>120 || buddyStatus=="offline") {
				$('#buddy'+userID).fadeTo("slow",0.5);  //offline
			} else {
				$('#buddy'+userID).fadeTo("slow",1.0); //currently active
			}
		}); //end each
	}); //end getJSON
}
	
function chatSubmit() {
	var sendMessageTo=$('#activeChat').val();
	var chattext=$('#'+sendMessageTo+'Input').val();
        //do not attempt to send if blank.
	if ((sendMessageTo!=='') && ($.trim(chattext) !== '')) {            
            var now = new Date();
            //var sentdatetime= dateFormat(now, "dddd, mmmm d, yyyy, h:MM TT");
            //the year was taking too much space. an entire space of 6 chars... shortend the month to 3 chars. 
            var sentdatetime= dateFormat(now, "dddd, mmm d, h:MM TT");
            $.post("addMessage.php",{
	       message: chattext,
	       userto: sendMessageTo
	     }, function(json) {
			var clnMessage=json;
			//Build the message
			var sentMessage='<ul>' + 
			'<li class="messageHeaderOwner">Your Message ('+sentdatetime+')</li>' +
			'<li class="messageBodyOwner">'+clnMessage+'</li>' +
			'</ul>';
			//Append the new message just before the input box of the chatwindow
			var inputelement=sendMessageTo+'Input';
			$('#'+sendMessageTo+'Inner').append(sentMessage); //Add the message to our new grid block
			$('#'+sendMessageTo+'Inner ul li.messageBodyOwner a').attr("target", "_blank"); //Make any urls open in a new window
			$('#'+sendMessageTo+'Input').attr("value", ""); //Clear and prepare for the next message
			scrollToBottom(sendMessageTo+'Inner'); //Push the scrollbar to the bottom
			$('#'+sendMessageTo+'Input')[0].focus(); //DOM give focus
		}); //end post
	} //end if
} //end submit

/* Used to move scrollbar to the bottom each time the user submits new content
   Note: concept comes from http://radio.javaranch.com/pascarello/2005/12/14/1134573598403.html
*/
function scrollToBottom(chatWindowToScroll) {
	var objDiv = document.getElementById(chatWindowToScroll);
	objDiv.scrollTop = objDiv.scrollHeight;
}

function getSelectedTab() {
	var tabs = $('.first > ul').tabs();
	var selected = tabs.data('selected.ui-tabs');
	return selected;
}

function chatClose() {
	//Identify the selected tab and remove it
	var selected = getSelectedTab();
	$('.first > ul').tabs("remove", selected);
}

function buddyClick(event) {
    //reset the document title back to mia. 
    resetDocumentTitle('');
	startChat(event.data.username, true);	
}

function startChat(username, isBuddyClick) {
	//First check to see if a chat window for      
    //this buddy already exists and ignore request if so
	var chatwindowExists=$('div#'+username+'.ui-tabs-panel').length;

	if (chatwindowExists===0) {
                $('.first > ul').tabs('add', '#'+username, username); //Activate tab for new chat
                var containerDiv='<span class="chatWindowClose"><a id="'+username+'Close" title="Close"><img src="images/famfamfam_silk_icons/cancel.png" alt="Close"/></a></span>' +
                        '<div id="'+username+'Inner" class="innerChatWindow"></div>' +
                                '<div id="'+username+'Footer" class="containerFooter">' +
                                        '<ul id="emoticon">' +
                                                '<li><img class="emoButton" title="0-]" id="'+username+'_||_face_angel" src="images/tango/smiles/face-angel.png" alt="face-angel" /></li>' +
                                                '<li><img class="emoButton" title="8-(" id="'+username+'_||_face_crying" src="images/tango/smiles/face-crying.png" alt="face-crying" /></li>' +
                                                '<li><img class="emoButton" title="!)" id="'+username+'_||_face_devilish" src="images/tango/smiles/face-devilish.png" alt="face-devilish" /></li>' +
                                                '<li><img class="emoButton" title="8)" id="'+username+'_||_face_glasses" src="images/tango/smiles/face-glasses.png" alt="face-glasses" /></li>' +
                                                '<li><img class="emoButton" title=":-)" id="'+username+'_||_face_grin" src="images/tango/smiles/face-grin.png" alt="face-grin" /></li>' +
                                                '<li><img class="emoButton" title=":(" id="'+username+'_||_face_sad" src="images/tango/smiles/face-sad.png" alt="face-sad" /></li>' +
                                                '<li><img class="emoButton" title=":)" id="'+username+'_||_face_smile" src="images/tango/smiles/face-smile.png" alt="face-smile" /></li>' +
                                                '<li><img class="emoButton" title="0-)" id="'+username+'_||_face_surprise" src="images/tango/smiles/face-surprise.png" alt="face-surprise" /></li>' +
                                                '<li><img class="emoButton" title=";)" id="'+username+'_||_face_wink" src="images/tango/smiles/face-wink.png" alt="face-wink" /></li>' +
                                        '</ul>' +
                                        '<textarea id="'+username+'Input" class="chatInput" rows="4"></textarea>' +
                                '</div>';

                $('div#'+username+'.ui-tabs-panel').append(containerDiv);
                $('.emoButton').bind("click", {username: username}, emoClicked); //Setup an onclick event handler
                $('#'+username+'Close').bind("click", {username: username}, chatClose); //Setup a close event handler
                //bind the keyup event ONLY to the input box to avoid unwanted send on #13
                $('#'+username+'Input').keyup(function(event){
                                                                if (event.keyCode == 13) {
                                                                    chatSubmit();
                                                                    resetDocumentTitle('');
                                                                }
                                                        });                 
	} 
    else {
                //Determine if user is on the tab with the new message
                //If not, change the inactive tabs class for notification
                //bind a click event so that the style will reset back to normal
                if ((username !== $('.ui-tabs-selected > a > span').text()) && (!isBuddyClick) ) {
                    $('.first > ul > li > a > span').each(function(index) {
                        if ((index != 0) && ($(this).text() === username)) {
                            $(this).attr({"class" : "blinker"});
                            $(this).bind('click', function() {
                                    $(this).removeAttr("class");
                                    resetDocumentTitle('')
                                    })
                        }
                        //@@TODO it'd be nice to break out the .each
                    });
                    //do not select/activate the tab. just blink.
                    return;
                }
        }

        //select the buddy tab no matter what 
        $('.first > ul').tabs('select', '#'+username); //select the activated chat tab
        $('textarea#'+username+'Input.chatInput').focus(function () {
                $('#activeChat').attr({"value": username}); //Set as active chat window var
        });
        $('textarea#'+username+'Input.chatInput').click(function () {
                resetDocumentTitle('');
        });
        $('textarea#'+username+'Input.chatInput').focus(); //Set focus on new window for immediate typing

}

//To be used by the buddy management interface (child window)
function removeBuddyFromList(buddyid) {
	$('#buddy'+buddyid).remove();
} 

function emoClicked() {
	var emoId = this.id;
	var emoDetails = emoId.split("_||_");
	var chatWindow = emoDetails[0]+'Input';
	
	crtChatText=$('#'+chatWindow).val();
	$('#'+chatWindow).attr("value", crtChatText+this.title); //Replace text with emo symbol
	$('textarea#'+chatWindow+'.chatInput').focus();
}


function resetDocumentTitle(title) {
    if (title === '')
        top.document.title = 'Mia'; 
    else 
        top.document.title = title; 
}