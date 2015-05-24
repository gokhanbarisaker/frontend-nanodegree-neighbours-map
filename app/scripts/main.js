/* jshint devel:true */
/*jshint strict:false */

var ko = ko || {};
var google = google || {};
var app = app || {};

(function () {
  'use-strict';

  /**
   ViewModel object
   */
  var Application = function () {
    var self = this;

    this.query = ko.observable('');
    this.places = ko.observableArray([
      {
        title:'DasExperimenzi!'
      }
    ]);
    this.selectedPlace = ko.observable(null);
    this.selectedPlaceImage = ko.computed(function () {
      var image = null;
      var place = self.selectedPlace();

      if (place !== null && place.photos !== null && place.photos !== undefined) {
        var imageElement = document.getElementById('card-detail-header-image');

        var options = {};
        options.maxWidth = imageElement.width;
        options.maxHeight = imageElement.height;

        if(options.maxWidth > 0 && options.maxHeight > 0) {
          image = place.photos[0].getUrl(options);
        }
      }

      return image;
    });

    this.selectedPlaceReviews = ko.computed(function () {
      var reviews = null;

      var place = self.selectedPlace();

      if (place !== null && place.reviews !== undefined) {
        reviews = place.reviews;
      }

      return reviews;
    });

    this.markers = [];

    this.map = {};
    this.service = {};
  };

  /**
    Entry point for initialing whole application
   */
  Application.prototype.init = function () {
    console.log('test');

    this.loadMap();
  };

  /**
    Loads Google Maps API script.
    See Application's initMap function for callback.
   */
  Application.prototype.loadMap = function () {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' +
        '&libraries=places&signed_in=true&callback=app.initMap';
    document.body.appendChild(script);
  };

  /**
    Callback function for google maps api.
    This loads map, map components. Also, binds map event handlers.
    This method will be triggered after script load.

    User geolocation will be used for map location. If failed to retrieve
    geolocation, fallback geolocation, Istanbul, will be used.
   */
  Application.prototype.initMap = function () {

    app.detectGeolocation(function (position) {
      // If failed to get the position
      if (position === null) {
        // Use default position, Istanbul
        position = new google.maps.LatLng(41.043048, 28.9673795);
      }

      var mapOptions = {
        zoom: 14,
        center: position
      };

      app.map = new google.maps.Map(document.getElementById('map'),
          mapOptions);

      console.log('Loaded map');

      app.service = new google.maps.places.PlacesService(app.map);

      console.log('Loaded service');

      app.search(app.service, '');

      google.maps.event.addListener(app.map, 'dragend', function() {
        app.search(app.service, app.query());
      });

      app.query.subscribe(function () {
        app.search(app.service, app.query());
      });
    });
  };

  /**
    Creates a map marker on map.
   */
  Application.prototype.createMarker = function (place) {
    var marker = new google.maps.Marker({
      map: app.map,
      position: place.geometry.location,
      title: place.name
    });

    google.maps.event.addListener(marker, 'click', function() {
      app.toggleDetails(place);
    });

    return marker;
  };

  /**
    Searces nearby places around map center and attaches results as map marker.

    !!!: All non-search-result markers will be removed from map.
   */
  Application.prototype.search =  function (service, query) {

    // Clear artifacts
    app.clearMarkers();
    app.places.removeAll();

    // Create request
    var request = {
      location: app.map.getCenter(),
      radius: '500',
      name: query
    };

    // Perform request
    service.search(request, function (results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          var place = results[i];
          app.places.push(place);
          var marker = app.createMarker(place);
          app.markers.push(marker);
        }
      }
    });
  };

  /**
    Detects gelocation using browser APIs.
   */
  Application.prototype.detectGeolocation = function(handler) {
    // Try HTML5 geolocation
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = new google.maps.LatLng(position.coords.latitude,
                                         position.coords.longitude);

        handler(pos);
      }, function() {
        handler(null);
      });
    }
  };

  /**
   Clears all the markers from map
   */
  Application.prototype.clearMarkers = function() {
    // Reset marker collection reference @app
    var markers = app.markers;
    app.markers = [];

    // Detach each marker from map
    markers.forEach(function (element) {
      element.setMap(null);
    });
  };

  /**
   Toggles detail card for the given place.

   See: showDetail and hodeDetail methods for possible outcomes
   */
  Application.prototype.toggleDetails = function (place) {
    var selectedPlace = app.selectedPlace();
    /*jshint -W106 */
    var samePlace = (selectedPlace === null)?(false):(app.selectedPlace().place_id === place.place_id);
    /*jshint +W106 */
    var detailCardVisible = document.getElementById('card-detail').style.display === 'block';
    if (samePlace && detailCardVisible) {
      app.hideDetails();
    }
    else {
      app.showDetails(place);
    }
  };

  /**
    Shows detail card with given place
   */
  Application.prototype.showDetails = function (place) {

    app.clearDetails();
    app.selectedPlace(place);
    document.getElementById('card-detail').style.display = 'block';
    app.fetchDetails(place, function(place) {
      app.selectedPlace(place);
    });
  };

  /**
    Hides detail card with given place
   */
  Application.prototype.hideDetails = function () {
    document.getElementById('card-detail').style.display = 'none';
  };

  Application.prototype.clearDetails = function() {
    app.selectedPlace(null);
  };

  /**
    Requests PlaceResult object from google maps api for given place.
   */
  Application.prototype.fetchDetails = function (place, callback) {
    /*jshint -W106 */
    var request = {
      placeId:place.place_id
    };
    /*jshint +W106 */

    app.service.getDetails(request, function (place, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        callback(place);
      }
      else {
        callback(null);
      }
    });
  };


  app = new Application();
  ko.applyBindings(app);

  window.onload = function() {
    app.init();
  };

  document.onkeydown = function(evt) {
      evt = evt || window.event;
      if (evt.keyCode === 27 && app.hideDetails !== undefined) {
          app.hideDetails();
      }
  };
}());
