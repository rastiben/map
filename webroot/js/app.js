var app = angular.module("mapAngular",["ngResource"])

.factory("mapFactory",['$resource','$filter',function($resource,$filter){

    var filteredPortefeuille = [];
    var filteredConstruction = [];
    var portefeuille = [];
    var construction = [];
    var layerPortefeuille = [];
    var layerConstruction = [];
    var displayed = true;

    return {
        resource : $resource("Markers", {id:'@_id'}),
        getMarkers : function(){
            return this.displayed ? this.construction : this.portefeuille;
        },
        setMarkers : function(markers){
            this.portefeuille = $filter('filter')(markers, {dispo: !this.displayed});
            this.filteredPortefeuille = this.portefeuille;
            this.construction = $filter('filter')(markers, {dispo: this.displayed});
            this.filteredConstruction = this.construction;
        },
        getFilteredMarkers : function(){
            return this.displayed ? this.filteredConstruction : this.filteredPortefeuille;
        },
        setFilteredMarkers : function(filteredMarkers){
            if(displayed)
                this.filteredConstruction = filteredMarkers;
            else
                this.filteredPortefeuille = filteredMarkers;
        },
        setDisplayed : function(displayed){
            this.displayed = displayed;
            //this.filteredMarkers = $filter('filter')(this.markers, {dispo: this.displayed});
        }
    }

}])

.controller("mapController",["$scope","$timeout","mapFactory","$filter","$rootScope","$timeout",function($scope,$timeout,mapFactory,$filter,$rootScope,$timeout){

    $scope.showInfoForm = false;
    $scope.showFilterForm = false;
    $scope.marker = undefined;
    $scope.nbFilterResults = 0;
    $scope.loading = true;

    $scope.switchInfoForm = function(){
        $scope.showInfoForm = !$scope.showInfoForm;

        if($scope.marker != undefined && $scope.marker.id == undefined)
            $scope.removeLayer();

        $scope.marker = undefined;
    }

    $scope.switchFilterForm = function(){
        $scope.filteredMarkers =  mapFactory.getFilteredMarkers();
        $scope.nbFilterResults = $scope.filteredMarkers.length;

        $scope.showFilterForm = !$scope.showFilterForm;
    }

    $scope.changeMarker = function(marker,infos){
        $scope.markerItem = marker;
        $scope.marker = infos;
    }

    $scope.addMarker = function(){
        var newMarker = new mapFactory.resource();
        angular.forEach($scope.marker,function(value,key){
            newMarker[key] = value;
        });
        newMarker.$save();

        $scope.switchInfoForm();
    }

    $scope.onConstructeurChange = function(){
        var html = '<div class="divIcon"><img class="icon" style="width:16px;height:21px;" src="./assets/{0}.png"/>'+
                        '<div class="avancement">'+ $scope.marker.avancement +'</div></div>';

        switch($scope.marker.marque){
            case "Maison d'aujourd'hui":
                html = html.format("blue");
                break;
            case "Demeures & Cottages":
                html = html.format("purple");
                break;
            case "Maison sweet":
                html = html.format("orange");
                break;
        }

        $scope.markerItem._icon.innerHTML = html;
    }

    $scope.onAvancementChange = function(){
        $scope.markerItem._icon.getElementsByClassName('avancement')[0].innerHTML = $scope.marker.avancement;
    }

    $scope.setMap = function(map){
        $scope.map = map;
    }

    $scope.removeLayer = function(){
        $scope.map.removeLayer($scope.markerItem);
    }

    $scope.mettreAJour = function(){
        $scope.filteredMarkers = mapFactory.getMarkers();

        angular.forEach($scope.filters,function(value,key){
            if(value != undefined && value != "")
                $scope.filteredMarkers = $filter('filter')($scope.filteredMarkers, {[key]: value});
        });

        $scope.nbFilterResults = $scope.filteredMarkers.length;
    }

    $scope.validFilters = function(){
        var temp = mapFactory.displayed ? mapFactory.layerConstruction['_layers'] : mapFactory.layerPortefeuille['_layers'];

        //lat lng
        angular.forEach(temp,function(value,key){
            if($filter('filter')($scope.filteredMarkers, {lat: value._latlng.lat,lng: value._latlng.lng}).length == 0)
                $(value._icon).find('.divIcon').css('display','none');
            else
                $(value._icon).find('.divIcon').css('display','block');
        });
        //mapFactory.setFilteredMarkers($scope.filteredMarkers);
    }

    $scope.$watch(function(){
        return mapFactory.filteredMarkers;
    }, function(){
        $timeout(function(){$scope.loading = false},2000);
    });

}])

.directive("datepicker",function(){
   return{
       require: 'ngModel',
       link(scope,element,attrs,ngModel){
            $(element).datepicker({
                format: "MM yyyy",
                language: "fr",
                autoclose: true
            })
            .on("changeDate", function(e) {
                scope.$apply(function() {
                    ngModel.$setViewValue(moment(e.date).format("YYYY-MM-DD"));
                });
            });
       }
   };
})

