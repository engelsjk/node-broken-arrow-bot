# node-broken-arrow-bot

![](images/twitter-header.png)

### NOTE: SEE *PERMISSIONS* SECTION BELOW FOR IMPORTANT INFORMATION ABOUT THE CODE!

### BROKEN ARROW BOT

### HOW DOES IT WORK?

The heart of this Twitter bot is a dynamic image generator that uses the Node-based image processing library [Jimp](https://github.com/oliver-moran/jimp). It relies on the Mapbox Static API to generate a [satellite imagery](https://www.mapbox.com/api-documentation/#maps) file and a [map image with a custom style and marker](https://www.mapbox.com/api-documentation/#retrieve-a-static-map-from-a-style).

It also has a hard-coded set of data files that describe basic technical details of the [US Nuclear Triad](https://armscontrolcenter.org/factsheet-the-nuclear-triad/), which are used to randomly select a combination of realistic platforms, weapons, warheads and payloads. 

A random latitude/longitude coordinate in the continental United States is then generated, and a satellite image of that location is used as the base image layer. 

![](images/broken-arrow-breakdown.png)

### WHAT IS A BROKEN ARROW?

The [Department of Defense Manual 3150.08-M](http://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodm/315008m.pdf) defines 'Broken Arrow' as...

>"An unexpected event involving nuclear weapons or radiological nuclear weapon components that results in:
><ul>
><li>Accidental or unauthorized launching, firing, or use by U.S. forces or U.S.-supported allied
>forces of a nuclear-capable weapon system that could create the risk of an outbreak of war.</li>
><li>Loss or destruction of a nuclear weapon or radiological nuclear weapon component,
>including jettisoning.</li>
><li>An increase in the possibility of, or actual occurrence of, an explosion, a nuclear detonation,
>or radioactive contamination.</li>
><li>Nonnuclear detonation or burning of a nuclear weapon or radiological nuclear weapon
>component.</li>
><li>Public hazard, actual or implied.</li>
><li>Any act of God, unfavorable environment, or condition resulting in damage to the weapon,
>facility, or component.</li>
</ul>

### INSPIRATION

This project was inspired by the website [NUKEMAP](https://nuclearsecrecy.com/nukemap/), an interactive web map that shows the effects of various nuclear weapons on major cities around the world. 

![](images/nukemap.png)

Created by [Dr. Alex Wellerstein](http://blog.nuclearsecrecy.com/about-me/), a science and nuclear weapons historian and assistant professor, NUKEMAP is one of the few resources I've found online that is aimed at showing people the real world impact of nuclear weapons.

### PERMISSIONS

In my rush to make-an-idea-happen, I never stopped to think about asking permission to use two resources that this bot relies on. Specifically, I had used a very complex nuclear effects calculation script (nukeeffects.js) and an undocumented API for estimating nuclear blast casaulties, both of which are resources of the NUKEMAP web app. 

I've reached out to Dr. Wellerstein asking for his permission to use either the code or the API resource, but I did not receive a response. Therefore, I decided to disable the Twitter bot because it didn't feel ethical to continue running it without permission to use those two resources that were fundamental parts of the bot. 

In the code hosted on this repo, I've .gitignore'd the nukeeffects.js library and disabled the request calls to the API resource. If you want to actually run this code locally (with the Tweeting disabled), you'll need to get the nukeeffects.js library from the NUKEMAP website and add it to a 'js' folder, making the below edits to the .js file.

~~~~
//var bc = new NukeEffects();

module.exports = {
	NukeEffects: NukeEffects
};
~~~~

Also, you'll need to add a config.js file that exports all of your own token keys. If you don't plan on tweeting, you can skip the Twitter tokens but you'll need your own [Mapbox token](https://www.mapbox.com/help/how-access-tokens-work/).

~~~~
module.exports = {
  mapbox_token: '[MAPBOX_TOKEN]',
  twitter_consumer_key: '[TWITTER_CONSUMER_KEY]',  
  twitter_consumer_secret: '[TWITTER_CONSUMER_SECRET]',
  twitter_access_token: '[TWITTER_ACCESS_TOKEN]',  
  twitter_access_token_secret: '[TWITTER_ACCES_TOKEN_SECRET]'
}
~~~~

### TWITTER

I follow a rather large community of nuclear nonprofileration/policy experts on Twitter. Here's an incomplete list of people and organizations that I highly recommend checking out if you're interested in learning more!

* [@wellerstein](https://twitter.com/wellerstein)
* [@nuclearkatie](https://twitter.com/nuclearkatie)
* [@casillic](https://twitter.com/Casillic)
* [@nukestrat](https://twitter.com/nukestrat)
* [@georgewherbert](https://twitter.com/GeorgeWHerbert)
* [@cherylrofer](https://twitter.com/CherylRofer)
* [@nuclearanthro](https://twitter.com/NuclearAnthro)
* [@kingstonareif](https://twitter.com/KingstonAReif)
* [@nuclearban](https://twitter.com/nuclearban)
* [@beafihn](https://twitter.com/BeaFihn)
* [@kelseydav](https://twitter.com/KelseyDav)
* [@bulletinatomic](https://twitter.com/BulletinAtomic)
* [@armscontrolwonk](https://twitter.com/ArmsControlWonk)
