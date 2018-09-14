function A() {
	firebase.initializeApp({
		apiKey: "AIzaSyDq202HByiyxVjJ7H1GVxDiJyG53frzzNg",
		authDomain: "accounter-b1e8f.firebaseapp.com",
		databaseURL: "https://accounter-b1e8f.firebaseio.com",
		projectId: "accounter-b1e8f",
		storageBucket: "",
		messagingSenderId: "889388335353"
	});
	var auth = firebase.auth();
	var db = firebase.database(),
		transactionRef = db.ref('transactions'),
		balanceRef = db.ref('balance'),
		amtRef = db.ref('amt');
	var user;
	var c = 0,
		b = 0;
	var userSignedIn = function(user) {
		$('#userSignedIn').show();
		$('#userSignedOut').hide();
		$('#barea').show();
		$('#add').addClass('disabled');
	};
	var userSignedOut = function() {
		$('#userSignedIn').hide();
		$('#userSignedOut').show();
		$('#barea').hide();
		$('#larea').hide();
		$('#add').removeClass('disabled');
	};
	var limit = 50;
	amtRef.transaction(function(d) {
		return d;
	}, function(err, commit, val) {
		c = val.val();
	});
	balanceRef.transaction(function(d) {
		return d;
	}, function(err, commit, val) {
		b = val.val();
		$('#balance').html('<span>$' + b + '</span>');
	});
	auth.onAuthStateChanged(function(user) {
		user ? userSignedIn(user) : userSignedOut();
		if (user) {
			userName = auth.currentUser.displayName;
		}
	});
	$('#add').click(function() {
		$('.modal').toggleClass('is-active');
		$('#amt').val('');
		$('#amt').removeClass('is-success is-danger');
		$('#memo').val('');
	});
	$('.modal-background').click(function() { $('.modal').toggleClass('is-active'); });
	$('.modal-close').click(function() { $('.modal').toggleClass('is-active'); });
	$('#btab').click(function() {
		$(this).addClass('is-active');
		$('#ltab').removeClass('is-active');
		$('#larea').hide();
		$('#barea').show();
	});
	$('#ltab').click(function() {
		$(this).addClass('is-active');
		$('#btab').removeClass('is-active');
		$('#barea').hide();
		$('#larea').show();
	});
	$('#cancel').click(function() { $('.modal').toggleClass('is-active'); });
	$('#memo').bind('input propertychange', function() {
		if ($(this).val().length > limit) {
			$('#memchar').addClass('red');
		}
		else {
			$('#memchar').removeClass('red');
		}
		$('#memchar').html($('#memo').val().length + "/50");
	});
	$('.change').click(function() {
		var el = $(this);
		if (isNaN($('#amt').val()) || $('#memo').val().length > limit) {
			$('#amt').addClass('is-danger');
			$('.modal-card-body').addClass('red-outline');
		}
		else {
			$('#amt').removeClass('is-danger');
			$('#amt').addClass('is-success');
			db.ref('transactions/' + c).set({
				'ts': firebase.database.ServerValue.TIMESTAMP,
				'amt': $('#amt').val(),
				'u': auth.currentUser.displayName,
				'mem': $('#memo').val(),
				'change': $(this).hasClass('plus') ? "add" : "sub"
			});
			balanceRef.transaction(function(d) {
				var v = $('#amt').val();
				if (el.hasClass('plus')) {
					v *= -1;
				}
				return d - v;
			}, function(err, commit, val) {
				b = val.val();
				$('#balance').html('<span>$' + b + '</span>');
			});
			amtRef.transaction(function(d) {
				return d + 1;
			}, function(err, commit, val) {
				c = val.val();
			});
			$('.modal').toggleClass('is-active');
		}
	});
	transactionRef.on('child_added', function(d) {
		var v = d.val();
		v.id = d.key;
		$('#tbparent').append("<tr id='" + v.id + "'><td>" + v.id + "</td><td>" + v.u + "</td><td>" + v.amt + "</td><td><span class='icon " + (v.change === "add" ? 'has-text-success' : 'has-text-danger') + "'><i class='fas fa-lg fa-" + (v.change === "add" ? 'plus' : 'minus') + "'</i></span></td></tr>");
	});
}
var a = new A();
