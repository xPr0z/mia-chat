var miaChat = function () {
    
    return {
        chatTabs: null,
        
        init: function() {
            this.setupTabs();
            this.addWelcomeTab();
        },

        /**
        * Construct a jQuery UI tabset
        */
        setupTabs: function() {
            this.chatTabs = $("#tabs").tabs();
        },
        
        /**
        * Returns the precreated jQuery UI tabset
        */
        getChatTabs: function() {
            return this.chatTabs;
        },
        
        /**
        * Setup the welcome tab
        */
        addWelcomeTab: function() {
            miaChat.getChatTabs().tabs('add', '#welcome', 'Welcome'); 
            var containerDiv = '<div id="welcome-tab">'+$('#welcomeMessage').val()+'</div>';
            $('div#welcome.ui-tabs-panel').append(containerDiv);   
        },
        
        /**
        * Retrieve buddy list
        */
        getBuddies: function() {
        	$.getJSON("getBuddies.php", function(buddyData) {
        		$.each(buddyData,function(i,item) {
        			var userID         = buddyData[i].bid,
        			    userName       = buddyData[i].username,
        			    buddyName      = buddyData[i].full_name,
        			    buddyHeartbeat = buddyData[i].heartbeat,
        			    buddyStatus    = buddyData[i].status,
        			    buddyExists    = $('#buddy'+userID).length,
        			    buddyListItem,
        			    sameStatus;

        			if (typeof buddyHeartbeat === 'undefined' || buddyHeartbeat === undefined || buddyHeartbeat === null) {
        				buddyHeartbeat = 500; //force offline
        			}

        			if (typeof buddyStatus === 'undefined' || buddyStatus === undefined || buddyStatus === null) {
        				if (buddyHeartbeat < 120) {
        					buddyStatus = "online";
        				} else {
        					buddyStatus = "offline";
        				}
        			}

        			//First verify a grid block exists for this conversation and create it if not
        			if (buddyExists === 0) {
        				buddyListItem = '<li class="'+buddyStatus+'" id="buddy'+userID+'"><a href="#" title="'+buddyName+'">'+userName+'</a></li>';
        				$('#buddylist').append(buddyListItem); //Add the buddy
        				$('#buddy'+userID).bind("dblclick", {username: userName}, function(event) {
        				    //reset the document title back to mia. 
                            miaChat.resetDocumentTitle.call(miaChat, '');
                        	miaChat.startChat.call(miaChat, event.data.username, true);
        				});
        			} else {
        				sameStatus = $('#buddy'+userID).hasClass(buddyStatus); //does current status match previous?
        				if (sameStatus === false) {
        					$('#buddy'+userID).removeClass(); //remove old status
        					$('#buddy'+userID).addClass(buddyStatus); //add/update status
        				}
        			}

        			//end chat window check
        			if (buddyHeartbeat > 120 || buddyStatus === "offline") {
        				$('#buddy'+userID).fadeTo("slow",0.5);  //offline
        			} else {
        				$('#buddy'+userID).fadeTo("slow",1.0); //currently active
        			}
        		});
        	});
        },
        
        /**
        * Submits the contents of the active chat textarea
        */
        chatSubmit: function() {
        	var sendMessageTo = $('#activeChat').val(),
        	    chattext      = $('#'+sendMessageTo+'Input').val();

        	$('#'+sendMessageTo+'Input').val('');
                //do not attempt to send if blank.
        	if ((sendMessageTo !== '') && ($.trim(chattext) !== '')) {            
                var sentdatetime,
                    now = new Date();

                //var sentdatetime= dateFormat(now, "dddd, mmmm d, yyyy, h:MM TT");
                //the year was taking too much space. an entire space of 6 chars... shortend the month to 3 chars. 
                sentdatetime = dateFormat(now, "dddd, mmm d, h:MM TT");

                $.post("addMessage.php",{
        	       message: chattext,
        	       userto: sendMessageTo
        	     }, function(json) {
        			var clnMessage = json,
        			    sentMessage,
        			    inputelement;
        			
        			//Build the message
        			sentMessage='<ul>' + 
        			                '<li class="messageHeaderOwner">Your Message ('+sentdatetime+')</li>' +
                    			    '<li class="messageBodyOwner">'+clnMessage+'</li>' +
                    			'</ul>';

        			//Append the new message just before the input box of the chatwindow
        			inputelement = sendMessageTo+'Input';
        			$('#'+sendMessageTo+'Inner').append(sentMessage); //Add the message to our new grid block
        			$('#'+sendMessageTo+'Inner ul li.messageBodyOwner a').attr("target", "_blank"); //Make any urls open in a new window
        			$('#'+sendMessageTo+'Input').attr("value", ""); //Clear and prepare for the next message
        			miaChat.scrollToBottom(sendMessageTo+'Inner'); //Push the scrollbar to the bottom
        			$('#'+sendMessageTo+'Input')[0].focus(); //DOM give focus
        		});
        	}
        },

        /**
        * Used to move scrollbar to the bottom each time the user submits new content
        * Note: concept comes from http://radio.javaranch.com/pascarello/2005/12/14/1134573598403.html
        */
        scrollToBottom: function(chatWindowToScroll) {
        	var objDiv = document.getElementById(chatWindowToScroll);
        	objDiv.scrollTop = objDiv.scrollHeight;
        },
        
        /**
        * Close/remove an existing chat tab
        */
        chatClose: function(event) {
            $('ul.ui-tabs-nav > li > a').each(function(index) {
                if ((index !== 0) && ($(this).text().trim() === event.data.username)) {
                    //Remove event listeners nio longer required
                    $('#'+event.data.username+'Input').unbind('keyup');
                    $('#'+event.data.username+'-close').unbind('click');
                    //Remove the tab
                    miaChat.getChatTabs().tabs("remove", index);
                }
            });
        },
        
        /**
        * Starts a new chat session and/or resumes and existing one
        */
        startChat: function(username, isBuddyClick) {
        	//First check to see if a chat window for this buddy already exists and ignore request if so
        	if ($('#'+username).length === 0) {
                miaChat.getChatTabs().tabs('add', '#'+username, username+'&nbsp;<img id="'+username+'-close" class="tab-close" src="images/famfamfam_silk_icons/cancel.png" alt="close"/>'); //Add tab for new chat
                
                var containerDiv = '<div id="'+username+'Inner" class="innerChatWindow"></div>' +
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
                $('textarea#'+username+'Input.chatInput').focus(); //Set focus on new window for immediate typing
                $('.emoButton').bind("click", {username: username}, miaChat.emoClicked); //Setup/rebuild emobutton listeners
                $('#'+username+'-close').bind('click', {username: username}, miaChat.chatClose); //Listen for tab close requests
                //bind the keyup event ONLY to the input box to avoid unwanted send on #13
                $('#'+username+'Input').bind('keyup', function(event){
                                                                if (event.keyCode === 13) {
                                                                    miaChat.chatSubmit();
                                                                    miaChat.resetDocumentTitle('');
                                                                }
                                                        });
        	} else {
                //Determine if user is on the tab with the new message
                //If not, change the inactive tabs class for notification
                //bind a click event so that the style will reset back to normal
                if ((username !== $('.ui-tabs-selected > a > span').text()) && (!isBuddyClick) ) {
                    $('.first > ul > li > a > span').each(function(index) {
                        if ((index !== 0) && ($(this).text() === username)) {
                            $(this).attr({"class" : "blinker"});
                            $(this).bind('click', function() {
                                $(this).removeAttr("class");
                                    miaChat.resetDocumentTitle('');
                                });
                        }
                        //@@TODO it'd be nice to break out the .each
                    });
                }
            }

            //select the buddy tab no matter what 
            miaChat.getChatTabs().tabs('select', '#'+username); //select the activated chat tab

            $('textarea#'+username+'Input.chatInput').focus(function () {
                $('#activeChat').attr({"value": username}); //Set as active chat window var
            });
            $('textarea#'+username+'Input.chatInput').click(function () {
                miaChat.resetDocumentTitle('');
            });
            $('textarea#'+username+'Input.chatInput').focus(); //Set focus on new window for immediate typing
        },

        /**
        * Remove buddy
        * Note: Used by the buddy management interface (child window)
        */
        removeBuddyFromList: function(buddyid) {
        	$('#buddy'+buddyid).remove();
        },
        
        /**
        * Emoticon click handler
        */
        emoClicked: function() {
        	var emoId      = this.id,
        	    emoDetails = emoId.split("_||_"),
        	    chatWindow = emoDetails[0]+'Input',
        	    crtChatText;

        	crtChatText = $('#'+chatWindow).val();
        	$('#'+chatWindow).attr("value", crtChatText+this.title); //Replace text with emo symbol
        	$('textarea#'+chatWindow+'.chatInput').focus();
        },
        
        /**
        * Set/reset page title.
        * Note: used to help notify user of new messages
        */
        resetDocumentTitle: function(title) {
            if (title === '') {
                top.document.title = 'Mia';
            } else {
                top.document.title = title; 
            }
        }
        
    };
}();

