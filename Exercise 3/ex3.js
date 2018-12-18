var marker_list = [];
var routePath;
var storedName;
var pathBounds;

window.onload = function(){
        document.getElementById("show_buses").onclick = showBuses; //shows buses of selected line on clicking "Show buses" button
        document.getElementById("show_route").onclick = showRoutes; //shows routes of selected line on clicking "Show route" button
        document.getElementById("refresh").onclick = refresh; //Refreshes the position of buses on clicking "Refresh" button
        getRequest("https://data.foli.fi/gtfs/", getLatestDataSet); //get latest bus data
}


function getRequest(url, callback){
    var client = new XMLHttpRequest();
    client.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            var fetchData = JSON.parse(client.responseText);
            callback(fetchData);
        }
    }
    client.open("GET", url, true);
    client.send();
}
function getLatestDataSet(data){
   getRequest("https://data.foli.fi/gtfs/v0/20181207-145720/routes", fetchRouteList); //Fetching the routes
}



function deleteMarkers(){
    setMapOnAll(null);
    marker_list = [];
}

function setMapOnAll(map) {
    for (let i = 0; i < marker_list.length; i++) {
        marker_list[i].setMap(map);
    }
}

//function created for "Show buses" buttons
function showBuses(){
    getRequest("https://data.foli.fi/siri/vm", showLocations);
}

//function created for "Refresh" buttons
function refresh(){
    getRequest("https://data.foli.fi/siri/vm", showLocations);
}

//function created for "Show route" buttons
function showRoutes(){
    var routeList = document.getElementById("bus_list");
    if(routeList.options[routeList.selectedIndex].text == "Select line"){
        alert("You have not selected any route.");
        return;
    }
    if(routeList.options[routeList.selectedIndex].text != storedName){
        deleteMarkers(); //...we remove the markers
    }

    storedName = routeList.options[routeList.selectedIndex].text;
    var routeId = routeList.options[routeList.selectedIndex].value;
    getTrips(routeId);
}

//function to fetch the route list to dropdown menu
function fetchRouteList(routeList){
    var routeChoices = [];
    for(let i=0; i<routeList.length; i++){
        var routeIdAndName = [routeList[i].route_id, routeList[i].route_short_name]; //route_short_name is the actual bus number.
        routeChoices.push(routeIdAndName);
    }

//Adding the routes to the dropdown menu
    for(let i=0; i<routeChoices.length; i++){
        var routeId = routeChoices[i][0];
        var routeName = routeChoices[i][1];
        $("#bus_list").append($("<option></option>").attr("value", routeId).text(routeName));
    }
}

//function to show the location of a bus using marker on the map
function showLocations(data){
    var routeList = document.getElementById("bus_list");

    deleteMarkers(); //deleting old markers
    //Checking for the old paths and deleting it if exists
    if (routePath != undefined && routeList.options[routeList.selectedIndex].text != storedName){
        routePath.setMap(null);
        pathBounds = "";
    }

    var routeList = document.getElementById("bus_list");
    var routeName = routeList.options[routeList.selectedIndex].text;

    storedName = routeName;

    busList = data.result.vehicles;

    var empty = true;

    //checking for bus location and adding markers if found
    for (var bus in busList){
        if (routeName == busList[bus].publishedlinename){

            var latitude = busList[bus].latitude;
            var longitude = busList[bus].longitude;
            var location = {lat: latitude, lng: longitude};
            addMarker(location);
            empty = false;
        }
    }
    if (empty){
        alert("No buses found");
    }
}

//function to acquire route for route id
function getTrips(routeId){
    getRequest("https://data.foli.fi/gtfs/v0/20181207-145720/trips/route/" + routeId, getShape);
}

//function to get request for accessing shape id
function getShape(trips){
    getRequest("https://data.foli.fi/gtfs/v0/20181207-145720/shapes/" + trips[1].shape_id, drawRoute);
}

//function to create route with the help of fetched coordinates
function drawRoute(coordinates){
    var locations = [];
    var bounds = new google.maps.LatLngBounds();

    //checking for old path and deleting it if exists
    if (routePath != undefined){
        routePath.setMap(null);
    }

    //pushing coordinates to locations list
    for (i=0; i<coordinates.length; i++){
        locations.push({lat: coordinates[i].lat,
            lng: coordinates[i].lon});
        var latlng = new google.maps.LatLng(coordinates[i].lat,coordinates[i].lon);
        bounds.extend(latlng);
    }

    routePath = new google.maps.Polyline({ //create a polyline
        path: locations,
        strokeColor: '#FE7569',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    routePath.setMap(map);
}


//function to initialize the google map, centering at Turku
function showMap(){
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: 60.4518, lng: 22.2666}//Turku as center
    });
}

//function to add markers to the map
function addMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    marker_list.push(marker);
    var bounds = new google.maps.LatLngBounds();
    for (i = 0; i < marker_list.length; i++) {
        bounds.extend(marker_list[i].getPosition());
    }
}