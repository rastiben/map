<html>
<header>
</header>



<body>

        <link rel="stylesheet" href="./css/leaflet.css">
        <link rel="stylesheet" href="./css/app.css">
        <link rel="stylesheet" href="./css/Control.Geocoder.css" />
        <link rel="stylesheet" href="./css/leaflet.contextmenu.min.css"/>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">



        <div class="col-md-8 col-md-offset-2" id="map"></div>


        <script src="./js/leaflet.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.1/angular.min.js"></script>
        <script src="./js/angular-leaflet-directive.min.js"></script>
        <script src="./js/Control.Geocoder.js"></script>
        <script src="./js/leaflet.contextmenu.min.js"></script>
        <script src="./js/jquery-3.1.1.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>


        <script>

            //Initialisation de la carte.
            var map = L.map('map', {
                contextmenu: true,
                contextmenuWidth: 180,
                contextmenuItems: [{
                    text: 'Ajouter un marker',
                    callback: showCoordinates
                }]
            }).setView(new L.LatLng(46.5833, 0.3333), 9);

            //Ajout du layout
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            //Ajout de la recherche
            L.Control.geocoder({
                placeholder: "Rechercher..."
                ,errorMessage: "Aucun résultat"
            }).addTo(map);


            /*$.ajax({
                url:'https://maps.googleapis.com/maps/api/geocode/json?address=7%20Place%20Aristide%20Briand%2086021&key=AIzaSyB4pINEbEV_CczgRAhMhIza1OAEzSJV6JA'
                ,method:'GET'
                ,success : function(data){
                    var location = data['results'][0]['geometry']['location'];
                    L.marker([location.lat, location.lng]).addTo(map)
                    .bindPopup(data.display_name);
                }
            });*/
            //239 AVENUE DES HAUTS DE LA CHAUME 86280 SAINT-BENOIT
            $.ajax({
                url:'./Client.php'
                ,method:'GET'
                ,success:function(data){
                    data = $.parseJSON(data);
                    $(data).each(function(number,obj){
                        //console.log(obj);
                        //console.log('https://maps.googleapis.com/maps/api/geocode/json?address='+obj.replace(/ /g,'+')+'key=AIzaSyB4pINEbEV_CczgRAhMhIza1OAEzSJV6JA');
                        $.ajax({
                            url:'https://maps.googleapis.com/maps/api/geocode/json?address='+obj.replace(/ /g,'+')+'&key=AIzaSyB4pINEbEV_CczgRAhMhIza1OAEzSJV6JA'
                            ,method:'GET'
                            ,success : function(result){
                                var location = result.results[0].geometry.location;
                                L.marker([location.lat, location.lng]).addTo(map)
                                .bindPopup(data.display_name);
                            }
                        });
                    })
                }
            });

            function showCoordinates (e) {
                //alert(e.latlng);
                displayForm();

                L.marker([e.latlng.lat, e.latlng.lng]).addTo(map)
                .bindPopup('Remplissez le formulaire');

            }


        </script>

</body>
</html>
