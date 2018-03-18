const request = require('request');
const fs = require('fs');
const jimp = require('jimp');
const config = require('../config.js');

module.exports = {
	Image: Image
};

function Image () {

    this.access_token = config['mapbox_token'];
    this.getMap = getMap;
    this.setCoordinatesAndBlastRadii = setCoordinatesAndBlastRadii;
    this.setPayload = setPayload;
    this.setBlast = setBlast;
    this.setCasaulty = setCasaulty;
    this.setLocation = setLocation;
    this.setMessage = setMessage;

    this.C = 40075017; // Earth circumference [m]
    this.mi2m = 1609.344; // miles to meters

    this.latlng = null;
    this.payload = null;
    this.blast = null;
    this.casaulty = null;
    this.location = null;
    this.message = null;

    this.font = {
        filepath: 'font/abel-fnt.fnt',
        size: 25,
        padding_vertical: 5,
        padding_horizontal: 15,
        font: null
    };

    this.padding = {
        horizontal_major: 25,
        vertical_major: 25,
        horizontal_minor: 15,
        vertical_minor: 15
    };
    
    this.mask = {
        filepath: 'assets/image/mask.png',
        image: null
    };

    this.scale = {
        filepath: 'assets/image/scale.png',
        width: 30,
        height: 200,
        mage: null,
        length: null
    };

    this.payloadimages = {
        size: 100,
        images: {
            "platform": null,
            "weapon": null,
            "warhead": null,
            "payload": null
        }
    }

    this.blastimages = {
        num_blast: 5,
        fade: {
            "1": 0.4,
            "2": 0.45,
            "3": 0.55,
            "4": 0.65,
            "5": 0.7
        },
        image_size: 1000,
        filepath: 'assets/blast/',
        filename: 'blast-%s.png',
        blast_radii: null,
        images: {
            "1": null,
            "2": null,
            "3": null,
            "4": null,
            "5": null
        }
    };

    this.map = {
        zoom: 15,
        size: 1280,
        path: 'tmp/',
        filepath_i: 'tmp/map.png',
        filepath_o: 'tmp/blast.png',
        b64d: null,
        image: null
    };

    this.minimap = {
        style: 'cjbt1fizea8ae2tjqqbv3neyn',
        zoom: 3.5,
        center: {lat: 39, lng: -96},
        size: '1000x600',
        height: 210,
        width: 350,
        filepath: 'tmp/minimap.png',
        dot: {
            url: 'https%3A%2F%2Fi.imgur.com%2FCUnT5Eh.png'
        },
        image: null
    };
}

function setCoordinatesAndBlastRadii (latlng, blast_radii){
    var that = this;
    that.latlng = latlng;
    that.blastimages.blast_radii = blast_radii;
    getZoomLevel(that);
}

function setPayload(payload){
    var that = this;
    that.payload = payload;
}

function setBlast(blast){
    var that = this;
    that.blast = blast;
}

function setCasaulty(casaulty){
    var that = this;
    that.casaulty = casaulty;
}

function setLocation(location){
    var that = this;
    that.location = location;
}

function setMessage(message){
    var that = this;
    that.message = message;
}

function getMap() {
    var that = this;

    const lat = that.latlng['lat'];
    const lng = that.latlng['lng'];
    const zoom = that.map.zoom;
    const imagesize = that.map.size + "x" + that.map.size;

    // Mapbox Static API
    url = `https://api.mapbox.com/v4/mapbox.satellite/${lng},${lat},${zoom}/${imagesize}.png?access_token=${that.access_token}`;

    request(url, {encoding: 'binary'}, (err, res, body) => {
        if (err) { return console.log(err); }
        fs.writeFile(this.map.filepath_i, body, 'binary', function (err) {});
        getMinimap(that);
    });
}

