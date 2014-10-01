function getPHPUrl(dateTextBox) {

	var hour = new Date().getHours();

	var day;
	//console.log(hour);
	if (hour<8 && hour>0) {
		
	//if (hour>8 || hour<13) {
	    day = (dateTextBox.getDate()-1);
	} else 
	    day = dateTextBox.getDate();

	var year = dateTextBox.getFullYear();
	var month = dateTextBox.getMonth()+1;

	//var phpUrl = "http://turnifarmacie.url.ph/farmacie.php?format=json&month="+month+"&year="+year+"&day="+day;
	var phpUrl = "http://localhost/farmacie.php?format=json&month="+month+"&year="+year+"&day="+day;
	
// 	console.log(phpUrl);

	return phpUrl;
}