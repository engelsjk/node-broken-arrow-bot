const linspace = require('linspace');
const platforms = require('../data/platforms.json');
const weapons = require('../data/weapons.json');
const warheads = require('../data/warheads.json');

module.exports = {
	Payload: Payload
};

function Payload () {

    this.yieldDeviation = 0.05;
    this.numDialAYields = 5;

    this.platforms = platforms;
    this.weapons = weapons;
    this.warheads = warheads;

    this.triad = null;
    this.platform = null;
    this.weapon = null;
    this.warhead = null;
    
    this.getTriad = getTriad;
    this.getPlatform = getPlatform;
    this.getWeapon = getWeapon;
    this.getWarhead = getWarhead;
    this.getYield = getYield;

    this.getPayload = getPayload;
    this.exportPayload = exportPayload;

}

function getTriad() {
    var listTriad = Object.keys(this.platforms['triad']);
    this.triad = listTriad[Math.floor(Math.random() * listTriad.length)];
}

function getPlatform() {
    var listPlatforms = Object.keys(this.platforms['triad'][this.triad]);
    this.platform = listPlatforms[Math.floor(Math.random() * listPlatforms.length)];
}

function getWeapon() {
    var listWeapons = this.platforms['triad'][this.triad][this.platform]['weapons'];
    this.weapon = listWeapons[Math.floor(Math.random() * listWeapons.length)];
}

function getWarhead() {
    var listWarheads = this.weapons[this.weapon]['warheads'];
    this.warhead = listWarheads[Math.floor(Math.random() * listWarheads.length)];
}

function getYield() {
    var that = this;
    var warhead_type = this.warheads[this.warhead]['type'];
    if(warhead_type === 'estimate'){
        getEstimateYield(that);
    }else if(warhead_type === 'dial-a-yield'){
        getDialAYield(that);
    }else{
        getEstimateYield(that);
    }
}

function getDialAYield(that) {
    var yield_min = that.warheads[that.warhead]['yield']['min'];
    var yield_max = that.warheads[that.warhead]['yield']['max'];
    var yield_options = linspace(yield_min, yield_max, that.numDialAYields);
    that.yield = yield_options[Math.floor(Math.random() * yield_options.length)];
    addYieldDeviation(that);
}

function getEstimateYield(that) {
    var yield_min = that.warheads[that.warhead]['yield']['min'];
    var yield_max = that.warheads[that.warhead]['yield']['max'];
    that.yield = Math.random() * (yield_max - yield_min) + yield_min;
    addYieldDeviation(that);
}

function addYieldDeviation(that){
    that.yield += that.yield * ((Math.random() < 0.5 ? -1 : 1) * (Math.random() * that.yieldDeviation));
}

function getPayload() {
    this.getTriad(); 
    this.getPlatform();
    this.getWeapon();
    this.getWarhead();
    this.getYield();
}

function exportPayload() {
    return {
        "triad": {
            "type": this.platforms['triad'][this.triad][this.platform]['type'],
            "name": this.platforms['triad'][this.triad][this.platform]['name']
        },
        "weapon" : {
            "type": this.weapons[this.weapon]['type'],
            "name": this.weapons[this.weapon]['name'],
        },
        "warhead": {
            "name": this.warheads[this.warhead]["name"],
            "yield": this.yield
        }
       
    }
}
