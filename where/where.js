//variables
var mylat;
var mylng;
var stations = [];
var ashmontBranch = [];
var braintreeBranch = [];
var tMarkers = [];
var mypos;
var tRequest = new XMLHttpRequest();
var cwRequest = new XMLHttpRequest();
var carmen;
var waldo;

//get my location
function getMyLocation() {
	mylat = -99999;
	mylng = -99999;
	if (navigator.geolocation) {
	    // the navigator.geolocation object is supported on your browser
	    navigator.geolocation.getCurrentPosition(function(position) {
                mylat = position.coords.latitude;
                mylng = position.coords.longitude;
                renderMap();	
        });
    }
    else {
        
        alert("Geolocation is not supported by your web browser.  What a shame!");
    }
}

//render my position on map after receiving location, include marker image and info window 
//that shows distance to closest station
function renderMap() {
	
	mypos = new google.maps.LatLng(mylat, mylng);
	
	map.panTo(mypos);
	
	var image = 'testmarker2.png';
	
	var marker = new google.maps.Marker({
	        position: mypos,
	        title: "You are here",
	        icon: image
	});
	
	marker.setMap(map);
	
	var infowindow = new google.maps.InfoWindow();
	
	google.maps.event.addListener(marker, 'click', function() {
	        infowindow.setContent(marker.title);
	        infowindow.open(map,marker);
	});
	nearestStation = shortestdist(mylat, mylng, tMarkers);
	marker.title += "<br/>" + "The nearest Red Line station is " + nearestStation[0].title + 
	"<br/>" + "and the distance is " + nearestStation[0].distance + " miles."; 
	
	tParse();
	cwParse();
	
}

// send MBTA request
function tParse() {
	tRequest.open("GET", "http://mbtamap.herokuapp.com/mapper/redline.json", true);
	tRequest.send(null);
	tRequest.onreadystatechange = tCallback;
}

//callback function for MBTA request with error handling
function tCallback() {
    try {
        if (tRequest.readyState == 4 && tRequest.status == 200) {
            input = JSON.parse(tRequest.responseText);
//add table to infowindow when schedule data received
            for (o = 0; o < tMarkers.length; o++) {
                tMarkers[o].title += "<br/>" + "<table>" + "<tr>" + "<td>" + "Trip #" +
                "</td>" + "<td>" + "Direction" + "<td/>" + "<td>" + "Remaining Time" +" <td/>" +
                "<tr/>" 
                + func() +
                + "<table/>";
            }
        }
        else {
            if((tRequest.readyState == 4 && tRequest.status == 0)|| (tRequest.status == 324)) {
                throw "noresponse";
            }
        }
    }
    catch(error) {
        if (error == "noresponse") {
            alert("no MBTA data returned");
        }
    }
    
}

//function to create table in info windows for stations
function func () {
    table = "";
	for (i=0; i < input.length; i++) {
	    if (input[i].PlatformKey == (tMarkers[o].stationID + "N")){//compare station ID with platform key
	        tableLine = "<tr>" + "<td> " + input[i].Trip + "<td/>" + "<td> " + "Northbound" + "<td/>"
	        + "<td> " + input[i].TimeRemaining + "<td/>" + "<tr/>";
	        table += tableLine;
	} }
	for (i=0; i < input.length; i++) {
        if (input[i].PlatformKey == (tMarkers[o].stationID + "S")){
            tableLine = "<tr>" + "<td> " + input[i].Trip + "<td/>" + "<td> " + "Southbound" + "<td/>"
            + "<td> " + input[i].TimeRemaining + "<td/>" + "<tr/>";
            table += tableLine;
    } }
    
    return table;
}

//send Carmen and Waldo request
function cwParse() {
    cwRequest.open("GET", "http://messagehub.herokuapp.com/a3.json", true);
    cwRequest.send(null);
    cwRequest.onreadystatechange = cwCallback;
}

//callback function for Carmen and Waldo request with error handling
function cwCallback() {
    try {
        if (cwRequest.readyState == 4 && cwRequest.status == 200) {
            input = JSON.parse(cwRequest.responseText);
            renderCW();
        }
        else {
            if(cwRequest.readyState == 4 && cwRequest.status == 0) {
                throw "noresponse";
            }
        }
    }
    catch(error) {
        if (error == "noresponse") {
            alert("no Carmen and Waldo data returned");
        }
    }
}

