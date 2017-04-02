if (localStorage['pollo'] == "pollo") {
  window.location = "http://www.thekickback.com/rickroll/rickroll.php";
}

var debug;
if (localStorage["debug"]) {
	debug = (localStorage["debug"] == "true");
} else {
	localStorage['debug'] = "true";
	debug = true;
}
function toggleDebug() {
	debug = !debug;
	localStorage['debug'] = debug;
	console.log("Debug = " + debug);
	return debug;
}

function log(msg, type) {
	type = (typeof type === 'undefined') ? 'log' : type;
	if (debug == true) {
		switch(type) {
			case "info":
				console.info(msg);
				break;
			case "warn":
				console.warn(msg);
				break;
			case "error":
				console.error(msg);
				break;
			default:
				console.log(msg);
				break;
		}
	}
}


$(document).ready(function () {
    $("body").tooltip({ selector: '[data-toggle="tooltip"]' });
    
    $("ul.navbar-nav > li > a[href='" + window.location.pathname + window.location.search + "']").append(' <span class="sr-only">(current)</span>').parent().addClass("active");
    
    var hostname = new RegExp(location.host);
    
    // Act on each link
    $('a[href^="http"]:not([target]), a[href^="//"]:not([target])').each(function(){
        $(this).prop('target', '_blank');
    });

    // process the form
    $('form.contactForm').submit(function (event) {
	    var form = $(this);
	    var alertArea = form.find('.alertArea');
        form.find('input, textarea').parent().removeClass("has-error has-success animated shake");
        alertArea.html('');

        var btn = form.find('.submit');
        btn.button('loading');

        // get the form data
        // there are many ways to get this data using jQuery (you can use the class or id also)
        var formData = {
            'contactFormName': form.find('#senderName').val(),
            'contactFormEmail': form.find('#senderEmail').val(),
            'contactFormMessage': form.find('#senderMessage').val()
        };

        // process the form
        $.ajax({
                type: 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url: '/php/contact_process.php', // the url where we want to POST
                data: formData, // our data object
                dataType: 'json', // what type of data do we expect back from the server
                encode: true,
                timeout: 8000,
                error: function (x, t, m) {
	                log("AJAX Error for .contactForm submit.", "error");
                    form.find('.form-group').removeClass('has-success').addClass('has-error'); // remove success, add the error class
                    alertArea.append('<br><div class="alert alert-danger"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span> An unknown error occured. Please attempt another method of contacting me.</div>');
                }
            })
            // using the done promise callback
            .done(function (data) {
                log(data);

                // here we will handle errors and validation messages

                if (!data.success) {
                    // handle errors for name ---------------
                    if (data.errors.name) {
                        form.find('#senderName').parent().addClass('has-error animated shake'); // add the error class to show red input
                        form.find('#senderName').attr("data-original-title", data.errors.name); // add the actual error message under our input
                    } else {
                        form.find('#senderName').parent().addClass('has-success'); // add the error class to show red input
                    }

                    // handle errors for email ---------------
                    if (data.errors.email) {
                        form.find('#senderEmail').parent().addClass('has-error animated shake'); // add the error class to show red input
                        form.find('#senderEmail').attr("data-original-title", data.errors.email); // add the actual error message under our input
                    } else {
                        form.find('#senderEmail').parent().addClass('has-success'); // add the error class to show red input
                    }

                    // handle errors for superhero alias ---------------
                    if (data.errors.message) {
                        form.find('#senderMessage').parent().addClass('has-error animated shake'); // add the error class to show red input
                        form.find('#senderMessage').attr("data-original-title", data.errors.message); // add the actual error message under our input
                    } else {
                        form.find('#senderMessage').parent().addClass('has-success'); // add the error class to show red input
                    }

                    if (data.message) {
                        form.find('.form-group').removeClass('has-success');
                        form.find('.form-group').addClass('has-error'); // add the error class to show red input
                        alertArea.append('<br><div class="alert alert-danger"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span> ' + data.message + '</div>');
                    }

                } else {

                    // ALL GOOD! just show the success message!
                    alertArea.append('<br><div class="alert alert-success"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> ' + data.message + '</div>');

                }

                btn.button('reset');
            });


        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });
    
    //
    // Login Form
    //
    
    function signOut (callback) {
        var formData = {
	        'action': 'logout'
        };
        // process the form
        $.ajax({
                type: 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url: '/php/login.php', // the url where we want to POST
                data: formData, // our data object
                dataType: 'json', // what type of data do we expect back from the server
                encode: true,
                timeout: 8000
            })
            // using the done promise callback
            .done(function (data) {
	            if (callback) {
		            callback(data);
	            }
            });
    }
    
    function signIn (username, password, callback) {
        var formData = {
	        'action': 'login',
            'username': username,
            'password': password,
            'ip': client_ip
        };

        // process the form
        $.ajax({
                type: 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url: '/php/login.php', // the url where we want to POST
                data: formData, // our data object
                dataType: 'json', // what type of data do we expect back from the server
                encode: true,
                timeout: 8000
            })
            // using the done promise callback
            .done(function (data) {
	            if (callback) {
		            callback(data);
	            }
	        });
    }
    
    function validUsername(username) {
        if (username.length <= 16 && username.length >= 4) {
	        return true;
        } else {
	        return false;
        }
    }
    
    function validPassword(password) {
        if (password.length <= 30 && password.length >= 4) {
	        return true;
        } else {
	        return false;
        }
    }
    
    $('#signOut').click(function () {
	    signOut (function (data) {
		    location.reload();
	    });
	    return false;
    });
    
    $('#signIn').click(function () {
	    log("#signIn Clicked.");
        var alertArea = $('#loginModal .alertArea');
        alertArea.html('');
        $('#loginModal').modal('show');
        return false;
    });

    // process the form
    $('#loginForm').submit(function (event) {
	    log("#loginForm submitted.");
        var btn = $('#loginFormSubmit');
        btn.button('login');
        var alertArea = $('#loginModal .alertArea');
        alertArea.html('');
        var username = $('#user_username').val();
        var password = $('#user_password').val();
        if (!validUsername(username)) {
	        log("Invalid Username", "warn");
	        var message = "<div class='alert alert-warning' role='alert'><i class='fa fa-exclamation-triangle'></i> Invalid username.</div>";
	        alertArea.append(message);
        }
        if (!validPassword(password)) {
	        log("Invalid Password", "warn");
	        var message = "<div class='alert alert-warning' role='alert'><i class='fa fa-exclamation-triangle'></i> Invalid password.</div>";
	        alertArea.append(message);
        }
        if (validUsername(username) && validPassword(password)) {
	        // AJAX REQUEST
	        signIn(username, password, function (data) {
		        log(data);
		        if (data.success) {
			        if (data.valid) {
						$('#loginModal .modal-footer').children().addClass('disabled');
	                    var message = "<div class='alert alert-success' role='alert'>You were successfully logged in! The page will refresh in a moment...</div>";
				        alertArea.append(message);
					    setTimeout(function () {location.reload();}, 2000);
			        } else {
	                    var message = "<div class='alert alert-warning' role='alert'><i class='fa fa-exclamation-triangle'></i> Your username or password was incorrect.</div>";
				        alertArea.append(message);
				        btn.button('reset');
			        }
		        } else {
	                var message = "<div class='alert alert-danger' role='alert'><i class='fa fa-exclamation-triangle'></i> Something went wrong...</div>";
			        alertArea.append(message);
				    btn.addClass('disabled');
		        }
			});
        } else {
	        btn.button('reset');
        }
        event.preventDefault();
    });
    
    //
    // END ::: Login Form
    //

    //Smooth Scroll
    //-----------------------------------------------
    if ($(".smooth-scroll").length>0) {
        $('.smooth-scroll a[href*=#]:not([href=#]), a[href*=#]:not([href=#]).smooth-scroll').click(function() {
            if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top-70
                    }, 1000);
                    return false;
                }
            }
        });
    }

});


