<html>
    <head>
        <title></title>
    </head>
    <body ng-app="mapAngular">


        <link rel="stylesheet" href="./css/leaflet.css">
        <link rel="stylesheet" href="./css/app.css">
        <link rel="stylesheet" href="./css/Control.Geocoder.css" />
        <link rel="stylesheet" href="./css/leaflet.contextmenu.min.css"/>
        <link rel="stylesheet" href="./css/bootstrap.min.css"/>
        <link rel="stylesheet" href="./css/easy-button.css"/>
        <link rel="stylesheet" href="./css/bootstrap-datepicker.min.css"/>



        <!--<div class="filtres col-md-8 col-md-offset-2">
            <div class="filtre active col-md-6">En cours de construction</div>
            <div class="filtre col-md-6">Finalisé</div>
        </div>-->

        <div class="container col-md-12 app" ng-controller="mapController">

            <div class="loading" ng-show="loading">
                <div class="sk-cube-grid">
                  <div class="sk-cube sk-cube1"></div>
                  <div class="sk-cube sk-cube2"></div>
                  <div class="sk-cube sk-cube3"></div>
                  <div class="sk-cube sk-cube4"></div>
                  <div class="sk-cube sk-cube5"></div>
                  <div class="sk-cube sk-cube6"></div>
                  <div class="sk-cube sk-cube7"></div>
                  <div class="sk-cube sk-cube8"></div>
                  <div class="sk-cube sk-cube9"></div>
                </div>
            </div>


            <leaflet data-switch-info-form="switchInfoForm(save)" data-set-map="setMap(map)" data-switch-filter-form="switchFilterForm()" data-change-marker="changeMarker(marker,infos,onlyItem)" data-show-info-form="showInfoForm"></leaflet>
            <div ng-class="{'col-md-4 form active': showInfoForm,'col-md-4 form': !showInfoForm}" >
                <div class="step" ng-show="marker.id">
                    <ul class="progressbar col-md-12">
                        <li class="col-md-4" ng-class="{'active' : marker.dispo >= 0}">Portefeuille client</li>
                        <li class="col-md-4" ng-class="{'active' : marker.dispo >= 1}" ng-click="marker.dispo == 0 && changeState(1)">En cours de construction</li>
                        <li class="col-md-4" ng-class="{'active' : marker.dispo >= 2}" ng-click="marker.dispo == 1 && changeState(2)">Terminé</li>
                    </ul>
                </div>
                <form id="addMarker" method="post" name="infoForm">
                  <div class="form-group">
                    <label for="lat">Lat Lng</label>
                    <div class="col-md-12" style="padding:0px;margin-bottom:15px;">
                        <div class="col-md-6" style="padding-left:0px;"><input required type="text" name="lat" ng-model="marker.lat" id="lat" class="form-control"></div>
                        <div class="col-md-6" style="padding-right:0px;"><input required type="text" name="lng" ng-model="marker.lng" id="lng" class="form-control"></div>
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="lat">Date de signature</label>
                    <input datepicker type="text" name="signature" ng-change="toto()" ng-model="marker.signature" id="signature" class="form-control" required>
                  </div>
                  <div class="form-group">
                    <label for="lat">Agence</label>
                    <input type="text" name="agence" ng-model="marker.agence" id="agence" class="form-control" required>
                  </div>
                  <div class="form-group">
                    <label for="lat">Commerciale</label>
                    <input type="text" name="commerciale" ng-model="marker.commerciale" id="commerciale" class="form-control" required>
                  </div>
                  <div class="form-group">
                    <label for="marque">Marque</label>
                    <select ng-model="marker.marque" ng-change="onConstructeurChange()" name="marque" id="marque" class="form-control" required>
                        <option>Maison d'aujourd'hui</option>
                        <option>Demeures & Cottages</option>
                        <option>Maison sweet</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="client">Client</label>
                    <input type="text" ng-model="marker.client" name="client" id="client" class="form-control" required>
                  </div>
                  <div class="form-group">
                    <label for="lieu">Lieu</label>
                    <input type="text" ng-model="marker.lieu" name="lieu" id="lieu" class="form-control" required>
                  </div>
                  <div class="form-group">
                    <label for="montantttc">Montant TTC</label>
                    <input type="text" ng-model="marker.montantttc" name="montantttc" id="montantttc" class="form-control" required>
                  </div>
                  <div class="form-group">
                    <label for="montantht">Montant HT</label>
                    <input type="text" ng-model="marker.montantht" name="montantht" id="montantht" class="form-control" required>
                  </div>
                  <div ng-if="marker.dispo > 0" class="form-group">
                    <label for="montantht">Conducteur</label>
                    <select ng-model="marker.conducteur" name="conducteur" id="conducteur" class="form-control" required>
                            <option>PM</option>
                            <option>SA</option>
                    </select>
                  </div>
                  <div ng-if="marker.dispo > 0" class="form-group">
                    <label for="montantht">Avancement</label>
                    <select ng-model="marker.avancement" ng-change="onAvancementChange()" name="avancement" id="avancement" class="form-control" required>
                        <option>OC</option>
                        <option>F</option>
                        <option>GO</option>
                        <option>C</option>
                        <option>E1</option>
                        <option>E2</option>
                        <option>L</option>
                    </select>
                  </div>
                  <button type="submit" id="submit" ng-disabled="infoForm.$invalid" ng-click="addMarker()" class="btn btn-success pull-right">Valider</button>
                  <button ng-click="switchInfoForm()" style="margin-right:15px" class="btn btn-danger pull-right" id="cancel">Annuler</button>
                </form>
            </div>

            <div ng-class="{'filterFormContainer col-md-12 active': showFilterForm,'filterFormContainer col-md-12': !showFilterForm}">
                <div class="col-md-6 col-md-offset-3">
                    <form id="filters" class="col-md-12">
                       <div class="form-group col-md-3 vHr">
                            <label for="lat">Date de signature : </label>
                            <input datepicker ng-model="filters.signature" ng-change="mettreAJour()" name="filterSignature" id="filterSignature" class="form-control"></input>
                        </div>
                        <div class="form-group col-md-3 vHr">
                            <label for="lat">Agence commerciale : </label>
                            <input ng-model="filters.agence" ng-change="mettreAJour()" name="filterAgence" id="filterAgence" class="form-control"></input>
                        </div>
                        <div class="form-group col-md-3 vHr">
                            <label for="lat">Commerciale : </label>
                            <input ng-model="filters.commerciale" ng-change="mettreAJour()" name="filterCommerciale" id="filterCommerciale" class="form-control"></input>
                        </div>
                        <div class="form-group col-md-3 vHr">
                            <label for="lat">Marque : </label>
                            <select ng-model="filters.marque" ng-change="mettreAJour()" name="filterMarque" id="filterMarque" class="form-control">
                                <option></option>
                                <option>Maison d'aujourd'hui</option>
                                <option>Demeures & Cottages</option>
                                <option>Maison sweet</option>
                            </select>
                        </div>
                        <div class="form-group col-md-3 vHr">
                            <label for="lat">Client : </label>
                            <input ng-model="filters.client" ng-change="mettreAJour()" name="filterClient" id="filterClient" class="form-control"></input>
                        </div>
                        <div class="form-group col-md-3 vHr">
                            <label for="lat">Lieu de construction : </label>
                            <input ng-model="filters.lieu" ng-change="mettreAJour()" name="filterLieu" id="filterLieu" class="form-control"></input>
                        </div>
                        <div ng-show="displayed > 0" class="form-group col-md-3 vHr">
                            <label for="lat">Conducteur de travaux : </label>
                            <select ng-model="filters.conducteur" ng-change="mettreAJour()" name="filterConducteur" id="filterConducteur" class="form-control">
                                <option></option>
                                <option>PM</option>
                                <option>SA</option>
                            </select>
                        </div>
                        <div ng-show="displayed > 0" class="form-group col-md-3 vHr">
                            <label for="lat">Avancement : </label>
                            <select ng-model="filters.avancement" ng-change="mettreAJour()" name="filterAvancement" id="filterAvancement" class="form-control">
                                <option></option>
                                <option>OC</option>
                                <option>F</option>
                                <option>GO</option>
                                <option>C</option>
                                <option>E1</option>
                                <option>E2</option>
                                <option>L</option>
                            </select>
                        </div>

                    </form>
                    <div class="form-group col-md-12 text-center" style="padding:11px;">
                            <label>Nombres de résultats</label>
                            <p id="nbFilter">{{nbFilterResults}}</p>
                            <p>Prix moyen TTC : {{prixMoyenTTC | currency:"€"}}</br>Prix moyen HT : {{prixMoyenHT | currency:"€"}}</p>
                            <button class="btn btn-success" ng-click="validFilters()">Mise à jour</button>
                            <button class="btn btn-primary" ng-click="exportData()"><span class="glyphicon glyphicon-print"></span></button>
                    </div>
                </div>
            </div>
        </div>

        <script src="./js/leaflet.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.1/angular.min.js"></script>
        <script src="https://code.angularjs.org/1.6.1/angular-resource.min.js"></script>
        <script src="./js/angular-leaflet-directive.min.js"></script>
        <script src="./js/Control.Geocoder.js"></script>
        <script src="./js/leaflet.contextmenu.min.js"></script>
        <script src="./js/jquery-3.1.1.min.js"></script>
        <script src="./js/bootstrap.min.js"></script>
        <script src="./js/easy-button.js"></script>
        <script src="./js/bootstrap-datepicker.min.js"></script>
        <script src="./locales/bootstrap-datepicker.fr.min.js"></script>
        <script src="./js/moment.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/alasql/0.3.7/alasql.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.9.2/xlsx.core.min.js"></script>
        <script src="./js/app.js"></script>

        <script>

            var blueIcon = new L.DivIcon({
                className: 'blueIcon',
                iconSize:['16','21'],
                html: '<div class="divIcon"><img class="icon" style="width:16px;height:21px;" src="./assets/blue.png"/>'
            });

            var purpleIcon = new L.DivIcon({
                className: 'purpleIcon',
                iconSize:['16','21'],
                html: '<div class="divIcon"><img class="icon" style="width:16px;height:21px;" src="./assets/purple.png"/>'
            });

            var orangeIcon = new L.DivIcon({
                className: 'orangeIcon',
                iconSize:['16','21'],
                html: '<div class="divIcon"><img class="icon" style="width:16px;height:21px;" src="./assets/orange.png"/>'
            });

            if (!String.prototype.format) {
              String.prototype.format = function() {
                var args = arguments;
                return this.replace(/{(\d+)}/g, function(match, number) {
                  return typeof args[number] != 'undefined'
                    ? args[number]
                    : match
                  ;
                });
              };
            }

        </script>
    </body>
</html>