$(document).ready(function() {
    
    //Startup the tabs interface
     miaChat.init();

    //Setup the Manage Buddies greybox effect
    $("a.greybox").click(function(){
        var t = this.title || $(this).text() || this.href;
        GB_show(t,this.href,600,800);
        return false;
    });
    
    $("a.greybox").click(function(){
        var t = this.title || $(this).text() || this.href;
        GB_show(t,this.href,600,800);
        return false;
    });

    $("#uStatus").change(function () {
        var selectedStatus = $("#uStatus option:selected").val();

        $.ajax({
           type: "POST",
           url: "updateStatus.php",
           data: 'ustatus='+selectedStatus
        }); //end ajax
    });

    $(".showoffline").change(function () {
        var showoffline = $('input[name=showoffline]:checked').val();
        
        $.ajax({
           type: "POST",
           url: "updatePreferences.php",
           data: 'showoffline='+showoffline
        }); //end ajax

        //Clear and run full buddylist refresh
        $('#buddylist').empty(function() {
            miaChat.getBuddies();
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
    
    //Setup the message routines
    $.timer(7500, function() {
	    $.getJSON("getMessages.php", function(json) {
		    $.each(json,function(i,item) {
				var messageid       = json[i].mid,
				    usernameTo      = json[i].username_to,
				    usernameFrom    = json[i].username_from,
				    rand_insert_key = json[i].rand_insert_key,
				    userMessage,
				    inputelement;

				miaChat.startChat(usernameFrom, false); //Start or resume chat
            
                //change the window title as a notification to the user.
				miaChat.resetDocumentTitle('from ' + usernameFrom + ' a message you got');
			
                //Build the new message
				userMessage = '<ul>' + 
				                '<li class="messageHeaderFriend">'+usernameFrom+' ('+json[i].sent_date_time+')</li>' +
                				'<li class="messageBodyFriend">'+json[i].message+'</li>' +
                				'</ul>';
			
				inputelement = usernameFrom+'Input';
				$('#'+usernameFrom+'Inner').append(userMessage); //Add the message to our grid block
				$('#'+usernameFrom+'Inner ul li.messageBodyFriend a').attr("target", "_blank"); //Make any urls open in a new window
			
				miaChat.scrollToBottom(usernameFrom+'Inner'); //Push the scrollbar to the bottom
			}); //end each
        }); //end getJSON
    }); //end timer
	
	//Update buddy list
	$.timer(15000, function() {
		miaChat.getBuddies();
	}); //end timer
	
	//Checkin to confirm online status
	$.timer(10000, function() {
		$.post("doHeartbeat.php");
	});
         
    miaChat.getBuddies(); //Run buddy check at login

});