var mylat;
var mylng;
var markers = [];
var mypos;

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
	}

function initialize()
	{
		//intial map location Faneuil Hall
		var landmark = new google.maps.LatLng(42.3599611, -71.0567528);
		
		myOptions = {
		zoom: 5, // The larger the zoom number, the bigger the zoom
		center: landmark,
		mapTypeId: google.maps.MapTypeId.ROADMAP};

			
		map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
		getMyLocation();
	}
