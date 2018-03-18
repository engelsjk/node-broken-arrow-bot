const moment = require('moment');
const fs = require('fs');
const twit = require('twit')
const config = require('../config.js');

// REFERENCES

module.exports = {
	Message: Message
};

function Message () {

    this.setLocation = setLocation;
    this.setWeapon = setWeapon;
    this.setImage = setImage;
    this.setTweetEnabled = setTweetEnabled;
    this.prepareTweet = prepareTweet;
    this.sendTweet = sendTweet;

    this.tweet_enabled = false;

    this.T = new twit({
        consumer_key:         config['twitter_consumer_key'],
        consumer_secret:      config['twitter_consumer_secret'],
        access_token:         config['twitter_access_token'],
        access_token_secret:  config['twitter_access_token_secret'],
        timeout_ms:           60*1000
    })

}

function setLocation(latlng, loc_mgrs, place){
    var that = this;
    that.latlng = latlng;
    that.loc_mgrs = loc_mgrs;
    that.place = place;
}

function setWeapon(weapon){
    var that = this;
    that.weapon = weapon;
}

function setImage(image){
    var that = this;
    that.image = image;
}

function setTweetEnabled(tweet_enabled){
    var that = this;
    that.tweet_enabled = tweet_enabled;
}

function newMessage(d){
    var timestamp = getTimestamp();

    var location1 = d.place.toUpperCase();;
    var location2 = d.latlng['lat'].toFixed(3) + ',' + d.latlng['lng'].toFixed(3);
    var weapon = d.weapon.toUpperCase();

    var l1 = `MSGID/OPREP-3PBA/${location1}/001//`
    var l2 = `FLAGWORD/PINNACLE/BROKEN ARROW//`
    var l3 = `TIMELOC/${timestamp}/${location2}/INIT//`
    var l4 = `EVTYP/1/${weapon}`

    var msg = [l1, l2, l3, l4];
    return msg;

}

function prepareTweet(){
    
    var that = this;

    var msg = newMessage(that);

    if(!that.tweet_enabled){
        console.log('Tweeting is currently disabled!');
        console.log(msg)
        return;
    }

    var msg_l1 = msg[0];
    var msg_a = msg.join('\r\n');

    fs.readFile(that.image.map.filepath_o, { encoding: 'base64' }, (err, data) => {
        if (err) throw err;
        var b64content = data;
        sendTweet(that.T, b64content, msg_a, msg_l1);
    });

}

function sendTweet(T, b64content, msg_a, msg_l1){
    T.post('media/upload', { media_data: b64content }, function (err, data, response) {
        var mediaIdStr = data.media_id_string;
        var altText = msg_l1;
        var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
      
        T.post('media/metadata/create', meta_params, function (err, data, response) {
            if (!err) {
                var params = { status: msg_a, media_ids: [mediaIdStr] }
                T.post('statuses/update', params, function (err, data, response) {
                    console.log(data)
                })
            }else{
                console.log(err)
            }
        })
    })
}

function getTimestamp(){
    var now = moment().utc();
    var timestamp = now.format('DDHHmm') + 'Z' + now.format('MMMYY').toUpperCase();
    return timestamp;
}
