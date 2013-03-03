var mylat;
var mylng;
var stations = [];
var ashmontbranch = [];
var braintreebranch = [];
var tmarkers = [];
var mypos;
var Trequest = new XMLHttpRequest();
var CWrequest = new XMLHttpRequest();
var carmen;
var waldo;

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
	Tparse();
	CWparse();
	
   }

function Tparse() {
	Trequest.open("GET", "http://mbtamap-cedar.herokuapp.com/mapper/redline.json", true);
	Trequest.send(null);
	Trequest.onreadystatechange = Tcallback;
	}

function Tcallback() {
        try {
                if (Trequest.readyState == 4 && Trequest.status == 200) {
                        input = JSON.parse(Trequest.responseText);
                }
                else {
                        if((Trequest.readyState == 4 && Trequest.status == 0)|| (Trequest.status == 324)) {
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
function CWparse() {
        CWrequest.open("GET", "http://messagehub.herokuapp.com/a3.json", true);
        CWrequest.send(null);
        CWrequest.onreadystatechange = CWcallback;
}

function CWcallback() {
        try {
                if (CWrequest.readyState == 4 && CWrequest.status == 200) {
                        input = JSON.parse(CWrequest.responseText);
                renderCW();
        }
                else {
                        if(CWrequest.readyState == 4 && CWrequest.status == 0) {
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

function renderCW() {
	for (i=0; input.length; i++) {

	pos = new google.maps.LatLng(input[i].loc.latitude, input[i].loc.longitude);
console.log("hellofromrenderCW");                
	if (input[i].name == "Carmen Sandiego") {

	var image = 'carmen.png'; 

	var marker1 = new google.maps.Marker({
                position: pos,
                title: input[i].name,
                icon: image
                });
        marker1.setMap(map);

        var infowindow = new google.maps.InfoWindow();

        google.maps.event.addListener(marker1, 'click', function() {
                infowindow.setContent(marker1.title);
                infowindow.open(map,marker1);
                });
	var carmenDist = distcalc(mylat, mylng, input[i].loc.latitude, input[i].loc.longitude);
	console.log(carmenDist);
	} else if (input[i].name == "Waldo") {
	var image = 'waldo.png';
console.log("inwaldoDist1");        
	var marker2 = new google.maps.Marker({
		position: pos,
                title: input[i].name,
                icon: image
                });
        marker2.setMap(map);

        var infowindow = new google.maps.InfoWindow();

        google.maps.event.addListener(marker2, 'click', function() {
                infowindow.setContent(marker2.title);
                infowindow.open(map,marker2);
                });	
	var waldoDist = distcalc(mylat, mylng, input[i].loc.latitude, input[i].loc.longitude);
        console.log(waldoDist);
	console.log("inwaldoDist");
	}
	}
}

function distcalc(lat1, lng1, lat2, lng2) {
console.log("inwaldoDist3");
	//from www.movable-type.co.uk/scripts/latlong.html
	var R = 6371; 
	var dLat = (lat2-lat1).toRad();
	var dLon = (lon2-lon1).toRad();
	var lat1 = lat1.toRad();
	var lat2 = lat2.toRad();

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        	Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
console.log("inwaldoDist4");
console.log(d);
	return d;
}

function shortestdist(lat, lng, stations) {
	var shortest = 9999;
	var shortestid;
	for (i=0; i <stations.length; i++) {
		var testdist = distcalc(lat, lng, stations[i].loc.latitude, stations[i].loc.longitude)
		if (testdist <= shortest) {
			shortest = testdist;
			shortestid = stations[i].PlatformKey;
	}		
	}
	return shortest;
	}

function initialize()
	{
		//intial map location Faneuil Hall
		var landmark = new google.maps.LatLng(42.3599611, -71.0567528);
		
		myOptions = {
		zoom: 10, // The larger the zoom number, the bigger the zoom
		center: landmark,
		mapTypeId: google.maps.MapTypeId.ROADMAP};
			
		map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

		var timage = 'timage.png';

		st = new google.maps.LatLng(42.395428,-71.142483);
		tmarkers.push(new google.maps.Marker({position: st, title: "Alewife Station", icon: timage}));
		stations.push(st);
                st = new google.maps.LatLng(42.39674,-71.121815);
                tmarkers.push(new google.maps.Marker({position: st, title: "Davis Station", icon: timage}));
                stations.push(st);
                st = new google.maps.LatLng(42.3884,-71.119149);
                tmarkers.push(new google.maps.Marker({position: st, title: "Porter Square Station", icon: timage}));
                stations.push(st);
                st = new google.maps.LatLng(42.373362,-71.118956);
                tmarkers.push(new google.maps.Marker({position: st, title: "Harvard Square Station", icon: timage}));
                stations.push(st);
                st = new google.maps.LatLng(42.365486,-71.103802);
                tmarkers.push(new google.maps.Marker({position: st, title: "Central Square Station", icon: timage}));
                stations.push(st);
                st = new google.maps.LatLng(42.36249079,-71.08617653);
                tmarkers.push(new google.maps.Marker({position: st, title: "Kendall/MIT Station", icon: timage}));
                stations.push(st);
                st = new google.maps.LatLng(42.361166,-71.070628);
                tmarkers.push(new google.maps.Marker({position: st, title: "Charles/MGH Station", icon: timage}));
                stations.push(st);
                st = new google.maps.LatLng(42.35639457,-71.0624242);
                tmarkers.push(new google.maps.Marker({position: st, title: "Park St. Station", icon: timage}));
                stations.push(st);
                st = new google.maps.LatLng(42.355518,-71.060225);
                tmarkers.push(new google.maps.Marker({position: st, title: "Downtown Crossing Station", icon: timage}));
                stations.push(st);
                st = new google.maps.LatLng(42.352271,-71.055242);
                tmarkers.push(new google.maps.Marker({position: st, title: "South Station", icon: timage}));
                stations.push(st);
                st = new google.maps.LatLng(42.342622,-71.056967);
                tmarkers.push(new google.maps.Marker({position: st, title: "Broadway Station", icon: timage}));
                stations.push(st);
                st = new google.maps.LatLng(42.330154,-71.057655);
                tmarkers.push(new google.maps.Marker({position: st, title: "Andrew Station", icon: timage}));
                stations.push(st);
                st = new google.maps.LatLng(42.320685,-71.052391);
                tmarkers.push(new google.maps.Marker({position: st, title: "JFK/UMass Station", icon: timage}));
                stations.push(st);
   		ashmontbranch.push(st);
		braintreebranch.push(st);
                st = new google.maps.LatLng(42.31129,-71.053331);
                tmarkers.push(new google.maps.Marker({position: st, title: "Savin Hill Station", icon: timage}));
		ashmontbranch.push(st);
                st = new google.maps.LatLng(42.300093,-71.061667);
                tmarkers.push(new google.maps.Marker({position: st, title: "Fields Corner Station", icon: timage}));
		ashmontbranch.push(st);
                st = new google.maps.LatLng(42.29312583,-71.06573796);
                tmarkers.push(new google.maps.Marker({position: st, title: "Shawmut Station", icon: timage}));
		ashmontbranch.push(st);
                st = new google.maps.LatLng(42.284652,-71.064489);
                tmarkers.push(new google.maps.Marker({position: st, title: "Ashmont Station", icon: timage}));
		ashmontbranch.push(st);
                st = new google.maps.LatLng(42.275275,-71.029583);
                tmarkers.push(new google.maps.Marker({position: st, title: "North Quincy Station", icon: timage}));
		braintreebranch.push(st);
                st = new google.maps.LatLng(42.2665139,-71.0203369);
                tmarkers.push(new google.maps.Marker({position: st, title: "Wollaston Station", icon: timage}));
                braintreebranch.push(st);
                st = new google.maps.LatLng(42.251809,-71.005409);
                tmarkers.push(new google.maps.Marker({position: st, title: "Quincy Center Station", icon: timage}));
                braintreebranch.push(st);
                st = new google.maps.LatLng(42.233391,-71.007153);
                tmarkers.push(new google.maps.Marker({position: st, title: "Quincy Adams Station", icon: timage}));
                braintreebranch.push(st);
                st = new google.maps.LatLng(42.2078543,-71.0011385);
                tmarkers.push(new google.maps.Marker({position: st, title: "Braintree Station", icon: timage}));
                braintreebranch.push(st);

	//	for (var m in tmarkers) {
	//		tmarkers[m].setMap(map);
	//	}
		
		redLine = new google.maps.Polyline({
		path: stations,
		strokeColor: "#FF0000",
		strokeOpacity: 1.0,
		strokeWeight: 10
		});
	//	redLine.setMap(map);	

                redLineAshmont = new google.maps.Polyline({
                path: ashmontbranch,
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 10
                });
         //       redLineAshmont.setMap(map);

                redLineBraintree = new google.maps.Polyline({
                path: braintreebranch,
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 10
                });
       //         redLineBraintree.setMap(map);


		getMyLocation();
	}


