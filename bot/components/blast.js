// NOTE: nukeeffects-2.5.js not included in this repo! 
// Unable to get permission from Alex Wellerstein of NUKEMAP to use non-licensed JavaScript code.
const n = require('../js/nukeeffects-2.5.js');
var nukeeffects = new n.NukeEffects();

module.exports = {
	Blast: Blast
};

function Blast (yield) {
    this.mi2ft = 5280;
    this.ft2mi = 1 / this.mi2ft;

    this.kt = yield;

    this.psi5 = 5; 
    this.psi20 = 20; 
    this.rem = '500';

    this.hob_ft = null;
    this.hob_opt = null;

    this.launchRandom = launchRandom;
    this.launchDefined = launchDefined;
    this.getBlastType = getBlastType;
    this.getHeightOfBlast = getHeightOfBlast;
    this.getBlastResults = getBlastResults;
    this.printBlastResults = printBlastResults;

}

function launchRandom() {
    //console.log('blast-launchrandom');
    this.getBlastType();        // Surface OR Airburst
    this.getHeightOfBlast();    // Height of Burst [ft]
    this.getBlastResults();     // Burst Results (PSI range, radiation, thermal, fireball, crater)
}

function launchDefined(surface_airburst, hob_ft, hob_opt) {
    //console.log('blast-launchdefined');
    // surface_airburst --- 0 : Surface | 1 : Airburst
    this.surface_airburst = surface_airburst;
    this.airburst = this.surface_airburst ? true  : false;
    this.surface = !this.airburst;

    // hob_ft --- ft
    this.hob_ft = hob_ft;

    // hob_opt --- 0: Maximize for all effects | 1: Optimize for 5 psi
    this.hob_opt = hob_opt;

    this.getBlastResults();
}

function setYield (yield) {
    this.kt = yield;
}

function getBlastType () {
    // 0 : Surface | 1 : Airburst
    this.surface_airburst = Math.round(Math.random());
    this.airburst = this.surface_airburst ? true  : false;
    this.surface = !this.airburst;
}

function getHeightOfBlast () {
    this.hob_ft = this.surface_airburst ? nukeeffects.opt_height_for_psi(this.kt, this.psi5) : 0;
    // 0: Maximize for all effects | 1: Optimize for 5 psi
    this.hob_opt = Math.round(Math.random()); 
    this.hob_opt = this.surface_airburst ? this.hob_opt : 0;
    this.hob_ft = this.hob_opt === 0 ? 0 : this.hob_ft;
}

function getBlastResults () {
    // PSI - 1.5 : windows breaking | 5 : houses crushed | 20 : most buildings destroyed
    if(this.airburst) {
        if(!this.hob_opt) {
            this.range_from_5psi_hob = nukeeffects.psi_distance(this.kt, this.psi5, this.airburst);
        } else {
            this.range_from_5psi_hob = nukeeffects.range_from_psi_hob(this.kt, this.psi5, this.hob_ft) * this.ft2mi;
        }
    } else {
        this.range_from_5psi_hob = nukeeffects.range_from_psi_hob(this.kt, this.psi5, 0) * this.ft2mi;
    }
    
    if(this.airburst) {
        if(!this.hob_opt) {
            this.range_from_20psi_hob = nukeeffects.psi_distance(this.kt, this.psi20, this.airburst);
        } else {
            this.range_from_20psi_hob = nukeeffects.range_from_psi_hob(this.kt, this.psi20, this.hob_ft) * this.ft2mi;
        }
    } else {
        this.range_from_20psi_hob = nukeeffects.range_from_psi_hob(this.kt, this.psi20, 0) * this.ft2mi;
    }
    
    // REM
    /*
    REM - 500 : 50-90% mortality without medical care | 600 : 80% mortality with medical care
          1000 : 95% mortality with medical care | 5000 : 100% mortality
    */
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
    // [lip-radius, inside-radius, depth]
    this.crater = nukeeffects.crater(this.kt, true); // mile

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