.directive("leaflet",["$http","mapFactory","$timeout","$rootScope",function($http,mapFactory,$timeout,$rootScope){
   return {
        restrict: 'EA',
        template: '<div id="map">',
        scope : {
            switchInfoForm: '&',
            showInfoForm: '=',
            changeMarker: '&',
            setMap: '&',
            switchFilterForm: '&'
        },
        transclude: true,
        controller: function ($scope) {

            //$scope.markers = [];
            $scope.layerPortefeuille = undefined;
            $scope.layerConstruction = undefined;

            mapFactory.setDisplayed(true);

            mapFactory.resource.query(function(markers){

                var tempPortefeuille = [];
                var tempConstruction = [];

                mapFactory.setMarkers(markers);

                angular.forEach(markers,function(marker,key){

                    var iconTemp = new L.DivIcon({
                        className: 'blueIcon',
                        iconSize:['16','21'],
                        html: '<div class="divIcon"><img class="icon" style="width:16px;height:21px;" src="./assets/{0}.png"/>'+
                        '<div class="avancement">'+(marker.avancement != undefined ? marker.avancement : '')+'</div></div>'
                    });

                    switch(marker.marque){
                        case "Maison d'aujourd'hui":
                            iconTemp.options.html = iconTemp.options.html.format("blue");
                            break;
                        case "Demeures & Cottages":
                            iconTemp.options.html = iconTemp.options.html.format("purple");
                            break;
                        case "Maison sweet":
                            iconTemp.options.html = iconTemp.options.html.format("orange");
                            break;
                    }

                    marker.icon = iconTemp;

                    if(marker.dispo){
                        tempConstruction.push($scope.addMarker(marker.lat,marker.lng,iconTemp));
                    } else {
                        tempPortefeuille.push($scope.addMarker(marker.lat,marker.lng,iconTemp));
                    }
                    //$scope.markers.push(marker);
                });

                $scope.layerConstruction = new L.FeatureGroup(tempConstruction).addTo($scope.map);
                $scope.layerPortefeuille = new L.FeatureGroup(tempPortefeuille);

                mapFactory.layerConstruction = $scope.layerConstruction;
                mapFactory.layerPortefeuille = $scope.layerPortefeuille;

            });

            $scope.addMarker = function(lat,lng,icon){
                return L.marker([lat, lng], {icon: icon}).on('click', $scope.onClick);
            }

            $scope.onClick = function(e) {
                var temp = mapFactory.displayed ? mapFactory.construction : mapFactory.portefeuille;
                var tempL = mapFactory.displayed ? mapFactory.layerConstruction : mapFactory.layerPortefeuille;

                var arr = $.grep(temp, function(value,key) {
                  return value.lat == e.latlng.lat && value.lng == e.latlng.lng;
                });
                var index = temp.indexOf(arr[0]);

                if(!$scope.showInfoForm)
                    $timeout($scope.switchInfoForm());

                var markerToReturn = tempL._layers[Object.keys(tempL._layers)[index]];
                $timeout($scope.changeMarker({marker:markerToReturn,infos:arr[0]}));
            }

            $scope.showCoordinates = function(e) {
                if(!$scope.showInfoForm)
                    $timeout($scope.switchInfoForm());

                var marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo($scope.map)
                .bindPopup('Remplissez le formulaire')
                .openPopup();

                $timeout($scope.changeMarker({marker:marker,infos:{
                    lat: e.latlng.lat,
                    lng: e.latlng.lng
                }}));
            }

            $scope.filtre = function(){
                if(mapFactory.displayed != undefined){
                    if(mapFactory.displayed){
                        $scope.map.removeLayer(mapFactory.layerPortefeuille);
                        mapFactory.layerConstruction.addTo($scope.map);
                    } else {
                        $scope.map.removeLayer(mapFactory.layerConstruction);
                        mapFactory.layerPortefeuille.addTo($scope.map);
                    }
                }
            };

            $scope.showFilterForm = function(){
               $timeout($scope.switchFilterForm());
            }

        },
        link(scope,element,attrs){

            /*INITIALISATION DE LA MAP*/
            scope.map = L.map('map', {
                contextmenu: true,
                contextmenuWidth: 180,
                contextmenuItems: [{
                    text: 'Ajouter un marker',
                    callback: scope.showCoordinates
                }]
            }).setView(new L.LatLng(46.5833, 0.3333), 9);

            /*INITIALISATION DES BOUTONS*/
            scope.toggle = L.easyButton({
              states: [{
                stateName: 'construction',
                title: 'En cours de construction',
                icon: 'glyphicon glyphicon-wrench',
                onClick: function(control) {
                    mapFactory.setDisplayed(false);
                    scope.filtre();
                    control.state('portefeuille');
                }
              }, {
                stateName: 'portefeuille',
                title: 'Portefeuille client',
                icon: 'glyphicon glyphicon-home',
                onClick: function(control) {
                    mapFactory.setDisplayed(true);
                    scope.filtre();
                    control.state('construction');
                }
              }]
            });

            scope.filter = L.easyButton({
              states: [{
                stateName: 'filter',
                title: 'Appliqué des filtres',
                icon: 'glyphicon glyphicon-filter',
                onClick: function(control) {
                    scope.showFilterForm();
                }
              }]
            });

            scope.toggle.addTo(scope.map);
            scope.filter.addTo(scope.map);

            //Ajout du layout
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(scope.map);

            //Ajout de la recherche
            L.Control.geocoder({
                placeholder: "Rechercher..."
                ,errorMessage: "Aucun résultat"
                ,defaultMarkGeocode: false
            }).on('markgeocode', function(e) {
                var bbox = e.geocode.bbox;
                scope.map.fitBounds([
                    [bbox.getSouthEast(),bbox.getNorthEast()],
                    [bbox.getNorthWest(),bbox.getSouthWest()]
                ]);
            }).addTo(scope.map);

            $timeout(scope.setMap({map:scope.map}));
        }
    };
}]);