//render whereabouts of Carmen and Waldo, add clickable image marker that shows name and distance to you
function renderCW() {

	for (i=0; input.length; i++) {
	    
	    pos = new google.maps.LatLng(input[i].loc.latitude, input[i].loc.longitude);
//for Carmen
	    if (input[i].name == "Carmen Sandiego") {
	        
	        var image = 'carmen.png'; 
	        
	        var marker1 = new google.maps.Marker({
	                position: pos,
	                title: input[i].name + " is here!",
	                icon: image
	        });
	        marker1.setMap(map);
	        
	        var infowindow = new google.maps.InfoWindow();
	        
	        google.maps.event.addListener(marker1, 'click', function() {
	                infowindow.setContent(marker1.title);
	                infowindow.open(map,marker1);
	        });
	        
//calculate Carmen's distance to you
	        var carmenDist = distcalc(mylat, mylng, input[i].loc.latitude, input[i].loc.longitude);
	        marker1.title += "<br/>" + "Carmen's distance to you is: " + carmenDist + " miles.";
	        
	    } else if (input[i].name == "Waldo") { //for Waldo
	        var image = 'waldo.png';
	        var marker2 = new google.maps.Marker({
	                position: pos,
	                title: input[i].name + " is here!",
	                icon: image
	        });
	        marker2.setMap(map);
	        
	        var infowindow = new google.maps.InfoWindow();
	        
	        google.maps.event.addListener(marker2, 'click', function() {
	                infowindow.setContent(marker2.title);
	                infowindow.open(map,marker2);
	        });	
	        
//calculate Waldo's distance to you
	        var waldoDist = distcalc(mylat, mylng, input[i].loc.latitude, input[i].loc.longitude);
	        marker2.title += "<br/>" + "Waldo's distance to you is: "  + waldoDist + " miles.";
	        
	    }
	}
}

//function to calculate distance between to coordinates, return number in miles fixed to 2 decimal point
function distcalc(lat1, lng1, lat2, lng2) {
	//from www.movable-type.co.uk/scripts/latlong.html
	var R = 6371; 
	var dLat = (lat2-lat1) * Math.PI / 180;
	var dLng = (lng2-lng1) * Math.PI / 180;
	var lat1 = lat1 * Math.PI / 180;
	var lat2 = lat2 * Math.PI / 180;
	
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = (R * c)*0.6214; //in miles
	return d.toFixed(2);
}

//function to find the closest subway station
function shortestdist(lat, lng, stations) {
	var closestStation = [];
	var shortest = 9999;
	var shortestid;
	for (i=0; i <stations.length; i++) {
		var testdist = distcalc(lat, lng, stations[i].position.hb, stations[i].position.ib)
		if (testdist <= shortest) {
			shortest = testdist;
			shortestid = stations[i].title;
		}		
	}
//array container to return the distance and the title
	closestStation[0]= {'title': shortestid, 'distance': shortest};
	return closestStation;
}