function getMinimap(that){

    const dot_lat = that.latlng['lat'];
    const dot_lng = that.latlng['lng'];
    const dot_url = that.minimap.dot.url;
    const c_lat = that.minimap.center['lat'];
    const c_lng = that.minimap.center['lng'];
    const zoom = that.minimap.zoom;
    const imagesize = that.minimap.size;
    const style = that.minimap.style;

    // Mapbox Static API
    url = `https://api.mapbox.com/styles/v1/atthegate/${style}/static/url-${dot_url}(${dot_lng},${dot_lat})/${c_lng},${c_lat},${zoom},0.00,0.00/${imagesize}@2x?access_token=${that.access_token}`

    request(url, {encoding: 'binary'}, (err, res, body) => {
        if (err) { return console.log(err); }
        fs.writeFile(that.minimap.filepath, body, 'binary', function (err) {});
        startImageProcessing(that);
    });
}

function saveMap(that){

    jimp.read(that.map.filepath_i).then(function (image) {
        that.map.image = image;
        var x = that.map.size / 2;
        var y = that.map.size / 2;

         // Add Mask
         addMask(that);

         // Add Minimap
         addMinimap(that);

         // Add Scale
         addScale(that);

        // Add Payload
        addPayload(that);

        // Add Blast Image(s)
        addBlastImage(that, "5", x, y);
        addBlastImage(that, "4", x, y);
        addBlastImage(that, "3", x, y);
        addBlastImage(that, "2", x, y);        
        addBlastImage(that, "1", x, y);

        // Add Text
        addText(that);

        var tmp_filename_vars = [
            that.payload.triad, 
            that.payload.platform, 
            that.payload.weapon, 
            that.payload.warhead,
            that.blast.surface_airburst ? "airburst" : "surface",
            that.blast.hob_ft.toFixed(0) + 'ft',
            that.blast.kt.toFixed(0) + 'kt',
            that.latlng['lat'].toFixed(3),
            that.latlng['lng'].toFixed(3)
        ];
        var tmp_filename = tmp_filename_vars.join('_') + '.png';

        that.map.image.getBuffer(jimp.MIME_PNG, function(err, src){
            fs.writeFile(that.map.filepath_o, src, 'binary', (err) => {
                if (err) throw err;
                console.log('image-filesaved');
                writeCallback(that);
            })
        });
        
    }).catch(function (err) {
        console.error(err);
    });
}

function writeCallback(that){
     // * MESSAGE * //
    that.message.setImage(that);
        
    // *** SENDING TWEET *** //
    that.message.prepareTweet();
}

function startImageProcessing(that){
    loadPlatformImage(that);
}

// * LOAD FUNCTIONS * //

function loadPlatformImage(that){
    var platform = that.payload['platform'];
    var filepathname = 'assets/platform/' + platform + '.png'; 
    jimp.read(filepathname).then(function (image) {
        that.payloadimages.images['platform'] = image;
        loadWeaponImage(that);
    }).catch(function (err) {
        console.error(err);
    });
}

function loadWeaponImage(that){
    var weapon = that.payload['weapon'];
    var filepathname = 'assets/weapon/' + weapon + '.png'; 
    jimp.read(filepathname).then(function (image) {
        that.payloadimages.images['weapon'] = image;
        loadWarheadImage(that);
    }).catch(function (err) {
        console.error(err);
    });
}

function loadWarheadImage(that){
    var warhead = that.payload['warhead'];
    var filepathname = 'assets/warhead/' + warhead + '.png';
    jimp.read(filepathname).then(function (image) {
        that.payloadimages.images['warhead'] = image;
        loadBlastImages(that, 5, 1);
    }).catch(function (err) {
        console.error(err);
    });
}

function loadBlastImages(that, index_max, index) {
    var image_index = String(index);
    var filename = that.blastimages.filename.replace('%s', image_index);
    var filepathname = that.blastimages.filepath + filename;
    jimp.read(filepathname).then(function (image) {
        that.blastimages.images[image_index] = image;
        index += 1;
        if (index <= index_max){
            loadBlastImages(that, index_max, index);
        } else {
            loadMask(that);
        }
    }).catch(function (err) {
        console.error(err);
    });
}

