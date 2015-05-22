"use strict";var ko=ko||{},google=google||{},app=app||{},Application=function(){var e=this;this.query=ko.observable(""),this.places=ko.observableArray([{title:"DasExperimenzi!"}]),this.selectedPlace=ko.observable(null),this.selectedPlaceImage=ko.computed(function(){var a=null,t=e.selectedPlace();if(null!==t&&null!==t.photos&&void 0!==t.photos){var p=document.getElementById("card-detail-header-image"),o={};o.maxWidth=p.width,o.maxHeight=p.height,o.maxWidth>0&&o.maxHeight>0&&(a=t.photos[0].getUrl(o))}return a}),this.selectedPlaceReviews=ko.computed(function(){var a=null,t=e.selectedPlace();return null!==t&&(a=t.reviews),a}),this.markers=[],this.map={},this.service={}};Application.prototype.init=function(){console.log("test"),this.loadMap()},Application.prototype.loadMap=function(){var e=document.createElement("script");e.type="text/javascript",e.src="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&signed_in=true&callback=app.initMap",document.body.appendChild(e)},Application.prototype.initMap=function(){app.detectGeolocation(function(e){null===e&&(e=new google.maps.LatLng(41.043048,28.9673795));var a={zoom:14,center:e};app.map=new google.maps.Map(document.getElementById("map"),a),console.log("Loaded map"),app.service=new google.maps.places.PlacesService(app.map),console.log("Loaded service"),app.search(app.service),google.maps.event.addListener(app.map,"dragend",function(){app.search(app.service,app.query())}),app.query.subscribe(function(){app.search(app.service,app.query())})})},Application.prototype.createMarker=function(e){return new google.maps.Marker({map:app.map,position:e.geometry.location,title:e.name})},Application.prototype.search=function(e,a){app.clearMarkers(),app.places.removeAll();var t={location:app.map.getCenter(),radius:"500",name:a};e.search(t,function(e,a){if(a===google.maps.places.PlacesServiceStatus.OK)for(var t=0;t<e.length;t++){var p=e[t];app.places.push(p);var o=app.createMarker(p);app.markers.push(o)}})},Application.prototype.detectGeolocation=function(e){navigator.geolocation&&navigator.geolocation.getCurrentPosition(function(a){var t=new google.maps.LatLng(a.coords.latitude,a.coords.longitude);e(t)},function(){e(null)})},Application.prototype.clearMarkers=function(){var e=app.markers;app.markers=[],e.forEach(function(e){e.setMap(null)})},Application.prototype.toggleDetails=function(e){var a=app.selectedPlace(),t=null===a?!1:app.selectedPlace().place_id===e.place_id,p="block"===document.getElementById("card-detail").style.display;t&&p?app.hideDetails():app.showDetails(e)},Application.prototype.showDetails=function(e){app.clearDetails(),app.selectedPlace(e),document.getElementById("card-detail").style.display="block",app.fetchDetails(e,function(e){app.selectedPlace(e)})},Application.prototype.hideDetails=function(){document.getElementById("card-detail").style.display="none"},Application.prototype.clearDetails=function(){app.selectedPlace(null)},Application.prototype.fetchDetails=function(e,a){var t={placeId:e.place_id};app.service.getDetails(t,function(e,t){a(t===google.maps.places.PlacesServiceStatus.OK?e:null)})};var app=new Application;ko.applyBindings(app),window.onload=function(){app.init()};