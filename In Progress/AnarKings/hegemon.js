// Hegemon - Created by ItanoCircus
// Started July 11th, 2025

// PURPOSE: Hegemon is a LWG AI created for AnarKings 
// HISTORY: Hegemon is based off of BrutalDefault by BrutalityWarlord

    //RECRUIT COMMAND REFERENCE
    // "Command_Name" : "ID_of_Trained_Unit"
    // "Recruit Arbalist":{"Prob": 0.0, "ID": "arbalist"
    // "Recruit Berserker":{"Prob": 0.0, "ID": "berserker"
    // "Recruit Catapult":{"Prob": 0.0, "ID": "siegeengine"
    // "Recruit Cleric":{"Prob": 0.0, "ID": "cleric"
    // "Recruit Gatherer":{"Prob": 0.0, "ID": "gatherer"
    // "Recruit Gathererb":{"Prob": 0.0, "ID": "gatherer"
    // "Recruit Gyrocraftt":{"Prob": 0.0, "ID": "gyrocraftt"
    // "Recruit Knight":{"Prob": 0.0, "ID": "unitknight"
    // "Recruit Leyshaper":{"Prob": 0.0, "ID": "leyshaper"
    // "Recruit Protector":{"Prob": 0.0, "ID": "protector"
    // "Recruit Pyroclast":{"Prob": 0.0, "ID": "pyroclast"


if(!scope.initialized) {

    // Hero selection
    scope.heroList = ["Soldier", "Oathbroken", "Sharpshooter", "Mage", "Niko", "Druides", "Herald", "Eclipse"];
    scope.heroChosen = scope.heroList[Random(scope.heroList.length)];

    // Variable which modify the range behavorial modifiers can be altered
    scope.aggroMod = 0;
    scope.defensiveMod = 0;

    // Aggression Level 
    scope.heroAggression = 0;
    scope.armyAggression = 0;
    scope.goldTimer = 0;

    // Logs all behavioral variables in the console.
    console.log("Player: ", scope.getMyPlayerNumber());
    console.log("Hero Chosen: ", scope.heroChosen);
    console.log("------------------");

    // UNKNOWN USE
    scope.attacker = null;
    scope.limit = false;

    scope.initialized = true;



    // TODO - Asked BrutalityWarlord for feedback
    scope.mapObjectives = {
        ".Gold Rune": [],
    };

    // Stores list of trainin probabilities for units associated to its Hero
    scope.unitChance = {};
    

    // STRATEGY PER HERO
    //-----------------
    
    // Soldier Strategy 
    if(scope.heroChosen == "Soldier"){
        scope.unitChance = {
            //TODO: Starting unit chances
            //"Recruit Berserker":{"Prob": 0.35, "ID": "berserker"},
        };
    }

    // Oathbroken Strategy
    if(scope.heroChosen == "Oathbroken"){
        scope.unitChance = {
            //TODO: Starting unit chances
            //"Recruit Berserker":{"Prob": 0.35, "ID": "berserker"},            
        };
    }

    // Sharpshooter Strategy
    if(scope.heroChosen == "Sharpshooter"){
        scope.unitChance = {
            //TODO: Starting unit chances
            //"Recruit Berserker":{"Prob": 0.35, "ID": "berserker"},
        };
    }

    // Mage Strategy
    if(scope.heroChosen == "Mage"){
        scope.unitChance = {
            //TODO: Starting unit chances
            //"Recruit Berserker":{"Prob": 0.35, "ID": "berserker"},            
        };
    }

    // Niko Strategy
    if(scope.heroChosen == "Niko"){
        scope.unitChance = {
            //TODO: Starting unit chances
            //"Recruit Berserker":{"Prob": 0.35, "ID": "berserker"},
        };
    }

    // Druides Strategy
    if(scope.heroChosen == "Druides"){
        scope.unitChance = {
            //TODO: Starting unit chances
            //"Recruit Berserker":{"Prob": 0.35, "ID": "berserker"},
        };
    }

    // Herald Strategy
    if(scope.heroChosen == "Herald"){
        scope.unitChance = {
            //TODO: Starting unit chances
            //"Recruit Berserker":{"Prob": 0.35, "ID": "berserker"},
        };
    }

    // Eclipse Strategy
    if(scope.heroChosen == "Eclipse"){
        scope.unitChance = {
            //TODO: Starting unit chances
            //"Recruit Berserker":{"Prob": 0.35, "ID": "berserker"},
        };
    }
}

    // Calculates enemy threat level
    // TODO: Populate threat values
    const unitPower = {
        "...Eclipse Clone": 0,
        "...Eclipse Hero": 0,
        ".Arbalist": 0,
        ".Berserker": 0,
        ".Bowman": 0,
        ".Brimstone Explode Unit": 0,
        ".Catapult": 0,
        ".Cleric": 0,
        ".Druides Hero": 0,
        ".Fireling": 0,
        ".Footman": 0,
        ".Gatherer": 0,
        ".Golem": 0,
        ".Gyrocraft": 0,
        ".Hellfire Explode Unit": 0,
        ".Herald Hero": 0,
        ".Knight": 0,
        ".Laputa": 0,
        ".Leaf of Envy Unit": 0,
        ".Leyshaper": 0,
        ".Light of Nature": 0,
        ".Mage Hero": 0,
        ".Niko Hero": 0,
        ".Oathbroken Hero": 0,
        ".Pyroclast": 0,
        ".Sharpshooter Hero": 0,
        ".Slither": 0,
        ".Soldier Hero": 0,
        ".Spider": 0,
        ".Timber": 0,
        ".Wrath of Abyss": 0,
        "zLife Damage Pulses": 0,
        "zLife Heal Pulses": 0,
        "zzzNew Moon Shroud": 0
    };


