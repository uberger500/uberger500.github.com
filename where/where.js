var mylat;
var mylng;
var stations = [];
var mypos;
var Trequest = new XMLHttpRequest();
var CWrequest = new XMLHttpRequest();

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
                title: "I am here",
                icon: image
                });
        marker.setMap(map);

        var infowindow = new google.maps.InfoWindow();

        google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(marker.title);
                infowindow.open(map,marker);
                });
Tparse();
	
   }

function Tparse() {
	request.open("GET", "http://mbtamap-cedar.herokuapp.com/mapper/redline.json", true);
	request.send(null);
	request.onreadystatechange = Tcallback;
	}

function Tcallback() {
	try {
		if (request.readyState == 4 && request.status == 200) {
           		input = JSON.parse(request.responseText);
         		console.log(input);		}
         		
		else { 
			if(request.readyState == 4 && request.status == 0) {
				throw "noresponse";
				}
			}
		catch(error) {
			if (error == "noresponse") {
				alert("no data returned");
				}
			}
	}
}	
function CWparse() {
	request.open("GET", "http://messagehub.herokuapp.com/a3.json", true);
        request.send(null);
        request.onreadystatechange = CWcallback;
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
	
	


		getMyLocation();
	}