function loadMask(that){
    jimp.read(that.mask.filepath).then(function (image) {
        that.mask.image = image;
        loadMinimap(that);
    }).catch(function (err) {
        console.error(err);
    });
}

function loadMinimap(that){
    jimp.read(that.minimap.filepath).then(function (image) {
        that.minimap.image = image;
        loadScale(that);
    }).catch(function (err) {
        console.error(err);
    });
}

function loadScale(that){
    jimp.read(that.scale.filepath).then(function (image) {
        that.scale.image = image;
        loadText(that);
    }).catch(function (err) {
        console.error(err);
    });
}

function loadText(that){
    jimp.loadFont(that.font.filepath).then(function (font) {
        that.font.font = font;
        saveMap(that);
    }).catch(function (err) {
        console.error(err);
    });
}

// * ADDER FUNCTIONS */

function addPayload(that) {

    if(['b-52h', 'b-2'].includes(that.payload.platform)){
        // BOMBER - TOP-DOWN-HORIZONTAL
        var w = that.payloadimages.size;
        var h = that.payloadimages.size;
        var x = that.padding.horizontal_minor;
        var y = that.map.size - 2*that.payloadimages.size - that.padding.vertical_minor;
        that.map.image.composite( that.payloadimages.images['platform'].resize(w,h), x, y);
        that.map.image.composite( that.payloadimages.images['weapon'].resize(w,h/2), x, y+1*that.payloadimages.size);
        that.map.image.composite( that.payloadimages.images['warhead'].resize(w,h/2), x, y+1.5*that.payloadimages.size);
    }else{
        // MISSILE - BOTTOM-UP-VERTICAL
        var w = that.payloadimages.size;
        var h = that.payloadimages.size;
        var x = that.padding.horizontal_minor;
        var y = that.map.size - 2*that.payloadimages.size - that.padding.vertical_minor;
        that.map.image.composite( that.payloadimages.images['warhead'].resize(w,h/2), x, y);
        that.map.image.composite( that.payloadimages.images['weapon'].resize(w,h/2).rotate(-90), x+that.payloadimages.size/4, y+0.5*that.payloadimages.size);
        that.map.image.composite( that.payloadimages.images['platform'].resize(w,h/2), x, y+1.5*that.payloadimages.size);
    }
}

function addBlastImage(that, index, x, y) {

    var m2p = 1 / getMetersPerPixelConversion(that.latlng['lat'], that.map.zoom, that.C);
    var wh = (that.blastimages.blast_radii[index]*2) * that.mi2m * m2p;
    if(wh === 0){ return;}
    that.blastimages.images[index].resize(wh, wh).fade(that.blastimages.fade[index]);
    var w = that.blastimages.images[index].bitmap.width;
    var h = that.blastimages.images[index].bitmap.width;
    that.map.image.composite( that.blastimages.images[index], x-w/2, y-h/2 );
}

function addMask(that){
    that.map.image.composite( that.mask.image, 0, 0);
}

function addMinimap(that){

    that.minimap.image.resize(that.minimap.width, that.minimap.height);
    var x = that.map.size - that.minimap.width - (400 - that.minimap.width)/2;
    var y = 0;
    that.map.image.composite( that.minimap.image, x, y);
}

function addScale(that){

    var x = that.padding.horizontal_major;

    var m2p = 1 / getMetersPerPixelConversion(that.latlng['lat'], that.map.zoom, that.location.C);
    that.scale.length = (that.blastimages.blast_radii[5]*2) * that.mi2m * m2p;
    that.scale.image.resize(that.scale.width, that.scale.length);

    var y = that.map.size/2 - that.scale.length/2;
    that.map.image.composite( that.scale.image, x, y);
}

