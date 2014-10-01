/*
* SheetToFusionTable.Setup.gs is part of OpenFarmacie@Ravenna - http://www.openfarmacieravenna.url.ph
* Released under GPLv3, available at http://www.gnu.org/licenses
* Copyleft 2014, Antonio Notarangelo <progsoul91@gmail.com> - http://plus.google.com/+AntonioNotarangelo
* 
* For any information, send a email to:
* ° Antonio Notarangelo - antonio.notarangelo@outlook.com / progsoul91@gmail.com
* ° Massimiliano Leone - maximilianus@gmail.com
*
*
* Based on: 
* Searchable Map Template with Google Fusion Tables
* http://derekeder.com/searchable_map_template/
*/

// Enable the visual refresh
google.maps.visualRefresh = true;

var MapsLib = MapsLib || {};
var MapsLib = {

  //Setup section - put your Fusion Table details here
  //Using the v1 Fusion Tables API. See https://developers.google.com/fusiontables/docs/v1/migration_guide for more info

  //the encrypted Table ID of your Fusion Table (found under File => About)
  //NOTE: numeric IDs will be depricated soon
  fusionTableId:      "1HHfTCUrYsZPIIOguvWEBkeiZWn4bdp9lHXo7XCrW",

  //*New Fusion Tables Requirement* API key. found at https://code.google.com/apis/console/
  //*Important* this key is for demonstration purposes. please register your own.
  googleApiKey:       "AIzaSyASPwrtAnBgnY3a5Sl2m-yaAPdSPcthpCY",

  //name of the location column in your Fusion Table.
  //NOTE: if your location column name has spaces in it, surround it with single quotes
  //example: locationColumn:     "'my location'",
  locationColumn:     "geolocazione",

  map_centroid:       new google.maps.LatLng(44.417615, 12.200509), //center that your map defaults to
  locationScope:      "ravenna",      	 //geographical area appended to all address searches
  recordName:         "risultato",       //for showing number of results
  recordNamePlural:   "risultati",

  searchRadius:       50000,            //in meters
  defaultZoom:        10,             //zoom level when map is loaded (bigger is more zoomed in)
//  addrMarkerImage:    'images/blue-pushpin.png',
  addrMarkerImage:    'www.google.com/mapfiles/ms/micons/yellow-dot.png',
  currentPinpoint:    null,

  initialize: function() {
    $( "#result_count" ).html("");

    geocoder = new google.maps.Geocoder();
    var myOptions = {
      zoom: MapsLib.defaultZoom,
      center: MapsLib.map_centroid,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map($("#map_canvas")[0],myOptions);

    // maintains map centerpoint for responsive design
    google.maps.event.addDomListener(map, 'idle', function() {
        MapsLib.calculateCenter();
    });

    google.maps.event.addDomListener(window, 'resize', function() {
        map.setCenter(MapsLib.map_centroid);
    });

    MapsLib.searchrecords = null;

    //reset filters
    $("#search_address").val(MapsLib.convertToPlainString($.address.parameter('address')));
    var loadRadius = MapsLib.convertToPlainString($.address.parameter('radius'));
	
    if (loadRadius != "") 
		$("#search_radius").val(loadRadius);
    else 
		$("#search_radius").val(MapsLib.searchRadius);
		
    //$(":checkbox").prop("checked", "checked");
    $("#result_box").hide();
    
    //-----custom initializers-------
    
    //-----end of custom initializers-------

    //run the default search
    MapsLib.doSearch();
  },

  doSearch: function(location) {
    MapsLib.clearSearch();
    var address = $("#search_address").val();
    var radius = $("#search_radius").val();
    if (typeof radius !== "undefined" || radius !== "")
      MapsLib.searchRadius = radius;
    else
      // to be improved
      MapsLib.searchRadius = 500000;

    var whereClause = MapsLib.locationColumn + " not equal to ''";

    //-----custom filters-------

	var tempWhereClause = [];
	if ( $("#cbDAProfilattici").is(':checked')) tempWhereClause.push("'distributore_automatico#profilattici' LIKE 'true'");
	if ( $("#cbDASiringhe").is(':checked')) tempWhereClause.push("'distributore_automatico#siringhe' LIKE 'true'");
	if ( $("#cbDAParafarmaci").is(':checked')) tempWhereClause.push("'distributore_automatico#parafarmaco' LIKE 'true'");
	if ( $("#cbSNAEAerosol").is(':checked')) tempWhereClause.push("'servizio_noleggio_apparecchiature_elettromedicinali#aerosol' LIKE 'true'");
	if ( $("#cbSNAEBilanciaPesaneonati").is(':checked')) tempWhereClause.push("'servizio_noleggio_apparecchiature_elettromedicinali#bilancia_pesaneonati' LIKE 'true'");
	if ( $("#cbSNAEBomboleDiOssigeno").is(':checked')) tempWhereClause.push("'servizio_noleggio_apparecchiature_elettromedicinali#bombole_di_ossigeno' LIKE 'true'");
	if ( $("#cbSNAEHolterPressorio").is(':checked')) tempWhereClause.push("'servizio_noleggio_apparecchiature_elettromedicinali#holter_pressorio' LIKE 'true'");
	if ( $("#cbSNAEIonoforesi").is(':checked')) tempWhereClause.push("'servizio_noleggio_apparecchiature_elettromedicinali#ionoforesi' LIKE 'true'");
	if ( $("#cbSNAEMagnetoterapia").is(':checked')) tempWhereClause.push("'servizio_noleggio_apparecchiature_elettromedicinali#magnetoterapia' LIKE 'true'");
	if ( $("#cbSNAEStampelle").is(':checked')) tempWhereClause.push("'servizio_noleggio_apparecchiature_elettromedicinali#stampelle' LIKE 'true'");
	if ( $("#cbSNAETens").is(':checked')) tempWhereClause.push("'servizio_noleggio_apparecchiature_elettromedicinali#tens' LIKE 'true'");
	if ( $("#cbSNAETiralatte").is(':checked')) tempWhereClause.push("'servizio_noleggio_apparecchiature_elettromedicinali#tiralatte' LIKE 'true'");
	if ( $("#cbSNAESeggettaPieghevole").is(':checked')) tempWhereClause.push("'servizio_noleggio_apparecchiature_elettromedicinali#seggetta_pieghevole' LIKE 'true'");
	if ( $("#cbSNAEElettrostimolatore").is(':checked')) tempWhereClause.push("'servizio_noleggio_apparecchiature_elettromedicinali#elettrostimolatore' LIKE 'true'");
	if ( $("#cbSNAEUltrasuoni").is(':checked')) tempWhereClause.push("'servizio_noleggio_apparecchiature_elettromedicinali#ultrasuoni' LIKE 'true'");
	if ( $("#cbSNAEAspitatoreMuco").is(':checked')) tempWhereClause.push("'servizio_noleggio_apparecchiature_elettromedicinali#aspiratore_muco' LIKE 'true'");
	if ( $("#check_up-intolleranze_alimentari").is(':checked')) tempWhereClause.push("'check_up#intolleranze_alimentari' LIKE 'true'");
	if ( $("#check_up-radicali_liberi").is(':checked')) tempWhereClause.push("'check_up#radicali_liberi' LIKE 'true'");
	if ( $("#check_up-analisi_acque").is(':checked')) tempWhereClause.push("'check_up#analisi_acque' LIKE 'true'");
	if ( $("#check_up-misurazione_pressione_arteriosa").is(':checked')) tempWhereClause.push("'check_up#misurazione_pressione_arteriosa' LIKE 'true'");
	if ( $("#check_up-auto_test-analisi_del_sangue").is(':checked')) tempWhereClause.push("'check_up#auto_test#analisi_del_sangue' LIKE 'true'");
	if ( $("#check_up-auto_test-glicemia").is(':checked')) tempWhereClause.push("'check_up#auto_test#glicemia' LIKE 'true'");
	if ( $("#check_up-auto_test-colesterolo").is(':checked')) tempWhereClause.push("'check_up#auto_test#colesterolo' LIKE 'true'");
	if ( $("#check_up-auto_test-gravidanza").is(':checked')) tempWhereClause.push("'check_up#auto_test#gravidanza' LIKE 'true'");
	if ( $("#check_up-auto_test-psa").is(':checked')) tempWhereClause.push("'check_up#auto_test#psa' LIKE 'true'");
	if ( $("#check_up-auto_test-urine").is(':checked')) tempWhereClause.push("'check_up#auto_test#urine' LIKE 'true'");
	if ( $("#check_up-auto_test-menopausa").is(':checked')) tempWhereClause.push("'check_up#auto_test#menopausa' LIKE 'true'");
	if ( $("#check_up-auto_test-sangue_occulto").is(':checked')) tempWhereClause.push("'check_up#auto_test#sangue_occulto' LIKE 'true'");
	if ( $("#check_up-auto_test-helycobacter_pylori").is(':checked')) tempWhereClause.push("'check_up#auto_test#helycobacter_pylori' LIKE 'true'");
	if ( $("#check_up-auto_test-alcool_test").is(':checked')) tempWhereClause.push("'check_up#auto_test#alcool_test' LIKE 'true'");
	if ( $("#check_up-auto_test-drug_detector").is(':checked')) tempWhereClause.push("'check_up#auto_test#drug_detector' LIKE 'true'");
	if ( $("#check_up-auto_test-bilancia_pesapersone").is(':checked')) tempWhereClause.push("'check_up#auto_test#bilancia_pesapersone' LIKE 'true'");
	if ( $("#check_up-spirometria").is(':checked')) tempWhereClause.push("'check_up#spirometria' LIKE 'true'");
	if ( $("#parafarmacia-disponibile").is(':checked')) tempWhereClause.push("'parafarmacia#disponibile' LIKE 'true'");
	if ( $("#parafarmacia-prodotti_dietetici").is(':checked')) tempWhereClause.push("'parafarmacia#prodotti_dietetici' LIKE 'true'");
	if ( $("#parafarmacia-prodotti_omeopatici").is(':checked')) tempWhereClause.push("'parafarmacia#prodotti_omeopatici' LIKE 'true'");
	if ( $("#parafarmacia-prodotti_erboristeria").is(':checked')) tempWhereClause.push("'parafarmacia#prodotti_erboristeria' LIKE 'true'");
	if ( $("#parafarmacia-profumeria").is(':checked')) tempWhereClause.push("'parafarmacia#profumeria' LIKE 'true'");
	if ( $("#parafarmacia-cosmetica").is(':checked')) tempWhereClause.push("'parafarmacia#cosmetica' LIKE 'true'");
	if ( $("#parafarmacia-fitoterapia").is(':checked')) tempWhereClause.push("'parafarmacia#fitoterapia' LIKE 'true'");
	if ( $("#parafarmacia-fitocosmesi").is(':checked')) tempWhereClause.push("'parafarmacia#fitocosmesi' LIKE 'true'");
	if ( $("#parafarmacia-articoli_sanitari").is(':checked')) tempWhereClause.push("'parafarmacia#articoli_sanitari' LIKE 'true'");
	if ( $("#parafarmacia-articoli_infanzia").is(':checked')) tempWhereClause.push("'parafarmacia#articoli_infanzia' LIKE 'true'");
	if ( $("#parafarmacia-lista_per_neonati").is(':checked')) tempWhereClause.push("'parafarmacia#lista_per_neonati' LIKE 'true'");
	if ( $("#parafarmacia-integratori").is(':checked')) tempWhereClause.push("'parafarmacia#integratori' LIKE 'true'");
	if ( $("#parafarmacia-integratori_per_sportivi").is(':checked')) tempWhereClause.push("'parafarmacia#integratori_per_sportivi' LIKE 'true'");
	if ( $("#parafarmacia-libri").is(':checked')) tempWhereClause.push("'parafarmacia#libri' LIKE 'true'");
	if ( $("#parafarmacia-prodotti_veterinari").is(':checked')) tempWhereClause.push("'parafarmacia#prodotti_veterinari' LIKE 'true'");
	if ( $("#parafarmacia-occhiali_da_lettura").is(':checked')) tempWhereClause.push("'parafarmacia#occhiali_da_lettura' LIKE 'true'");
	if ( $("#parafarmacia-giochi").is(':checked')) tempWhereClause.push("'parafarmacia#giochi' LIKE 'true'");
	if ( $("#parafarmacia-alimenti_per_diabetici_e_ciliaci").is(':checked')) tempWhereClause.push("'parafarmacia#alimenti_per_diabetici_e_ciliaci' LIKE 'true'");
	if ( $("#parafarmacia-alimenti_biologici").is(':checked')) tempWhereClause.push("'parafarmacia#alimenti_biologici' LIKE 'true'");
	if ( $("#parafarmacia-prodotti_disponibili_totale").is(':checked')) tempWhereClause.push("'parafarmacia#prodotti_disponibili_totale' LIKE 'true'");
	if ( $("#cbRaccoltaIOR").is(':checked')) tempWhereClause.push("'raccolta_offerte_ior' LIKE 'true'");
	if ( $("#cbForaturaLobi").is(':checked')) tempWhereClause.push("'foratura_lobi' LIKE 'true'");
	
	if(tempWhereClause.length > 0) {
		whereClause += " AND ";
		whereClause += tempWhereClause.join(" AND ");
	}
		
    //-------end of custom filters--------
	if (address == "")
		address = "Ravenna, Ra, Italia";
	
    if (address.toLowerCase().indexOf(MapsLib.locationScope) == -1)
        address = address + " " + MapsLib.locationScope;

    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          MapsLib.currentPinpoint = results[0].geometry.location;

          $.address.parameter('address', encodeURIComponent(address));
          $.address.parameter('radius', encodeURIComponent(MapsLib.searchRadius));
          map.setCenter(MapsLib.currentPinpoint);
          //map.setZoom(14);

          MapsLib.addrMarker = new google.maps.Marker({
            position: MapsLib.currentPinpoint,
            map: map,
            icon: MapsLib.addrMarkerImage,
            animation: google.maps.Animation.DROP,
            title:address
          });
		  
		if ( $("#cbAperteOra").is(':checked')) {
			var currentDate = new Date();
			
			var baseColumnName;
			var currentDay = currentDate.getDate();
			if (currentDay >= 1 && currentDay <= 5)
				baseColumnName = "attività_ordinaria#feriali";
			else
				baseColumnName = "attività_ordinaria#festivi";
				
			var currentHour = currentDate.getHours();
			if (currentHour >= 8 && currentHour <= 13)
				baseColumnName += "#mattino";
			else
				baseColumnName += "#sera";
				
			whereClause += " AND " + "'" + baseColumnName + "#apertura' " + "<= " + currentHour + " AND " + "'" + baseColumnName + "#chiusura' " + ">= " + currentHour;
		}

		if ( $("#cbFarmacieDiTurno").is(':checked')) {
			var dateTextBox = document.getElementById("mydate").value;
			if (dateTextBox ===  "") {
				dateTextBox = new Date();
			} else {
				var parts = dateTextBox.split('/');
				dateTextBox = new Date(parts[2], parts[1]-1, parts[0]);
			}
			
			$.getJSON(getPHPUrl(dateTextBox), function(data) {
				data_from = data;
				var dateKey = Object.keys(data);
				var values = data[dateKey];
				//$('#error').html(JSON.stringify(values));
				var pharmacies = [];
				for (var city in values) {
					var temp = values[city];
					for (var t in temp) {
						if (t !== '_indexOf')
							pharmacies.push(temp[t]);
					}
				}
				
				whereClause += " AND nometurni IN (";
				for(var i = 0; i < pharmacies.length; i++) {
					if (i !== pharmacies.length - 1)
						whereClause += "'" + pharmacies[i] + "',";
					else
						whereClause += "'" + pharmacies[i] + "')";
				}
				
				//esempio da seguire
				//where = "'Store Name' IN (" + filter.join(',') + ')';
				//https://developers.google.com/fusiontables/docs/samples/in?hl=it
				
				whereClause += " AND ST_INTERSECTS(" + MapsLib.locationColumn + ", CIRCLE(LATLNG" + MapsLib.currentPinpoint.toString() + "," + MapsLib.searchRadius + "))";

				MapsLib.drawSearchRadiusCircle(MapsLib.currentPinpoint);
				MapsLib.submitSearch(whereClause, map, MapsLib.currentPinpoint);
			});
		} else {
			whereClause += " AND ST_INTERSECTS(" + MapsLib.locationColumn + ", CIRCLE(LATLNG" + MapsLib.currentPinpoint.toString() + "," + MapsLib.searchRadius + "))";

			MapsLib.drawSearchRadiusCircle(MapsLib.currentPinpoint);
			MapsLib.submitSearch(whereClause, map, MapsLib.currentPinpoint);
		}
          
        }
        else {
          alert("We could not find your address: " + status);
        }
    });
    
  },

  submitSearch: function(whereClause, map, location) {
    //get using all filters
    //NOTE: styleId and templateId are recently added attributes to load custom marker styles and info windows
    //you can find your Ids inside the link generated by the 'Publish' option in Fusion Tables
    //for more details, see https://developers.google.com/fusiontables/docs/v1/using#WorkingStyles

    MapsLib.searchrecords = new google.maps.FusionTablesLayer({
      query: {
        from:   MapsLib.fusionTableId,
        select: MapsLib.locationColumn,
        where:  whereClause
      },
      styleId: 1,
      templateId: 6
    });
	
    MapsLib.searchrecords.setMap(map);
    MapsLib.getCount(whereClause);
  },

  clearSearch: function() {
    if (MapsLib.searchrecords != null)
      MapsLib.searchrecords.setMap(null);
    if (MapsLib.addrMarker != null)
      MapsLib.addrMarker.setMap(null);
    if (MapsLib.searchRadiusCircle != null)
      MapsLib.searchRadiusCircle.setMap(null);
  },

  findMe: function() {
    // Try W3C Geolocation (Preferred)
    var foundLocation;

    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        foundLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        MapsLib.addrFromLatLng(foundLocation);
      }, null);
    }
    else {
      alert("Sorry, we could not find your location.");
    }
  },

  addrFromLatLng: function(latLngPoint) {
    geocoder.geocode({'latLng': latLngPoint}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          $('#search_address').val(results[1].formatted_address);
          $('.hint').focus();
          MapsLib.doSearch();
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
  },

  drawSearchRadiusCircle: function(point) {
      var circleOptions = {
        strokeColor: "#4b58a6",
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: "#4b58a6",
        fillOpacity: 0.05,
        map: map,
        center: point,
        clickable: false,
        zIndex: -1,
        radius: parseInt(MapsLib.searchRadius)
      };
      MapsLib.searchRadiusCircle = new google.maps.Circle(circleOptions);
  },

  query: function(selectColumns, whereClause, callback) {
    var queryStr = [];
    queryStr.push("SELECT " + selectColumns);
    queryStr.push(" FROM " + MapsLib.fusionTableId);
    queryStr.push(" WHERE " + whereClause);

    var sql = encodeURIComponent(queryStr.join(" "));
    $.ajax({url: "https://www.googleapis.com/fusiontables/v1/query?sql="+sql+"&callback="+callback+"&key="+MapsLib.googleApiKey, dataType: "jsonp"});
  },

  handleError: function(json) {
    if (json["error"] != undefined) {
      var error = json["error"]["errors"]
      console.log("Error in Fusion Table call!");
      for (var row in error) {
        console.log(" Domain: " + error[row]["domain"]);
        console.log(" Reason: " + error[row]["reason"]);
        console.log(" Message: " + error[row]["message"]);
      }
    }
  },

  getCount: function(whereClause) {
    var selectColumns = "Count()";
    MapsLib.query(selectColumns, whereClause,"MapsLib.displaySearchCount");
  },

  displaySearchCount: function(json) {
    MapsLib.handleError(json);
    var numRows = 0;
    if (json["rows"] != null)
      numRows = json["rows"][0];

    var name = MapsLib.recordNamePlural;
    if (numRows == 1)
		name = MapsLib.recordName;
    $( "#result_box" ).fadeOut(function() {
        $( "#result_count" ).html(MapsLib.addCommas(numRows) + " " + name + " trovati");
      });
    $( "#result_box" ).fadeIn();
  },

  addCommas: function(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  },

  // maintains map centerpoint for responsive design
  calculateCenter: function() {
    center = map.getCenter();
  },

  //converts a slug or query string in to readable text
  convertToPlainString: function(text) {
    if (text == undefined) return '';
  	return decodeURIComponent(text);
  }
  
  //-----custom functions-------
  // NOTE: if you add custom functions, make sure to append each one with a comma, except for the last one.
  // This also applies to the convertToPlainString function above
  
  //-----end of custom functions-------
}
