window.onload=function(){
    document.getElementById("search").onclick = f_request;
    updatehistory();
}

function updatehistory(){
    var historicaldata = JSON.parse(localStorage.getItem("entrylist") || "[]"); //checking historicaldata.
    if (historicaldata == "[]"){
        return;
    }
    var count = Object.keys(historicaldata).length; //length of history

    var tbl = document.getElementById("myTable");
    var div = document.getElementById("history");

    tbl.style.display = "table"; //display the hidden table

    for(var i = 0; i < count; i++){ //loop through the list of data
        var row = tbl.insertRow(1); //add a new row
        var placecell = row.insertCell(0);
        var longitudecell = row.insertCell(1);
        var latitudecell = row.insertCell(2);
        placecell.innerHTML = historicaldata[i][0];
        longitudecell.innerHTML = historicaldata[i][1];
        latitudecell.innerHTML = historicaldata[i][2];

        var paragraphtext = document.createTextNode(historicaldata[i][3] + " - " + historicaldata[i][4]);
        var paragraph = document.createElement('p');
        paragraph.appendChild(paragraphtext);
        paragraph.style.padding = "10px";
        paragraph.style.fontSize = "16px";

        div.insertBefore(paragraph, div.children[1]);
        var height= div.offsetHeight; //setting the div to resize after every new location
        var newHeight = height + 50;
        div.style.height = newHeight + 'px';
    }

    //GOOGLE MAPS
    var map = new google.maps.Map(
        document.getElementById('map'), {
            zoom: 12,
            center: new google.maps.LatLng(historicaldata[0][2], historicaldata[0][1]),});

    var marker;
    for(i = 0; i < count; i++){ //looping to add all markers on map
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(historicaldata[i][2], historicaldata[i][1]),
            map: map
        });
        marker.setMap(map);
    }
    map.setCenter(new google.maps.LatLng(historicaldata[count-1][2], historicaldata[count-1][1])); //center the newest location

}

function f_request() {

    var sel = document.getElementById("selection");
    var country_name= sel.options[sel.selectedIndex].value; //getting the value for country
    var input_zip= document.getElementById("zip_code").value;// getting the value for zip code
    var address = "http://api.zippopotam.us/"+ country_name + "/" + input_zip;
    var client = new XMLHttpRequest();

    client.open("GET", address, true);
    client.onreadystatechange = function() {
        if (client.readyState == 4 && client.status == 200) {
            var data = JSON.parse(client.responseText);


            var entrylist = []; //creating a list to push the desired value
            var place_name = data.places[0]["place name"];
            var longitude = data.places[0]["longitude"];
            var latitude = data.places[0]["latitude"];
            var country = data.country;
            var zipcode = data["post code"];

            entrylist.push(place_name);
            entrylist.push(longitude);
            entrylist.push(latitude);
            entrylist.push(country);
            entrylist.push(zipcode);

            var historicaldata = JSON.parse(localStorage.getItem("entrylist") || "[]");
            var oldCount = Object.keys(historicaldata).length;
            localStorage.setItem('entrylist', JSON.stringify(entrylist));

            if (oldCount > 9){ //counting searches and replacing the last one

                for(var i = 0; i<oldCount-1; i++){ //making space for new search
                    historicaldata[i] = historicaldata[i+1];
                }
                historicaldata[9] = entrylist;
                localStorage.setItem('entrylist', JSON.stringify(historicaldata)); //saving the list to local storage
                count = Object.keys(historicaldata).length;
            }
            else{
                historicaldata.push(entrylist); //pushing the search history to the entrylist
                localStorage.setItem('entrylist', JSON.stringify(historicaldata));
                count = Object.keys(historicaldata).length;
            }

            document.getElementById("myTable").style.display = "table"; //displaying the hidden table

            var tbl = document.getElementById("myTable");
            var div = document.getElementById("history");

            if (oldCount == 10){

                for (i = oldCount-1; i>0; i--){ //shifting positions on all other rows
                    tbl.rows[i+1].cells[0].innerHTML = tbl.rows[i].cells[0].innerHTML;
                    tbl.rows[i+1].cells[1].innerHTML = tbl.rows[i].cells[1].innerHTML;
                    tbl.rows[i+1].cells[2].innerHTML = tbl.rows[i].cells[2].innerHTML;
                }

                tbl.rows[1].cells[0].innerHTML = place_name; //replacing first row data
                tbl.rows[1].cells[1].innerHTML = longitude;
                tbl.rows[1].cells[2].innerHTML = latitude;

                //add paragraph
                var paragraphtext = document.createTextNode(country + " - " + zipcode);
                var paragraph = document.createElement('p');
                paragraph.appendChild(paragraphtext)
                div.insertBefore(paragraph, div.children[1]);
                paragraph.style.padding = "10px";
                paragraph.style.fontSize = "16px";

                //removing the last line of history:
                $('#history').children().last().remove();
            }
            else{
                var row = tbl.insertRow(1); //adding a new row
                var placecell = row.insertCell(0);
                var longitudecell = row.insertCell(1);
                var latitudecell = row.insertCell(2);
                placecell.innerHTML = place_name;
                longitudecell.innerHTML = longitude;
                latitudecell.innerHTML = latitude;

                var paragraphtext = document.createTextNode(country + " - " + zipcode);
                var paragraph = document.createElement('p');
                paragraph.appendChild(paragraphtext);
                paragraph.style.padding = "10px";
                paragraph.style.fontSize = "16px";

                div.insertBefore(paragraph, div.children[1]);
                var height= div.offsetHeight;
                var newHeight = height + 50;
                div.style.height = newHeight + 'px';
            }

            //GOOGLE MAPS
            var map = new google.maps.Map(
                document.getElementById('map'), {
                    zoom: 9,
                    center: new google.maps.LatLng(latitude, longitude),});

            var marker;
            for(i = 0; i < count; i++){ //looping to add all markers on map
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(historicaldata[i][2], historicaldata[i][1]),
                    map: map
                });
                marker.setMap(map);
            }
            map.setCenter(new google.maps.LatLng(latitude, longitude)); //center the newest location
        };

    };
        client.send();
}