function addText(that){

    // COORDINATES
    var coords = that.latlng['lat'].toFixed(3) + ', ' + that.latlng['lng'].toFixed(3);
    var x = that.map.size - 200 - 115; 
    var y = that.minimap.height;
    that.map.image.print(that.font.font, x, y, coords);

    var loc_mgrs = that.location.convertLatLngToMGRS(that.latlng);
    var x = that.map.size - 200 - 115; 
    var y = that.minimap.height + that.font.size + that.font.padding_vertical;
    that.map.image.print(that.font.font, x, y, loc_mgrs);

    // SCALE
    var scale = 2 * that.blast.thermal_distance.toFixed(2) + ' MILES';
    var x = that.padding.horizontal_major; 
    var y = that.map.size/2 + that.scale.length/2 + that.padding.vertical_minor;
    that.map.image.print(that.font.font, x, y, scale);

    // PAYLOAD & BLAST
    var pe = that.payload.exportPayload();

    var blast_1 = pe['triad']['name'].toUpperCase();
    var blast_2 = pe['weapon']['name'].toUpperCase();
    var blast_3 = pe['warhead']['name'].toUpperCase();
    if(pe['weapon']['type'] === 'gravity bomb'){
        blast_3 = '(' + pe['weapon']['type'].toUpperCase() + ')';
    }
    var blast_4 = 'YIELD [KILOTONS]: ' + String(that.blast.kt.toFixed(1));
    var blast_5 = 'BURST HEIGHT [FEET]: ' + String(that.blast.hob_ft.toFixed(1));
    var blast_6 = 'EST. FATALITIES: ' + parseCasaultyStrings(that.casaulty.casaulty.fatalities);
    var blast_7 = 'EST. INJURIES: ' + parseCasaultyStrings(that.casaulty.casaulty.injuries);

    var x = (that.payloadimages.size+2*that.padding.horizontal_minor) + that.font.padding_horizontal;
    var n = 7;
    var y = that.map.size - (235 - n*(that.font.size + that.font.padding_vertical))/2 - n*(that.font.size + that.font.padding_vertical) + 1.5*that.font.padding_vertical;

    that.map.image.print(that.font.font, x, y, blast_1);
    that.map.image.print(that.font.font, x, y + 1*(that.font.size+that.font.padding_vertical), blast_2);
    that.map.image.print(that.font.font, x, y + 2*(that.font.size+that.font.padding_vertical), blast_3);
    that.map.image.print(that.font.font, x, y + 3*(that.font.size+that.font.padding_vertical), blast_4);
    that.map.image.print(that.font.font, x, y + 4*(that.font.size+that.font.padding_vertical), blast_5);
    that.map.image.print(that.font.font, x, y + 5*(that.font.size+that.font.padding_vertical), blast_6);
    that.map.image.print(that.font.font, x, y + 6*(that.font.size+that.font.padding_vertical), blast_7);
}

// * MISC FUNCTIONS * //

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getMetersPerPixelConversion(y, z, C) {
    var y_rad = y * Math.PI / 180;
    var S = C * Math.cos(y_rad) / Math.pow(2, (z + 8));
    return S; // meters per pixel
}

function getZoomLevel(that) {
    var arr = Object.keys(that.blastimages.blast_radii).map(function(key) {
        return that.blastimages.blast_radii[key];
    });
    var max_blast_radii = Math.max(...arr);
    var diameter = max_blast_radii * 2 * that.mi2m;
    var meters = 0;
    var zoom = 19;
    while (meters < diameter) {
        var p2m = getMetersPerPixelConversion(that.latlng['lat'], zoom, that.location.C);
        meters = p2m * that.map.size;
        zoom -= 1;
    }
    that.map.zoom = zoom;
}

function parseCasaultyStrings(input) {
    var output = (parseInt(input).toLocaleString('en-US'));
    output = isNaN(output) ? "---" : output;
    return output;
}