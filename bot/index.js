
var l = require('./components/location.js');
var p = require('./components/payload.js');
var b = require('./components/blast.js');
var c = require('./components/casaulty.js');
var i = require('./components/image.js');
var m = require('./components/message.js');

var tweet_enabled = false;

function nuke(tweet_enabled){
        
    ///////////////////////////////
    // * LOCATION *

    var location = new l.Location();
    var latlng = location.getCoordinate();
    var loc_mgrs = location.convertLatLngToMGRS(latlng);
    var place = location.getOSMNominatim(latlng);

    ///////////////////////////////
    // * PAYLOAD *

    var payload = new p.Payload();
    payload.getPayload();
    var pe = payload.exportPayload(); 

    ///////////////////////////////
    // * BLAST *
    
    var blast = new b.Blast(payload.yield);
    blast.launchRandom();

    var blast_radii = {
        "1": blast.fireball_radius,
        "2": blast.range_from_20psi_hob,
        "3": blast.initial_nuclear_radiation_distance,
        "4": blast.range_from_5psi_hob,
        "5": blast.thermal_distance
    };

    ///////////////////////////////
    // * CASAULTY */

    var casaulty = new c.Casaulty();
    //casaulty.getData(latlng, blast);

    ///////////////////////////////
    // * MESSAGE */

    var message = new m.Message();
    message.setTweetEnabled(tweet_enabled);
    message.setLocation(latlng, loc_mgrs, place);
    message.setWeapon(pe['weapon']['name']);

    ///////////////////////////////
    // * IMAGE */

    var image = new i.Image();
    image.setPayload(payload);
    image.setBlast(blast);
    image.setCasaulty(casaulty);
    image.setLocation(location);
    image.setMessage(message);

    image.setCoordinatesAndBlastRadii(latlng, blast_radii);
    image.getMap();

    
    ///////////////////////////////
    // * DEBUG */

    e = {
        latlng: latlng['lat'] + ', ' + latlng['lng'],
        triad: payload.triad,
        platform: payload.platform,
        weapon: payload.weapon,
        warhead: payload.warhead,
        yield: payload.yield,
        detonation: this.surface_airburst ? "surface" : "airburst",
        height_of_burst: blast.hob_ft
    };
    console.log(e);

}

nuke(tweet_enabled);
