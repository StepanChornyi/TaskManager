async function signin(){
	let email = $('input#signinEmail').val();
	let password = $('input#signinPassword').val();
	let emailValid = false,
		passwordValid =  false;
	var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if(reg.test(email)){
		let input = {
			email: email
		};
		let result;
	    await $.ajax({
			type : "POST",
			contentType : "application/json",
			url : window.location + "api/signin/email",
			data : JSON.stringify(input),
			dataType : 'json',
			success : function(answer) {
				result = answer;
			},
			error : function(e) {
				console.log("ERROR: ", e);
			}
		});
		if(result.valid){
			document.getElementById('signinPasswordInvalid').innerHTML =  "Wrong password!";
			document.getElementById('signinEmailInvalid').innerHTML =  "";
			let emailInput = $("#signinEmail");
			validationShow(emailInput, true);
			emailValid = true;
		}else{
			document.getElementById('signinEmailInvalid').innerHTML =  "Wrong email!";
			document.getElementById('signinPasswordInvalid').innerHTML =  "";
			emailValid = false;
		}
	}else{
		document.getElementById('signinEmailInvalid').innerHTML =  "Wrong email!";
		document.getElementById('signinPasswordInvalid').innerHTML =  "";
		emailValid = false;
	}
	reg = /^[A-Za-z0-9_.]+$/;
	if(password.split(" ").join("").length == 0 ||
	   password.length < 8 ||
	   password.length > 20 ||
	   !reg.test(password)){
		passwordValid = false;
	}else{
		let input = {
			email: email,
			password: password
		};
		let result;
	    await $.ajax({
			type : "POST",
			contentType : "application/json",
			url : window.location + "api/signin/password",
			data : JSON.stringify(input),
			dataType : 'json',
			success : function(answer) {
				result = answer;
			},
			error : function(e) {
				console.log("ERROR: ", e);
			}
		});
		if(result.valid){
			passwordValid = true;
			let passwordInput = $("#signinPassword");
			validationShow(passwordInput, passwordValid);
		}else{
			passwordValid = false;
		}
	}
	if(emailValid && passwordValid){
		$('#signinForm').submit();
	}else{
		let emailInput = $("#signinEmail");
		let passwordInput = $("#signinPassword");
		validationShow(emailInput, emailValid);
		validationShow(passwordInput, passwordValid);
	}
}
async function signup(){
	let email = $('input#signupEmail').val();
	let password = $('input#signupPassword').val();
	let repeatPassword = $('input#signupRepeatPassword').val();
	let emailValid = false,
		passwordValid = false,
		repeatPasswordValid = undefined;
	var reg = /^[A-Za-z0-9_.]+$/;
	if(password.split(" ").join("").length == 0 ||
	   password.length < 8 ||
	   password.length > 20 ||
	   !reg.test(password)){
		passwordValid = false;

	}else{
		passwordValid = true;
	}
	if(password == repeatPassword && repeatPassword.length != 0 && passwordValid){
		repeatPasswordValid = true;
	}else {
		if(passwordValid){
			document.getElementById('signupRepeatPasswordInvalid').innerHTML =  "Passwords do not coincide!";
		}else{
			document.getElementById('signupRepeatPasswordInvalid').innerHTML =  "";
		}
		repeatPasswordValid = false;
	}
	reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if(reg.test(email)){
		let input = {
			email: email
		};
		let result;
	    await $.ajax({
			type : "POST",
			contentType : "application/json",
			url : window.location + "api/signup/email",
			data : JSON.stringify(input),
			dataType : 'json',
			success : function(answer) {
				result = answer;
			},
			error : function(e) {
				console.log("ERROR: ", e);
			}
		});
		if(!result.valid){
			document.getElementById('signupEmailInvalid').innerHTML =  "This email has already been used";
			emailValid = false;
		}else{
			emailValid = true;
		}
	}else{
		document.getElementById('signupEmailInvalid').innerHTML =  "Bad email. An example of a good email: 'email@mail.com'";
		emailValid = false;
	}
	if(emailValid && passwordValid && repeatPasswordValid){
		$('#signupForm').submit();
	}else{
		let emailInput = $("#signupEmail");
		let passwordInput = $("#signupPassword");
		let repeatPasswordInput = $("#signupRepeatPassword");

		validationShow(emailInput, emailValid);
		validationShow(passwordInput, passwordValid);
		validationShow(repeatPasswordInput, repeatPasswordValid);
	}
}

function switchToSignUp(){
	$('#signinBlock').attr('style', 'display:none;');
	$('#signupBlock').attr('style', 'display:block;');
	$("#signinEmail").val("");
	$("#signinPassword").val("");
	validationClassDelete([$("#signinEmail"), $("#signinPassword")]);
}
function switchToSignIn(){
	$('#signupBlock').attr('style', 'display:none;');
	$('#signinBlock').attr('style', 'display:block;');
	$("#signupEmail").val("");
	$("#signupPassword").val("");
	$("#signupRepeatPassword").val("");
	validationClassDelete([$("#signupEmail"), $("#signupPassword"), $("#signupRepeatPassword")]);
}

function validationShow(element, valid){
	if(valid){
		element.removeClass("is-invalid");
		element.addClass("is-valid");
	}else{
		element.removeClass("is-valid");
		element.addClass("is-invalid");
	}
}
function validationClassDelete(elements){
	elements.forEach(function(element) {
		element.removeClass("is-invalid");
		element.removeClass("is-valid");
	});
}
