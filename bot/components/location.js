const request = require('sync-request');
const turf = require('@turf/helpers');
const turfBooleanPointInPolygon = require('@turf/boolean-point-in-polygon');
const turfBbox = require('@turf/bbox');
const mgrs = require('mgrs');
const parseString = require('xml2js').parseString;
const conus = require('../data/conus.json');

//
// REFERENCES
// 1: https://gis.stackexchange.com/questions/163044/mapbox-how-to-generate-a-random-coordinate-inside-a-polygon
// https://www.movable-type.co.uk/scripts/latlong.html
// https://stackoverflow.com/questions/5260423/torad-javascript-function-throwing-error/21623256#21623256
// https://math.stackexchange.com/questions/1799528/converting-the-great-circle-distance-to-direct-distance-between-two-points-on-ea


module.exports = {
	Location: Location
};

function Location () {
    this.getCoordinate = getRandomCoordinatesInsidePolygon;
    this.convertLatLngToMGRS = convertLatLngToMGRS;
    this.getOSMNominatim = getOSMNominatim;

    this.polygon = conus['features'][0];
    this.projection = 'EPSG:3857';

    this.C = 40075017; // Earth circumference [m]
    this.R = this.C / (2 * Math.PI); // Earth radius [m]
    this.mi2m = 1609.344; // miles to meters

};

//

function getRandomCoordinatesInsidePolygon() {
    var turfBbox = turf.bbox(this.polygon);
    var inside = false;
    while (!inside) {
        var lat = bbox[1] + (Math.random() * (bbox[3] - bbox[1]));
        var lng = bbox[0] + (Math.random() * (bbox[2] - bbox[0]));
        var point = turf.point([lng, lat]);
        inside = turfBooleanPointInPolygon(point, this.polygon); 
    }

    var latlng = {
        "lat": point['geometry']['coordinates'][1],
        "lng": point['geometry']['coordinates'][0],
    };

    return latlng;
}

function convertLatLngToMGRS(latlng){
    var loc_mgrs = mgrs.forward([latlng['lng'],latlng['lat']]);
    return loc_mgrs;
}

function getOSMNominatim(latlng) {

    var that = this;
    var nominatim = null;
    const lat = latlng['lat'];
    const lng = latlng['lng'];
    const zoom = 13;

    var url = `https://nominatim.openstreetmap.org/reverse?format=xml&lat=${lat}&lon=${lng}&zoom=${zoom}` ;
    //console.log(url)
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