// GENERAL VARIABLES
var time = Math.round(scope.getCurrentGameTimeInSec());
var me = scope.getMyPlayerNumber();

var myTeam = scope.getMyTeamNumber();
var gold = scope.getGold();
var Width = scope.getMapWidth();
var Height = scope.getMapHeight();
var supply = scope.getCurrentSupply();
var maxSup = scope.getMaxSupply();
var hugeNum = 1000000;
var isHeroDead = (scope.getUnits({type: scope.heroChosen, player: me}) > 0);


// Tickrate for Computer Actions
isAttacked = DecisionTick(Math.floor(10));


// LOCATE COMPUTER-OWNED BUILDINGS
var tOneTowersWisp = scope.getBuildings({type: ".HonorGuard T1", team: myTeam, onlyFinshed: true});
var tOneTowersCrag = scope.getBuildings({type: ".FeralGuard T1", team: myTeam, onlyFinshed: true});
var tOneTowersAll = tOneTowersWisp.concat(tOneTowersCrag);

var tTwoTowersWisp = scope.getBuildings({type: ".HonorGuard T2", team: myTeam, onlyFinshed: true});
var tTwoTowersCrag = scope.getBuildings({type: ".FeralGuard T2", team: myTeam, onlyFinshed: true});
var tTwoTowersAll = tTwoTowersWisp.concat(tTwoTowersCrag);

var tThreeTowersWisp = scope.getBuildings({type: ".HonorGuard T3", team: myTeam, onlyFinshed: true});
var tThreeTowersCrag = scope.getBuildings({type: ".FeralGuard T3", team: myTeam, onlyFinshed: true});
var tThreeTowersAll = tThreeTowersWisp.concat(tThreeTowersCrag);

var bars = scope.getBuildings({type: ".Bar", team: myTeam, onlyFinshed: true});
var crypts = scope.getBuildings({type: ".Crypt", team: myTeam, onlyFinshed: true});
var barsAndCrypts = bars.concat(crypts);

var heroPicker = scope.getBuildings({type: "..PICK YOUR HERO", team: myTeam, onlyFinshed: true});

var allBuild = scope.getBuildings({player: me});


