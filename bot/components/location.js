const request = require('sync-request');
const turf = require('@turf/helpers');
const bbox = require('@turf/bbox').default;
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;
const mgrs = require('mgrs');
const parseString = require('xml2js').parseString;
const conus = require('../data/conus.json');

module.exports = {
	Location: Location
};

function Location() {

    this.C = 40075017; // Earth circumference [m]
    this.mi2m = 1609.344; // miles to meters

    this.R = this.C / (2 * Math.PI); // Earth radius [m]

    this.getCoordinate = getRandomCoordinatesInsidePolygon;
    this.convertLatLngToMGRS = convertLatLngToMGRS;
    this.getOSMNominatim = getOSMNominatim;

    this.polygon = conus['features'][0];
    this.projection = 'EPSG:3857';

};

function getRandomCoordinatesInsidePolygon() {
    var that = this;
    var boundingbox = bbox(that.polygon);
    var inside = false;

    while (!inside) {
        var lat = boundingbox[1] + (Math.random() * (boundingbox[3] - boundingbox[1]));
        var lng = boundingbox[0] + (Math.random() * (boundingbox[2] - boundingbox[0]));
        var point = turf.point([lng, lat]);
        inside = booleanPointInPolygon(point, that.polygon); 
    }

    var latlng = {
        "lat": point['geometry']['coordinates'][1],
        "lng": point['geometry']['coordinates'][0],
    };

    return latlng;
}

// convertLatLngToMGRS() returns a lat/lng coordinate 
// in Military Grid Reference System (MGRS) format.
function convertLatLngToMGRS(latlng) {
    var loc_mgrs = mgrs.forward([latlng['lng'],latlng['lat']]);
    return loc_mgrs;
}

// getOSMNominatim() returns a country/state/county/city 'place' 
// from a reverse geocoded lat/lng coordinate using the OSM Nominatim API.
function getOSMNominatim(latlng) {

    var that = this;
    var nominatim = null;
    const lat = latlng['lat'];
    const lng = latlng['lng'];
    const zoom = 13;

    var url = `https://nominatim.openstreetmap.org/reverse?format=xml&lat=${lat}&lon=${lng}&zoom=${zoom}` ;
    var res = request('GET', url, {'headers': {'user-agent': 'user-agent'}});
    var xml = res.getBody('utf-8');

    parseString(xml, function (err, result) {
        nominatim = JSON.parse(JSON.stringify(result));
    });

    var n = nominatim['reversegeocode']['addressparts'][0];
    var loc1 = '', loc2 = '';

    if('city' in n){
        loc1 = n['city'];
    }else if('county' in n){
        loc1 = n['county'];
    }
    if('state' in n){
        loc2 = n['state'];
    }else if('country' in n){
        loc2 = n['country'];
    }

    var place = ''
    if(loc1 === ''){
        place += loc2
    }else{
        place += loc1 + ', ' + loc2
    }

    return place
}
