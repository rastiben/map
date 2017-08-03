moment.locale('fr');

var app = angular.module("mapAngular",["ngResource"])

.factory("mapFactory",['$resource','$filter',function($resource,$filter){

    var markers = [];
    var layerPortefeuille = [];
    var layerConstruction = [];
    var layerTermine = [];
    var displayed = 1;

    return {
        resource : $resource("Markers", {id:'@_id'}),
        getAllMarkers : function(){
            return this.markers;
        },
        getMarkers : function(){
            return $filter('filter')(this.markers, {dispo: this.displayed});
        },
        addMarker : function(marker,item){
            this.markers.push(marker);
            switch(this.displayed){
                case 0:
                    return this.layerPortefeuille.addLayer(item);
                    break;
                case 1:
                    return this.layerConstruction.addLayer(item);
                    break;
                case 2:
                    return this.layerTermine.addLayer(item);
                    break;
            }
        },
        getLayerMarkers : function(){
            switch(this.displayed){
                case 0:
                    return this.layerPortefeuille;
                    break;
                case 1:
                    return this.layerConstruction;
                    break;
                case 2:
                    return this.layerTermine;
                    break;
            }
        },
        setMarkers : function(markers){
            this.markers = markers;
        },
        setDisplayed : function(displayed){
            this.displayed = displayed;
        }
    }

}])

.controller("mapController",["$scope","$timeout","mapFactory","$filter","$rootScope","$timeout",function($scope,$timeout,mapFactory,$filter,$rootScope,$timeout){

    $scope.showInfoForm = false;
    $scope.showFilterForm = false;
    $scope.marker = undefined;
    $scope.markerOriginal = undefined;
    $scope.nbFilterResults = 0;
    $scope.prixMoyenTTC = 0;
    $scope.prixMoyenHT = 0;
    $scope.loading = true;
    $scope.dispo = 0;

    $scope.switchInfoForm = function(save=false){
        $scope.showInfoForm = !$scope.showInfoForm;

        if(save == false && $scope.marker != undefined && $scope.marker.id == undefined)
            $scope.removeLayer();

        //INIT DISPO IF CANCEL
        if(save == false && $scope.markerOriginal != undefined && $scope.markerOriginal.dispo != $scope.dispo){
            $scope.reinit();
            $scope.markerOriginal.dispo = $scope.markerOriginal.dispo - 1;
            $rootScope.$broadcast('STATE_CHANGED', {state:$scope.markerOriginal.dispo,
                                                    latlng:{
                                                        lat:$scope.markerOriginal.lat,
                                                        lng:$scope.markerOriginal.lng
                                                    }
                                                    });
        }

        //$scope.marker = undefined;
        //$scope.markerOriginal = undefined;
    }

    $scope.switchFilterForm = function(){
        $scope.filteredMarkers =  mapFactory.getMarkers();
        $scope.nbFilterResults = $scope.filteredMarkers.length;
        $scope.calcPrixMoyen($scope.filteredMarkers);

        $scope.showFilterForm = !$scope.showFilterForm;
    }

    $scope.calcPrixMoyen = function(filteredMarkers){
        $scope.prixMoyenTTC = 0;
        $scope.prixMoyenHT = 0;
        //calcule du prix moyen.
        angular.forEach(filteredMarkers,function(value,key){
            $scope.prixMoyenTTC += value.montantttc;
            $scope.prixMoyenHT += value.montantht;
        });

        $scope.prixMoyenTTC /= $scope.nbFilterResults;
        $scope.prixMoyenHT /= $scope.nbFilterResults;
    }


    $scope.changeMarker = function(marker,infos,onlyItem=false){
        $scope.markerItem = marker;
        if(onlyItem == false){
            $scope.marker = JSON.parse(JSON.stringify(infos));
            $scope.dispo = $scope.marker.dispo;
            $scope.marker.signature = moment($scope.marker.signature).format("MMMM YYYY");
            $scope.markerOriginal = infos;
        }
    }

    $scope.reinit = function(){
        angular.forEach($scope.marker,function(value,key){
            $scope.markerOriginal[key] = value;
        });
    }

    $scope.addMarker = function(){
        var newMarker = new mapFactory.resource();

        if(moment($scope.marker.signature,"MMMM YYYY",true).isValid())
            $scope.marker.signature = moment($scope.marker.signature,"MMMM YYYY").format("YYYY-MM-DD");

        angular.forEach($scope.marker,function(value,key){
            newMarker[key] = value;
            $scope.markerOriginal[key] = value;
        });

        var id = $scope.marker.id == undefined ? false : true;
        var icon = $scope.markerItem.options.icon;
        if($scope.marker.id == undefined) $scope.removeLayer();

        newMarker.$save(function(data){
            if(!id){
                data.icon = icon;
                $rootScope.$broadcast('ADD_MARKER', data);
            }
        });

        $scope.switchInfoForm(true);
    }

    $scope.changeState = function(state){
        $scope.marker.dispo = state;
        $scope.markerOriginal.dispo = state;
        $rootScope.$broadcast('STATE_CHANGED', {state:state,
                                                    latlng:{
                                                        lat:$scope.markerOriginal.lat,
                                                        lng:$scope.markerOriginal.lng
                                                    }
                                                });
    }

    $scope.onConstructeurChange = function(){
        var html = '<div class="divIcon"><img class="icon" style="width:16px;height:21px;" src="./assets/{0}.png"/>'+
                        '<div class="avancement">'+ ($scope.marker.avancement != undefined ? $scope.marker.avancement : '') +'</div></div>';

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

        //Calcule du nombre de résultats
        angular.forEach($scope.filters,function(value,key){
            if(value != undefined && value != "")
                $scope.filteredMarkers = $filter('filter')($scope.filteredMarkers, {[key]: value});
        });

        $scope.nbFilterResults = $scope.filteredMarkers.length;

        //calcule du prix moyen.
        $scope.calcPrixMoyen($scope.filteredMarkers);
    }

    $scope.exportData = function() {
        alasql("SELECT signature AS [Date de signature], \
                       agence AS [Agence], \
                       commerciale AS [Commerciale], \
                       marque AS [Marque], \
                       client AS [Client], \
                       lieu AS [Lieu], \
                       montantttc AS [Montant TTC], \
                       montantht AS [Montant HT] INTO XLSX('markers.xlsx',{headers:true}) FROM ? ",[$scope.filteredMarkers]);
    }

    $scope.validFilters = function(){
        $rootScope.$broadcast('APPLY_FILTER', $scope.filteredMarkers);
        /*var temp = undefined;

        switch(mapFactory.displayed){
            case 0:
                temp = mapFactory.layerPortefeuille['_layers'];
                break;
            case 1:
                temp = mapFactory.layerConstruction['_layers'];
                break;
            case 2:
                temp = mapFactory.layerTermine['_layers'];
                break;
        }

        //lat lng
        angular.forEach(temp,function(value,key){
            if($filter('filter')($scope.filteredMarkers, {lat: value._latlng.lat,lng: value._latlng.lng}).length == 0)
                $(value._icon).find('.divIcon').css('display','none');
            else
                $(value._icon).find('.divIcon').css('display','block');
        });*/
        //mapFactory.setFilteredMarkers($scope.filteredMarkers);
    }

    $scope.$watch(function(){
        return mapFactory.markers;
    }, function(){
        $timeout(function(){$scope.loading = false},2000);
    });

    $scope.$watch(function(){
        return mapFactory.displayed;
    }, function(){
        $scope.displayed = mapFactory.displayed;
    });

}])