// LOCATE COMPUTER-OWNED UNITS
var idleGatherers = scope.getUnits({type: ".Gatherer", player: me, order: "Stop"});
var allGatherers = scope.getUnits({type: ".Gatherer", player: me});
var heroEclipseClones = scope.getUnits({type: "...Eclipse Clone", player: me});
var heroEclipses = scope.getUnits({type: "...Eclipse Hero", player: me});
var arbalists = scope.getUnits({type: ".Arbalist", player: me});
var berserkers = scope.getUnits({type: ".Berserker", player: me});
var bowmans = scope.getUnits({type: ".Bowman", player: me});
var brimstoneExplodeUnits = scope.getUnits({type: ".Brimstone Explode Unit", player: me});
var catapults = scope.getUnits({type: ".Catapult", player: me});
var clerics = scope.getUnits({type: ".Cleric", player: me});
var heroDruidess = scope.getUnits({type: ".Druides Hero", player: me});
var firelings = scope.getUnits({type: ".Fireling", player: me});
var footmans = scope.getUnits({type: ".Footman", player: me});
var golems = scope.getUnits({type: ".Golem", player: me});
var gyrocrafts = scope.getUnits({type: ".Gyrocraft", player: me});
var hellfireExplodeUnits = scope.getUnits({type: ".Hellfire Explode Unit", player: me});
var heroHeralds = scope.getUnits({type: ".Herald Hero", player: me});
var knights = scope.getUnits({type: ".Knight", player: me});
var laputas = scope.getUnits({type: ".Laputa", player: me});
var leafOfEnvyUnits = scope.getUnits({type: ".Leaf of Envy Unit", player: me});
var leyshapers = scope.getUnits({type: ".Leyshaper", player: me});
var lightOfNatures = scope.getUnits({type: ".Light of Nature", player: me});
var heroMages = scope.getUnits({type: ".Mage Hero", player: me});
var heroNikos = scope.getUnits({type: ".Niko Hero", player: me});
var heroOathbrokens = scope.getUnits({type: ".Oathbroken Hero", player: me});
var pyroclasts = scope.getUnits({type: ".Pyroclast", player: me});
var slithers = scope.getUnits({type: ".Slither", player: me});
var heroSoldiers = scope.getUnits({type: ".Soldier Hero", player: me});
var heroSharpshooters = scope.getUnits({type: ".Sharpshooter Hero", player: me});
var spiders = scope.getUnits({type: ".Spider", player: me});
var timbers = scope.getUnits({type: ".Timber", player: me});
var wrathOfAbysss = scope.getUnits({type: ".Wrath of Abyss", player: me});
var lifeDamagePulsess = scope.getUnits({type: "zLife Damage Pulses", player: me});
var lifeHealPulsess = scope.getUnits({type: "zLife Heal Pulses", player: me});
var newMoonShrouds = scope.getUnits({type: "zzzNew Moon Shroud", player: me});

var Army = heroEclipseClones.concat(
    heroEclipses.concat(
    arbalists.concat(
    berserkers.concat(
    bowmans.concat(
    brimstoneExplodeUnits.concat(
    catapults.concat(
    clerics.concat(
    heroDruidess.concat(
    firelings.concat(
    footmans.concat(
    golems.concat(
    gyrocrafts.concat(
    hellfireExplodeUnits.concat(
    heroHeralds.concat(
    knights.concat(
    laputas.concat(
    leafOfEnvyUnits.concat(
    leyshapers.concat(
    lightOfNatures.concat(
    heroMages.concat(
    heroNikos.concat(
    heroOathbrokens.concat(
    pyroclasts.concat(
    slithers.concat(
    heroSoldiers.concat(
    heroSharpshooters.concat(
    spiders.concat(
    timbers.concat(
    wrathOfAbysss.concat(
    lifeDamagePulsess.concat(
    lifeHealPulsess.concat(
    newMoonShrouds))))))))))))))))))))))))))))))));



// Hero Picker Check
scope.picker = (me);
var heroPickedCheck = DecisionTick(scope.picker);

if(heroPickedCheck == true && heroPicker.length > 0 && time > 1) {
    pickHero(scope.heroChosen);
    scope.picker = hugeNum;
}

