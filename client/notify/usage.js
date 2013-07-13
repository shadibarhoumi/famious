window.notifyError = function(text) {
	$.notify.error(text);
	setTimeout($.notify.close, 1500);
}