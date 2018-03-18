// NOTE: nukeeffects-2.5.js not included in this repo! 
// NOTE: Unable to get permission from Alex Wellerstein of NUKEMAP to use non-licensed JavaScript code.

const n = require('../js/nukeeffects-2.5.js');
var nukeeffects = new n.NukeEffects();

module.exports = {
	Blast: Blast
};

function Blast (yield) {

    this.mi2ft = 5280; // miles to feet conversion
    this.psi5 = 5;     // fixed 5 psi
    this.psi20 = 20;   // fixed 20 psi
    this.rem = '500';  // fixed 500 rem radiation

    this.ft2mi = 1 / this.mi2ft; // feet to miles conversion

    this.kt = yield;

    this.hob_ft = null;
    this.hob_opt = null;

    this.launchRandom = launchRandom;
    this.launchDefined = launchDefined;
    this.getBlastType = getBlastType;
    this.getHeightOfBlast = getHeightOfBlast;
    this.getBlastResults = getBlastResults;
    this.getFakeBlastResults = getFakeBlastResults;
    this.printBlastResults = printBlastResults;
}

function launchRandom() {
    this.getBlastType();        
    this.getHeightOfBlast();    
    //this.getBlastResults();     
    this.getFakeBlastResults();
}

function launchDefined(surface_airburst, hob_ft, hob_opt) {
    this.surface_airburst = surface_airburst;
    this.airburst = this.surface_airburst ? true  : false;
    this.surface = !this.airburst;
    this.hob_ft = hob_ft;
    this.hob_opt = hob_opt;
    this.getBlastResults();
}

function setYield(yield) {
    this.kt = yield;
}

function getBlastType() {
    this.surface_airburst = Math.round(Math.random());
    this.airburst = this.surface_airburst ? true  : false;
    this.surface = !this.airburst;
}

// getHeightOfBlast() sets the nuclear blast height,
// either on the surface or at a calculated height 
// to optimize for a given blast PSI.
function getHeightOfBlast() {
    this.hob_ft = this.surface_airburst ? nukeeffects.opt_height_for_psi(this.kt, this.psi5) : 0;
    this.hob_opt = Math.round(Math.random()); // 0: Maximize for all effects | 1: Optimize for 5 psi
    this.hob_opt = this.surface_airburst ? this.hob_opt : 0;
    this.hob_ft = this.hob_opt === 0 ? 0 : this.hob_ft;
}


// getBlastResults() calculates various nuclear blast estimates
// using the NUKEMAP nukeeffects.js module.
function getBlastResults() {

    // 5 PSI
    if(this.airburst) {
        if(!this.hob_opt) {
            this.range_from_5psi_hob = nukeeffects.psi_distance(this.kt, this.psi5, this.airburst);
        } else {
            this.range_from_5psi_hob = nukeeffects.range_from_psi_hob(this.kt, this.psi5, this.hob_ft) * this.ft2mi;
        }
    } else {
        this.range_from_5psi_hob = nukeeffects.range_from_psi_hob(this.kt, this.psi5, 0) * this.ft2mi;
    }
    
    // 20 PSI
    if(this.airburst) {
        if(!this.hob_opt) {
            this.range_from_20psi_hob = nukeeffects.psi_distance(this.kt, this.psi20, this.airburst);
        } else {
            this.range_from_20psi_hob = nukeeffects.range_from_psi_hob(this.kt, this.psi20, this.hob_ft) * this.ft2mi;
        }
    } else {
        this.range_from_20psi_hob = nukeeffects.range_from_psi_hob(this.kt, this.psi20, 0) * this.ft2mi;
    }
    
    // Radiation
    this.initial_nuclear_radiation_distance = nukeeffects.initial_nuclear_radiation_distance(this.kt, this.rem); // mile
    if(this.hob_ft && this.airburst) {
        this.initial_nuclear_radiation_distance = nukeeffects.ground_range_from_slant_range(this.initial_nuclear_radiation_distance, this.hob_ft * this.ft2mi);
    }
    
    // Thermal Distance
    this.thermal_distance = nukeeffects.thermal_distance(this.kt, '_3rd-100', this.airburst); // mile
    if(this.hob_ft && this.airburst) {
        this.thermal_distance = nukeeffects.ground_range_from_slant_range(this.thermal_distance, this.hob_ft * this.ft2mi);
    }
    
    // Fireball
    this.fireball_radius = nukeeffects.fireball_radius(this.kt, this.airburst); // mile
    
    // Crater
    this.crater = nukeeffects.crater(this.kt, true); // mile

}

function getFakeBlastResults() {
    this.fireball_radius = 0.25;
    this.range_from_20psi_hob = 0.65;
    this.initial_nuclear_radiation_distance = 1.15;
    this.range_from_5psi_hob = 1.35;
    this.thermal_distance = 2.5;
    console.log('Warning! Blast results are fixed values and not representative of the actual yield or height of burst!')
}

function printBlastResults () {
    console.log('yield: ' + this.kt);
    console.log('hob_ft: ' + this.hob_ft + " : " + this.hob_ft * this.mi2ft);
    console.log('fireball_radius: ' + this.fireball_radius + " : " + this.fireball_radius * this.mi2ft);
    console.log('range_from_20psi_hob: ' + this.range_from_20psi_hob + " : " + this.range_from_20psi_hob * this.mi2ft);     
    console.log('initial_nuclear_radiation_distance: ' + this.initial_nuclear_radiation_distance + " : " + this.initial_nuclear_radiation_distance * this.mi2ft);    
    console.log('range_from_5psi_hob: ' + this.range_from_5psi_hob + " : " + this.range_from_5psi_hob * this.mi2ft);        
    console.log('thermal_distance: ' + this.thermal_distance + " : " + this.thermal_distance * this.mi2ft);
    console.log('ground_range_from_slant_range: ' + this.ground_range_from_slant_range + " : " + this.ground_range_from_slant_range * this.mi2ft);
    console.log('crater: ' + this.crater);
}
