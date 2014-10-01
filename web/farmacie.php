<!-- 
/*
* farmacie.php is part of OpenFarmacie@Ravenna - http://www.openfarmacieravenna.url.ph
* Released under GPLv3, available at http://www.gnu.org/licenses
* Copyleft 2014, Antonio Notarangelo <progsoul91@gmail.com> - http://plus.google.com/+AntonioNotarangelo
* 
* For any information, send a email to:
* ° Antonio Notarangelo - antonio.notarangelo@outlook.com / progsoul91@gmail.com
* ° Massimiliano Leone - maximilianus@gmail.com
*/
-->
<?php

	function myErrorHandler($errno, $errstr, $errfile, $errline) {
        	if ($errno == E_USER_NOTICE) {
            		die("Errore: {$errstr} - File: {$errfile}:{$errline}");
        	}
        	return false; //Will trigger PHP's default handler if reaches this point.
    	}

	set_error_handler('myErrorHandler');	

	require "table2arr.php";
	require "date_finder.php";

	if(isset($_GET['format']))
		$format = $_GET['format'];
	else
		trigger_error("Inserire un formato per l'output dei dati");

	if (isset($_GET['day']) && isset($_GET['month']) && isset($_GET['year'])) {
		$day = $_GET['day'];
		$month = $_GET['month'];
		$year = $_GET['year'];
	} else if (isset($_GET['day']) && !isset($_GET['month']) && isset($_GET['year']))
		trigger_error('Inserire un mese per la ricerca della farmacia');
	else if (!isset($_GET['day']) && isset($_GET['month']) && isset($_GET['year'])) {
		$month = $_GET['month'];
		$year = $_GET['year'];
	} else if (!isset($_GET['day']) && !isset($_GET['month']) && isset($_GET['year']))
		trigger_error("Non è possibile inserire solamente l'anno per la ricerca");

	$currentDate = date('Y-m-d');
	$currentMonth = date("m",strtotime($currentDate));

	if($month == $currentMonth)
		$data = file_get_contents('http://farmacieravenna.com/turni.asp');
	else if ($month == ($currentMonth + 1))
		$data = file_get_contents('http://farmacieravenna.com/turni2.asp');
	else if ($month == ($currentMonth + 2))
		$data = file_get_contents('http://farmacieravenna.com/turni3.asp');
	else
		trigger_error('Inserire un mese che sia quello corrente oppure uno tra i due a venire');
	
	$g = new table2arr($data); //trasforma in array tutte le tabelle trovate nella pagine web
	$g->getcells(4); //selezioniamo la 4° tabella, cioè quella dei turni
   	$table = $g->cells;  //ottieni l'accesso alle celle della tabella

	$i = 0; 	
	$pharmacies_on_duty = array();
	$forese_cities = array("Alfonsine","Fusignano","Faentino","Cotignola","Barbiano");
	
	foreach($table as $item) {
		if($i % 2 == 1) { //accesso esclusivo agli elementi dispari che sono popolati	
			//tokenizzo la stringa delle città in base al carattere '-' ed elimino
			//gli spazi bianchi all'inizio e alla fine della stringa
			$cities['Ravenna'] = array_map('trim', explode("-", $item[1]));
			$cities['Cervia'] = array_map('trim', explode("-", $item[2]));
			$cities['Forese'] = array_map('trim', explode("-", $item[3]));
						
			$dateArray = find_date($item[0]);
			$date = $dateArray['day']."-".$dateArray['month']."-".$dateArray['year'];

			if(!isset($day))
				$pharmacies_on_duty[$date] = $cities;
			else if ($day == $dateArray['day']) {
				$pharmacies_on_duty[$date] = $cities;
				break;
			}
		}
		$i++;		
	}

	if($format == "json")
		echo json_encode($pharmacies_on_duty);
	else if($format == "array") {
		var_dump($pharmacies_on_duty);
	}
?>