// Computer Talk to Player
scope.chatter = (10 + (2 * me));
var chatCheck = DecisionTick(scope.chatter);

//if(chatCheck == true && time > 5) {
if(chatCheck && time > 5 && time < 23) {
    banterChat(scope.heroChosen);
    scope.chatter = hugeNum;
}

if(isHeroDead && time > 5) {
    revengeChat();
}


var resetLaneCheck = DecisionTick(20);
var chooseLane = Random(2);
if(resetLaneCheck || chooseLane == 1) {
    scope.order("AMove", Army, {x: 100, y: 31});
} else {
    scope.order("AMove", Army, {x: 100, y:68});
}



mainBrain();
    
// Does all the things
function mainBrain(){

}

//Function which determines tickrate for certain actions based on gameclock
function DecisionTick(rate){
	var t = time;
	var r = Math.floor(rate + 0.01);
	//determines if the time is perfectly divisable by the rate
	var i = t % r == 0;
	return i;
}

function pickHero(heroChoice) {
    switch(heroChoice) {
        case "Soldier":
            scope.order("zzSoldier Hero", heroPicker);
            break;
        case "Oathbroken":
            scope.order("zzOathbroken Hero", heroPicker);
            break;
        case "Sharpshooter":
            scope.order("zzSharpshooter Hero", heroPicker);
            break;
        case "Mage":
            scope.order("zzMage Hero", heroPicker);
            break;
        case "Niko":
            scope.order("zzNiko Hero", heroPicker);
            break;
        case "Druides":
            scope.order("zzDruides Hero", heroPicker);
            break;
        case "Herald":
            scope.order("zzHerald Hero", heroPicker);
            break;
        case "Eclipse":
            scope.order("zzEclipse Hero", heroPicker);
            break;
        default:
            console.log("Hegemon's pickHero() function failed.");
    }
}


// STUB - If Hero is dead, new chat
// TODO: Expand with Hero-specific lines
function revengeChat(isHeroDead) {
    scope.chatMsg("You haven't seen the last of me!");
}


function banterChat(heroChoice) {
    var identity = "Computer: ";
    var character = "Architect";
    var chatLine = "";
	switch(me) {
        case 1:
		    identity = "Red ";
            break;
        case 2:
		    identity = "Blue ";
            break;
        case 3:
		    identity = "Green ";
            break;
        case 4:
		    identity = "White ";
            break;
        case 5:
		    identity = "Black ";
            break;
        case 6:
		    identity = "Yellow ";
            break;                                                                
        default:
            console.log("Hegemon's banterChat() function failed.");
            console.log("banterChat() failed to find an identity");
    }
    
    switch(heroChoice) {
        case "Soldier":
            character = "(Soldier): ";
            chatChoice = "For the Abdicated Throne!";
            break;
        case "Oathbroken":
            character = "(Oathbroken): ";            
            chatChoice = "I shall take my rightful place.";
            break;
        case "Sharpshooter":
            character = "(Sharpshooter): ";            
            chatChoice = "You'll be buried with my arrow's fall.";
            break;
        case "Mage":
            character = "(Mage): ";
            chatChoice = "Thou art more near thy death.";
            break;
        case "Niko":
            character = "(Niko): ";            
            chatChoice = "Like thousands of other dreams.";
            break;
        case "Druides":
            character = "(Druides): ";
            chatChoice = "Do you smell them, Timber?";
            break;
        case "Herald":
            character = "(Herald): ";
            chatChoice = "A lilting thrum of destruction awaits.";
            break;
        case "Eclipse":
            character = "(Eclipse): ";
            chatChoice = "They won't fix me just yet.";
            break;
        default:
            console.log("Hegemon's pickHero() function failed.");
            console.log("banterChat() failed to find a heroChoice");
    }

    chatLine = identity + character + chatChoice;
    scope.chatMsg(chatLine);
}


//Random Number Function
function Random(max){
	//var rng = new Math.seedrandom("YeetBeetSkeetleDeet")
    return Math.floor(Math.random()*max);
}