.directive("datepicker",function(){
   return{
       require: 'ngModel',
       link(scope,element,attrs,ngModel){
            $(element).datepicker({
                format: "MM yyyy",
                language: "fr",
                autoclose: true,
                startView: 1,
                minViewMode: 1,
                maxViewMode: 2
            })
            .on("changeDate", function(e) {
                scope.$apply(function() {
                    ngModel.$setViewValue(moment(e.date).format("YYYY-MM-DD"));
                });
            });
       }
   };
})

.directive("leaflet",["$http","mapFactory","$timeout","$rootScope","$filter",function($http,mapFactory,$timeout,$rootScope,$filter){
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
            $scope.layerTermine = undefined;

            mapFactory.setDisplayed(0);

            mapFactory.resource.query(function(markers){

                $scope.filtre(markers);

            });

            $scope.addMarker = function(lat,lng,icon,click=true){
                switch(click){
                    case true:
                        return L.marker([lat, lng], {icon: icon}).on('click', $scope.onClick);
                        break;
                    case false:
                        return L.marker([lat, lng], {icon: icon});
                        break;
                }
            }

            $scope.onClick = function(e,onlyItem=false) {
                var temp = mapFactory.getMarkers();
                var tempL = mapFactory.getLayerMarkers();

                var arr = $.grep(temp, function(value,key) {
                  return value.lat == e.latlng.lat && value.lng == e.latlng.lng;
                });
                var index = temp.indexOf(arr[0]);

                if(!$scope.showInfoForm)
                    $timeout($scope.switchInfoForm({save:true}));

                var markerToReturn = tempL._layers[Object.keys(tempL._layers)[index]];
                $timeout($scope.changeMarker({marker:markerToReturn,infos:arr[0],onlyItem:onlyItem}));
            }

            $scope.showCoordinates = function(e) {
                if(!$scope.showInfoForm)
                    $timeout($scope.switchInfoForm());

                var iconTemp = new L.DivIcon({
                        className: 'blueIcon',
                        iconSize:['16','21'],
                        html: '<div class="divIcon"><img class="icon" style="width:16px;height:21px;" src="./assets/blue.png"/>'+
                        '<div class="avancement"></div></div>'
                });

                var marker = L.marker([e.latlng.lat, e.latlng.lng], {icon: iconTemp}).addTo($scope.map)
                .bindPopup('Remplissez le formulaire')
                .openPopup();

                $timeout($scope.changeMarker({marker:marker,infos:{
                    lat: e.latlng.lat,
                    lng: e.latlng.lng,
                    dispo: 0,
                    lieu: $scope.city,
                    marque:"Maison d'aujourd'hui"
                },onlyItem:false}));
            }

            /*$scope.filtre = function(){
                if(mapFactory.displayed != undefined){
                    if(mapFactory.displayed == 1){
                        $scope.map.removeLayer(mapFactory.layerPortefeuille);
                        mapFactory.layerConstruction.addTo($scope.map);
                    } else {
                        $scope.map.removeLayer(mapFactory.layerConstruction);
                        mapFactory.layerPortefeuille.addTo($scope.map);
                    }
                }
            };*/

            $scope.showFilterForm = function(){
               $timeout($scope.switchFilterForm());
            }

            $scope.filtre = function(markers,donotsetmarkers=false){

                if(mapFactory.layerPortefeuille != undefined) $scope.map.removeLayer(mapFactory.layerPortefeuille);
                if(mapFactory.layerConstruction != undefined) $scope.map.removeLayer(mapFactory.layerConstruction);
                if(mapFactory.layerTermine != undefined) $scope.map.removeLayer(mapFactory.layerTermine);

                var tempPortefeuille = [];
                var tempConstruction = [];
                var tempTermine = [];

                if(!donotsetmarkers)
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

                    switch(marker.dispo){
                        case 0:
                            tempPortefeuille.push($scope.addMarker(marker.lat,marker.lng,iconTemp));
                            break;
                        case 1:
                            tempConstruction.push($scope.addMarker(marker.lat,marker.lng,iconTemp));
                            break;
                        case 2:
                            var filter = $filter('filter')(tempTermine, {lieu: marker.lieu});
                            if(filter.length == 0)
                                tempTermine.push({lieu:marker.lieu,marque:marker.marque,lat:marker.lat,lng:marker.lng,number:1});
                            else
                                filter[0].number =  filter[0].number + 1;
                            break;
                    }
                    //$scope.markers.push(marker);
                });

                $scope.layerConstruction = new L.FeatureGroup(tempConstruction);
                $scope.layerPortefeuille = new L.FeatureGroup(tempPortefeuille);
                $scope.layerTermine = new L.FeatureGroup();

                angular.forEach(tempTermine,function(termine,key){
                    var iconTemp = new L.DivIcon({
                        className: 'blueIcon',
                        iconSize:['16','21'],
                        html: '<div class="divIcon"><img class="icon" style="width:16px;height:21px;" src="./assets/{0}.png"/>'+
                        '<div class="avancement">'+termine.number+'</div></div>'
                    });

                    switch(termine.marque){
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

                    $scope.layerTermine.addLayer($scope.addMarker(termine.lat,termine.lng,iconTemp,false));
                });

                 switch(mapFactory.displayed){
                    case 0:
                        $scope.layerPortefeuille.addTo($scope.map);
                        break;
                    case 1:
                        $scope.layerConstruction.addTo($scope.map);
                        break;
                    case 2:
                        $scope.layerTermine.addTo($scope.map);
                        break;
                }

                mapFactory.layerConstruction = $scope.layerConstruction;
                mapFactory.layerPortefeuille = $scope.layerPortefeuille;
                mapFactory.layerTermine = $scope.layerTermine;
            }


            $rootScope.$on('ADD_MARKER', function(event, marker) {
                mapFactory.addMarker(marker,$scope.addMarker(marker.lat,marker.lng,marker.icon));
                $scope.filtre(mapFactory.getAllMarkers());
            });

            $rootScope.$on('APPLY_FILTER', function(event, markers) {
                $scope.filtre(markers,true);
            });

            $rootScope.$on('STATE_CHANGED', function(event, info) {

                mapFactory.setDisplayed(info.state);
                $scope.toggle.state(info.state);
                $scope.filtre(mapFactory.getAllMarkers());

                $scope.onClick(info,true);
                //$scope.filtre();
            });
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
                stateName: '0',
                title: 'Portefeuille client',
                icon: 'glyphicon glyphicon-home',
                onClick: function(control) {
                    mapFactory.setDisplayed(1);
                    scope.filtre(mapFactory.getAllMarkers());
                    control.state('1');
                }
              },{
                stateName: '1',
                title: 'En cours de construction',
                icon: 'glyphicon glyphicon-wrench',
                onClick: function(control) {
                    mapFactory.setDisplayed(2);
                    scope.filtre(mapFactory.getAllMarkers());
                    control.state('2');
                }
              },{
                stateName: '2',
                title: 'Terminé',
                icon: 'glyphicon glyphicon glyphicon-ok',
                onClick: function(control) {
                    mapFactory.setDisplayed(0);
                    scope.filtre(mapFactory.getAllMarkers());
                    control.state('0');
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

                scope.city = e.geocode.properties.display_name.substr(0,e.geocode.properties.display_name.indexOf(','));

                mapFactory.setDisplayed(0);
                scope.toggle.state(0);
                scope.filtre(mapFactory.getAllMarkers());

                scope.map.fitBounds([
                    [bbox.getSouthEast(),bbox.getNorthEast()],
                    [bbox.getNorthWest(),bbox.getSouthWest()]
                ]);

            }).addTo(scope.map);

            $timeout(scope.setMap({map:scope.map}));
        }
    };
}]);
