const request = require('sync-request');

module.exports = {
	Casaulty: Casaulty
};

function Casaulty () {
    this.casaulty = null;
    this.getData = getData;

    //
    this.casaulty = {
        injuries: null,
        fatalities: null
    };
}

function getData(coord, blast) {

    const lat = coord['lat'];
    const lng = coord['lng'];

    var url = "http://nuclearsecrecy.com/nukemap_shared/casualties.php?" + "lat=" + lat + "&lng=" + lng + "&kt=" + blast.kt + "&airburst=" + blast.surface_airburst + "&hob_opt=" + blast.hob_opt + "&hob_ft=" + blast.hob_ft;
    var res = request('GET', url);
    var b = res.getBody('utf-8');
    this.casaulty = JSON.parse(b.slice(1,b.length-1));
}