function initialize()
{
    //intial map location Faneuil Hall
    var landmark = new google.maps.LatLng(42.3599611, -71.0567528);
    
    myOptions = {
		zoom: 10, 
		center: landmark,
	mapTypeId: google.maps.MapTypeId.ROADMAP};
	
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	
//create station data points with coordinates, title, image and ID and put into array containers, separate containers
//for the separate branches	
	var timage = 'timage.png';
	st = new google.maps.LatLng(42.395428,-71.142483);
	tMarkers.push(new google.maps.Marker({position: st, title: "Alewife Station", icon: timage, stationID: "RALE"}));
	stations.push(st);
	st = new google.maps.LatLng(42.39674,-71.121815);
	tMarkers.push(new google.maps.Marker({position: st, title: "Davis Station", icon: timage, stationID: "RDAV"}));
	stations.push(st);
	st = new google.maps.LatLng(42.3884,-71.119149);
	tMarkers.push(new google.maps.Marker({position: st, title: "Porter Square Station", icon: timage, stationID: "RPOR"}));
	stations.push(st);
	st = new google.maps.LatLng(42.373362,-71.118956);
	tMarkers.push(new google.maps.Marker({position: st, title: "Harvard Square Station", icon: timage, stationID: "RHAR"}));
	stations.push(st);
	st = new google.maps.LatLng(42.365486,-71.103802);
	tMarkers.push(new google.maps.Marker({position: st, title: "Central Square Station", icon: timage, stationID: "RCEN"}));
	stations.push(st);
	st = new google.maps.LatLng(42.36249079,-71.08617653);
	tMarkers.push(new google.maps.Marker({position: st, title: "Kendall/MIT Station", icon: timage, stationID: "RKEN"}));
	stations.push(st);
	st = new google.maps.LatLng(42.361166,-71.070628);
	tMarkers.push(new google.maps.Marker({position: st, title: "Charles/MGH Station", icon: timage, stationID: "RMGH"}));
	stations.push(st);
	st = new google.maps.LatLng(42.35639457,-71.0624242);
	tMarkers.push(new google.maps.Marker({position: st, title: "Park St. Station", icon: timage, stationID: "RPRK"}));
	stations.push(st);
	st = new google.maps.LatLng(42.355518,-71.060225);
	tMarkers.push(new google.maps.Marker({position: st, title: "Downtown Crossing Station", icon: timage, stationID: "RDTC"}));
	stations.push(st);
	st = new google.maps.LatLng(42.352271,-71.055242);
	tMarkers.push(new google.maps.Marker({position: st, title: "South Station", icon: timage, stationID: "RSOU"}));
	stations.push(st);
	st = new google.maps.LatLng(42.342622,-71.056967);
	tMarkers.push(new google.maps.Marker({position: st, title: "Broadway Station", icon: timage, stationID: "RBRO"}));
	stations.push(st);
	st = new google.maps.LatLng(42.330154,-71.057655);
	tMarkers.push(new google.maps.Marker({position: st, title: "Andrew Station", icon: timage, stationID: "RAND"}));
	stations.push(st);
	st = new google.maps.LatLng(42.320685,-71.052391);
	tMarkers.push(new google.maps.Marker({position: st, title: "JFK/UMass Station", icon: timage, stationID: "RJFK"}));
	stations.push(st);
	ashmontBranch.push(st);
	braintreeBranch.push(st);
	st = new google.maps.LatLng(42.31129,-71.053331);
	tMarkers.push(new google.maps.Marker({position: st, title: "Savin Hill Station", icon: timage, stationID: "RSAV"}));
	ashmontBranch.push(st);
	st = new google.maps.LatLng(42.300093,-71.061667);
	tMarkers.push(new google.maps.Marker({position: st, title: "Fields Corner Station", icon: timage, stationID: "RFIE"}));
	ashmontBranch.push(st);
	st = new google.maps.LatLng(42.29312583,-71.06573796);
	tMarkers.push(new google.maps.Marker({position: st, title: "Shawmut Station", icon: timage, stationID: "RSHA"}));
	ashmontBranch.push(st);
	st = new google.maps.LatLng(42.284652,-71.064489);
	tMarkers.push(new google.maps.Marker({position: st, title: "Ashmont Station", icon: timage, stationID: "RASH"}));
	ashmontBranch.push(st);
	st = new google.maps.LatLng(42.275275,-71.029583);
	tMarkers.push(new google.maps.Marker({position: st, title: "North Quincy Station", icon: timage, stationID: "RNQU"}));
	braintreeBranch.push(st);
	st = new google.maps.LatLng(42.2665139,-71.0203369);
	tMarkers.push(new google.maps.Marker({position: st, title: "Wollaston Station", icon: timage, stationID: "RWOL"}));
	braintreeBranch.push(st);
	st = new google.maps.LatLng(42.251809,-71.005409);
	tMarkers.push(new google.maps.Marker({position: st, title: "Quincy Center Station", icon: timage, stationID: "RQUC"}));
	braintreeBranch.push(st);
	st = new google.maps.LatLng(42.233391,-71.007153);
	tMarkers.push(new google.maps.Marker({position: st, title: "Quincy Adams Station", icon: timage, stationID: "RQUA"}));
	braintreeBranch.push(st);
	st = new google.maps.LatLng(42.2078543,-71.0011385);
	tMarkers.push(new google.maps.Marker({position: st, title: "Braintree Station", icon: timage, stationID: "RBRA"}));
	braintreeBranch.push(st);

//attach markers to map	
	for (var m in tMarkers) {
	    tMarkers[m].setMap(map);
	}
	

//red line for stations
	redLine = new google.maps.Polyline({
	        path: stations,
	        strokeColor: "#FF0000",
	        strokeOpacity: 1.0,
	        strokeWeight: 10
	});
	redLine.setMap(map);	
	
//red line for Ashmont branch
	redLineAshmont = new google.maps.Polyline({
	        path: ashmontBranch,
	        strokeColor: "#FF0000",
	        strokeOpacity: 1.0,
	        strokeWeight: 10
	});
	redLineAshmont.setMap(map);
	
//red line for Braintree branch
	redLineBraintree = new google.maps.Polyline({
	        path: braintreeBranch,
	        strokeColor: "#FF0000",
	        strokeOpacity: 1.0,
	        strokeWeight: 10
	});
	redLineBraintree.setMap(map);

//add info windows to markers	
	var infowindow = [];	
	for (var t in tMarkers) {(function(t) {
        	google.maps.event.addListener(tMarkers[t], 'click', function() {
        	        infowindow[t] = new google.maps.InfoWindow({content: tMarkers[t].title});
        	        infowindow[t].open(map,tMarkers[t]);
        	});
		})(t);
	}
	
	getMyLocation();
}


