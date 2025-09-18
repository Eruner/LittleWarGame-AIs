/*
	Map = AnarKings
	Bot = plays as random hero

	Features:
	- picks random hero
	- goes to bottom lane
	- recruits clerics
	- tries to heal up when low on hp
*/
var HERO_PICKS = {
	TEAM_ON_LEFT:"↓ HERE HARDCODE WHAT HEROES WILL BE PICKED BY AI ↓",
	Player_1 : "Random",//Random, Soldier, Sharpshooter, Mage, Niko, Oath, Druid, Herald, Eclipse
	Player_2 : "Random",//Random, Soldier, Sharpshooter, Mage, Niko, Oath, Druid, Herald, Eclipse
	Player_3 : "Random",//Random, Soldier, Sharpshooter, Mage, Niko, Oath, Druid, Herald, Eclipse
	TEAM_ON_RIGHT:"↓ HERE HARDCODE WHAT HEROES WILL BE PICKED BY AI ↓",
	Player_4 : "Random",//Random, Soldier, Sharpshooter, Mage, Niko, Oath, Druid, Herald, Eclipse
	Player_5 : "Random",//Random, Soldier, Sharpshooter, Mage, Niko, Oath, Druid, Herald, Eclipse
	Player_6 : "Random",//Random, Soldier, Sharpshooter, Mage, Niko, Oath, Druid, Herald, Eclipse
	WARNING : "! ALWAYS SAVE YOUR CHANGES and THEN UPLOAD as Custom AI !"
};
var scope = scope || null;
try{
	if(!scope){
		console.log('Scope is not initialized');
		return;
	}
	if(!scope.Eruner){
		scope.Eruner = (function(){
			var AI;
			function init() {
				try{
					loadDefaultVariables();
					loadPositions();
					loadTeamLeader();
					loadHeroes();
				}catch(Pokemon){
					console.log('Error during init:\n'+Pokemon);
				}
			}
			function makeMove(){
				try{
					observe();
				}catch(Pokemon){
					console.log('Error during observe:\n'+Pokemon);
				}
				try{
					orient();
				}catch(Pokemon){
					console.log('Error during orient:\n'+Pokemon);
				}
				try{
					act();
				}catch(Pokemon){
					console.log('Error during act:\n'+Pokemon);
				}
			}
			/**********************************************************/
			/********************* LOADING ****************************/
			/**********************************************************/
			function loadDefaultVariables(){
				AI = {};
				AI.me = scope.getMyPlayerNumber();
				AI.team = (AI.me < 4) ? 'left' : 'right';
				AI.teamNumber = scope.getMyTeamNumber();
				AI.enemyTeamNumber = (AI.me < 4) ? 4 : 1;
				AI.ON_LEFT = (AI.team == 'left');
				AI.ON_BOT = true;
				AI.WAITING_TIME = 9;
				AI.HERO_NAMES = [
					".Soldier Hero",
					".Sharpshooter Hero", 
					".Oathbroken Hero", 
					".Mage Hero", 
					".Niko Hero", 
					".Druides Hero", 
					".Herald Hero", 
					".Eclipse Hero"
				];
				pickHero();
				AI.LEVEL = 0;
				AI.HEALED = true;
				AI.HP = {
					PREVIOUS : 0,
					CURRENT : 0,
					DIFFERENCE : 0,
					BONUS : 0
				};
				AI.MOB_ALLY_NAMES = AI.ON_LEFT ?  [".Footman", ".Bowman"] : [".Spider", ".Slither"];
				AI.MOB_ENEMY_NAMES = AI.ON_LEFT ? [".Spider", ".Slither"] : [".Footman", ".Bowman"];
				AI.RUNE_NAME = ".Gold Rune";
				AI.RUNE_SPAWNER_NAME = ".Gold Rune Spawner";
				AI.BARRACKS = AI.ON_LEFT ? ".Bar" : ".Crypt";
			}
			function pickHero(){
				var playerNumber = 'Player_' + AI.me;
				var heroChoice = HERO_PICKS[playerNumber];
				switch(heroChoice){
				case 'Soldier':
					AI.HERO_NAME = ".Soldier Hero";
					break;
				case 'Sharpshooter':
					AI.HERO_NAME = ".Sharpshooter Hero";
					break;
				case 'Mage':
					AI.HERO_NAME = ".Mage Hero";
					break;
				case 'Niko':
					AI.HERO_NAME = ".Niko Hero";
					break;
				case 'Oath':
					AI.HERO_NAME = ".Oathbroken Hero";
					break;
				case 'Druid':
					AI.HERO_NAME = ".Druides Hero";
					break;
				case 'Herald':
					AI.HERO_NAME = ".Herald Hero";
					break;
				case 'Eclipse':
					AI.HERO_NAME = "...Eclipse Hero";
					break;
				default:
					AI.HERO_NAME = AI.HERO_NAMES[Math.floor(Math.random()*AI.HERO_NAMES.length)];
				}
			}
			function loadPositions(){
				AI.MAP = {};
				var leftMap = {
					HEAL 	: {x:23,y:41},
					NEXUS	: {x:32,y:50},
					TOWER3	: {x:35,y:50},
					TOWER2_TOP	: {x:52,y:31},
					//TOWER2_MID: {x:60,y:50},
					TOWER2_BOT	: {x:52,y:69},
					TOWER1_TOP	: {x:82,y:31},
					//TOWER1_MID: {x:75,y:50},
					TOWER1_BOT	: {x:82,y:69}
				};
				var rightMap = {
					HEAL 	: {x:177,y:41},
					NEXUS	: {x:168,y:50},
					TOWER3	: {x:165,y:50},
					TOWER2_TOP	: {x:148,y:31},
					//TOWER2_MID: {x:140,y:50},
					TOWER2_BOT	: {x:148,y:69},
					TOWER1_TOP	: {x:118,y:31},
					//TOWER1_MID: {x:125,y:50},
					TOWER1_BOT	: {x:118,y:69}
				};
				AI.MAP.MY = AI.ON_LEFT ? leftMap : rightMap;
				AI.MAP.ENEMY = AI.ON_LEFT ? rightMap : leftMap;
				AI.MAP.mid = {x:100,y:50};
				AI.MAP.nodes = [
					{a:'NEXUS',b:'TOWER2_TOP',distance:1},
					{a:'NEXUS',b:'TOWER2_BOT',distance:1},
					{a:'TOWER2_TOP',b:'TOWER2_BOT',distance:1},
					{a:'TOWER2_BOT',b:'TOWER2_TOP',distance:1},
					{a:'TOWER2_TOP',b:'TOWER1_TOP',distance:2},
					{a:'TOWER2_BOT',b:'TOWER1_BOT',distance:2},
					{a:'TOWER1_TOP',b:'mid',distance:3},
					{a:'TOWER1_BOT',b:'mid',distance:3},
					{a:'TOWER1_TOP',b:'enemy',distance:3},
					{a:'TOWER1_BOT',b:'enemy',distance:3}
				];
				AI.MAP.RUNE = {
					'top':{x:100,y:25},
					'mid':{x:100,y:50},
					'bot':{x:100,y:75}
				};
			}
			function loadTeamLeader(){
                AI.LEADER = AI.me;
                var allPlayers = game.players;
                for(var i = 0, max = allPlayers.length; i < max; i++){
					var onePlayer = allPlayers[i];
                    if(onePlayer.team.number != AI.teamNumber){
                        continue;
                    }
					if(onePlayer.name.indexOf('Computer') < 0){
						AI.LEADER = onePlayer.number;
                        break;
					}
                    if(onePlayer.number < AI.LEADER){
                        AI.LEADER = onePlayer.number;
                    }
				}
                AI.AM_I_TEAM_LEADER = (AI.LEADER == AI.me);
			}
			function loadHeroes(){
				AI.HERO_BRAINS = {
					".Soldier Hero":{
						abilities:[{
							name:".Slash",
							cooldown:7,
							cost:0,
							lastTime:0,
							range:2.15,
							description:"dmg enemies around you"
						},{
							name:".Shatter",
							cooldown:15,
							cost:0,
							lastTime:0,
							range:2.3,
							description:"dmg target enemy"
						}],
						hp:400,
						hp_lv:25,
						isRanged:false,
						act:function(){
							//if enemy is close, then activate abilities
						}
					},
					".Sharpshooter Hero":{
						abilities:[{
							name:".Mark of Pride",
							cooldown:10,
							cost:0,
							lastTime:0,
							range:30,
							description:"dmg target area"
						},{
							name:".Hit the Knees",
							cooldown:13,
							lastTime:0,
							range:7,
							description:"dmg target area"
						}],
						hp:300,
						hp_lv:15,
						isRanged:true,
						act:function(){

						}
					},
					".Mage Hero":{
						abilities:[{
							name:".Flames",
							cooldown:0,
							cost:55,
							lastTime:0,
							range:6.5,
							description:"dmg target area"
						},{
							name:".Flame Wall",
							cooldown:7,
							cost:20,
							lastTime:0,
							range:6.5,
							description:"summon fireling"
						},{
							name:".Relocate",
							cooldown:10,
							cost:60,
							lastTime:0,
							range:3.5,
							description:"teleport"
						}],
						hp:250,
						hp_lv:10,
						isRanged:true,
						act:function(){

						}
					},
					".Niko Hero":{
						abilities:[{
							name:".Bolt of Light",
							cooldown:5,
							cost:0,
							lastTime:0,
							range:4.5,
							description:"heal target area"
						},{
							name:".Pancake",
							cooldown:10.5,
							cost:6,
							lastTime:0,
							range:8,
							description:"heal+speed target area"
						},{
							name:".SSwap Heal",
							cooldown:0,
							cost:0,
							lastTime:0,
							range:0,
							description:"switch to dmg mode"
						},{
							name:".Bolt of Smite",
							cooldown:5,
							cost:0,
							lastTime:0,
							range:4.5,
							description:"dmg target area"
						},{
							name:".Molotov",
							cooldown:9,
							cost:6,
							lastTime:0,
							range:4,
							description:"dmg target area"
						},{
							name:".SSwap Attack",
							cooldown:0,
							cost:0,
							lastTime:0,
							range:0,
							description:"switch to healing mode"
						}],
						hp:250,
						hp_lv:20,
						isRanged:true,
						act:function(){

						}
					},
					".Oathbroken Hero":{
						abilities:[{
							name:".Daybreak",
							cooldown:5,
							cost:20,
							lastTime:0,
							range:1,
							description:"dmg target"
						},{
							name:".A Shackle Broken",
							cooldown:10,
							lastTime:0,
							cost:15,
							range:1,
							description:"dmg target"
						}],
						hp:400,
						hp_lv:10,
						isRanged:false,
						act:function(){

						}
					},
					".Druides Hero":{
						abilities:[{
							name:".Lead of Envy",
							cooldown:22,
							cost:0,
							lastTime:0,
							range:6,
							description:"heal totem target area"
						},{
							name:".A Tree Falls Training",
							cooldown:13,
							cost:1,
							lastTime:0,
							range:1,
							description:"makes wolf"
						},{
							name:".Twisted Nature",
							cooldown:30,
							cost:0,
							lastTime:0,
							range:5,
							description:"buff dmg regen"
						}],
						hp:300,
						hp_lv:20,
						isRanged:true,
						act:function(){

						}
					},
					".Herald Hero":{
						abilities:[{
							name:".Raise Arms",
							cooldown:10,
							cost:0,
							lastTime:0,
							range:4.5,
							description:"buff allies, channel"
						},{
							name:".Raise Legs",
							cooldown:15,
							cost:0,
							lastTime:0,
							range:1,
							description:"3s speed"
						}],
						hp:225,
						hp_lv:10,
						isRanged:false,
						act:function(){
							//attack ally to heal him
						}
					},
					".Eclipse Hero":{
						abilities:[{
							name:".Lunar Apex",
							cooldown:12,
							cost:0,
							lastTime:0,
							range:5,
							description:"dmg target area"
						},{
							name:".Shimmer",
							cooldown:20,
							cost:1,
							lastTime:0,
							range:5,
							description:"teleport"
						},{
							name:".Twilight",
							cooldown:15,
							cost:0,
							lastTime:0,
							range:5,
							description:"clone"
						}],
						hp:255,
						hp_lv:15,
						isRanged:false,
						act:function(){

						}
					}
				};
				AI.HERO_INFO = AI.HERO_BRAINS[AI.HERO_NAME];
			}
			/**********************************************************/
			/********************* OBSERVE ****************************/
			/**********************************************************/
			function observe(){
				AI.GOLD = scope.getGold();
				AI.TIME_NOW = scope.getCurrentGameTimeInSec();
				AI.CHOOSE = scope.getBuildings({type:"..PICK YOUR HERO", player: AI.me, onlyFinshed: true});
				AI.CENTER = scope.getBuildings({type: AI.BARRACKS, player: AI.me, onlyFinshed: true});
				AI.TOWN = scope.getBuildings({type:".Worker Guild", player: AI.me, onlyFinshed: true})[0];
				AI.ALLY_TOWERS = findTowers(AI.teamNumber);
				AI.ENEMY_TOWERS = findTowers(AI.enemyTeamNumber);
				AI.RUNE_SPOTS = scope.getBuildings({type: AI.RUNE_SPAWNER_NAME, onlyFinshed: true});
				AI.RUNES = scope.getBuildings({type: AI.RUNE_NAME, onlyFinshed: true});
				AI.ALLY_HEROES = findHeroes(AI.teamNumber);
				AI.ENEMY_HEROES = findHeroes(AI.enemyTeamNumber);
				AI.LEADER_HERO = findLeaderHero();
				AI.HERO = findOnlyMyHero();
				AI.ALLY_ARMY = findArmy(AI.teamNumber);
				AI.ENEMY_ARMY = findArmy(AI.enemyTeamNumber);
				AI.MY_ARMY = findOnlyMyArmy();
				AI.ALLY_MOBS = findMobs(AI.teamNumber, AI.MOB_ALLY_NAMES);
				AI.ENEMY_MOBS = findMobs(AI.enemyTeamNumber, AI.MOB_ENEMY_NAMES);
				AI.ALLY_MOB_GROUPS = groupMobs(AI.ALLY_MOBS);
				AI.ENEMY_MOB_GROUPS = groupMobs(AI.ENEMY_MOBS);
				AI.LEVEL = checkLevel();
				AI.HP = compareHpWithPreviousHp();
				AI.RUNE_AVAILABLE = isTimeForRune();
			}
			/************** OBSERVE BUILDINGS *********/
			function findTowers(whichTeamNumber){
				var towerTypes = [".HonorGuard T1", ".FeralGuard T1", ".HonorGuard T2", ".FeralGuard T2", ".HonorGuard T3", ".FeralGuard T3"];
				var allTowers = [];
				for(var i = 0, max = towerTypes.length; i < max; i++){
					allTowers = allTowers.concat(scope.getBuildings({type: towerTypes[i], team : whichTeamNumber, onlyFinshed: true}));
				}
				return allTowers;
			}
			/************** OBSERVE HEROES ************/
			function findHeroes(whichTeamNumber){
				var allHeroes = [];
				for(var i = 0, max = AI.HERO_NAMES.length; i < max; i++){
					allHeroes = allHeroes.concat(scope.getUnits({type : AI.HERO_NAMES[i], team : whichTeamNumber}));
				}
				return allHeroes;
			}
			function findLeaderHero(){
				for(var i = 0, max = AI.ALLY_HEROES.length; i < max; i++){
					var oneHero = AI.ALLY_HEROES[i];
					if(oneHero.getOwnerNumber() == AI.LEADER){
						return oneHero;
					}
				}
			}
			function findOnlyMyHero(){
				for(var i = AI.ALLY_HEROES.length-1; i >= 0; i--){
					var oneHero = AI.ALLY_HEROES[i];
					if(oneHero.getOwnerNumber() == AI.me){
						return AI.ALLY_HEROES.splice(i, 1)[0];
					}
				}
			}
			/************** OBSERVE UNITS *************/
			function findArmy(whichTeamNumber){
				var armyTypes = [".Gyrocraft",".Arbalist",".Berserker",".Cleric",".Catapult",".Golem",".Leyshaper",".Pyroclast",".Knight"];
				var allUnits = [];
				for(var i = 0, max = armyTypes.length; i < max; i++){
					allUnits = allUnits.concat(scope.getUnits({type: armyTypes[i], team : whichTeamNumber}));
				}
				return allUnits;
			}
			function findOnlyMyArmy(){
				var myUnits = [];
				for(var i = AI.ALLY_ARMY.length-1; i >= 0; i--){
					var oneUnit = AI.ALLY_ARMY[i];
					if(oneUnit.getOwnerNumber() == AI.me){
						myUnits.push(AI.ALLY_ARMY.splice(i,1)[0]);
					}
				}
				return myUnits;
			}
			function findMobs(whichTeamNumber, mobNames){
				var allMobs = [];
				for(var i = 0, max = mobNames.length; i < max; i++){
					allMobs = allMobs.concat(scope.getUnits({type: mobNames[i], team: whichTeamNumber}));
				}
				return allMobs;
			}
			function groupMobs(allMobs){
				var groups = [];
				for(var i = 0, max = allMobs.length; i < max; i++){
					var oneMob = allMobs[i];
					var hisGroupIndex = findOrCreateMobGroup(oneMob, groups);
					if(hisGroupIndex >= 0){
						groups[hisGroupIndex].push(oneMob);
					}else{
						groups.push([oneMob]);
					}
				}
				return groups;
			}
			function findOrCreateMobGroup(oneMob, groups){
				for(var i = 0, max = groups.length; i < max; i++){
					var groupLeader = groups[i][0];
					if(unitDistance(oneMob, groupLeader) < 8){
						return i;
					}
				}
				return -1;
			}
			/************** OBSERVE OTHER *************/
			function checkLevel(){
				AI.LEVEL_UP = false;
				if(!AI.HERO){
					return AI.LEVEL;
				}
				var currentLevel = AI.HERO.unit.level;
				if(currentLevel > AI.LEVEL){
					AI.LEVEL_UP = true;
				}
				return currentLevel;
			}
			function compareHpWithPreviousHp(){
				var bonusHp = AI.HERO_INFO.hp_lv * AI.LEVEL;
				if(!AI.HERO){
					return {
						PREVIOUS : 0,
						CURRENT : 0,
						DIFFERENCE : 0,
						BONUS : bonusHp
					};
				}
				var previousHp = AI.HP.CURRENT;
				var currentHp = AI.HERO.getCurrentHP();
				var diffHp = currentHp - currentHp;
				return {
					PREVIOUS : previousHp,
					CURRENT : currentHp,
					DIFFERENCE : diffHp,
					BONUS : bonusHp
				};
			}
			function isTimeForRune(){
				//todo check and measure Rune timers
				return false;
			}
			/**********************************************************/
			/********************** ORIENT ****************************/
			/**********************************************************/
			function orient(){
				AI.STAGE = hasGameStarted();
				AI.LOW_ON_HP = isLowOnHP();
				//my units under enemy tower
				AI.HERO_UNDER_ENEMY_TOWER = isUnderEnemyTower(AI.HERO);
				AI.ARMY_UNDER_ENEMY_TOWER = areUnderEnemyTower(AI.MY_ARMY);
				AI.ENEMY_DISTANCES = sortEnemiesByDistance();
				AI.RANGE = groupUnitsByDistances();
				AI.ENEMY_TO_KITE = checkIfEnemyInKiteRange();
				AI.KITE_LOCATION = findBestKiteLocation();
				AI.ENEMY_TO_ATTACK = checkIfEnemyInAttackRange();
				AI.ENEMY_TO_CHASE = checkIfEnemyInChaseRange();
				AI.ENEMY_CLOSE_TO_ME = findClosestEnemy();
				AI.POSITION_BEHIND_MOBS = findPositionBehindMobs();
				AI.POSITION_TO_ATTACK = findAttackPosition();
			}
			/******************* ORIENT FUNCTIONS *********************/
			function hasGameStarted(){
				if(AI.TIME_NOW <= AI.WAITING_TIME){
					return 'WAIT';
				}
				if(AI.TIME_NOW <= 20){
					return 'BEFORE FIGHT';
				}
				return 'FIGHT';
			}
			function isLowOnHP(){
				//Dead hero will respawn with full HP
				if(!AI.HERO){
					AI.HEALED = true;
					return true;
				}
				var maxHp = AI.HERO_INFO.hp + AI.HP.BONUS;
				var percentHp = Math.round(AI.HP.CURRENT * 100 / maxHp);
				//Was injured - now fully healed up
				if(!AI.HEALED && percentHp > 70){
					AI.HEALED = true;
					return false;
				}
				//Was injured - going to heal up
				if(!AI.HEALED){
					return true;
				}
				//Was full hp - took a lot of damage
				if(AI.HEALED && (AI.HP.CURRENT < 80 || percentHp < 20) ){
					AI.HEALED = false;
					return true;
				}
				//was full hp - has enough hp
				return false;
			}
			function isUnderEnemyTower(oneUnit){
				if(!oneUnit){
					return false;
				}
				for(var i = 0, max = AI.ENEMY_TOWERS.length; i < max; i++){
					var towerDistance = unitDistance(oneUnit, AI.ENEMY_TOWERS[i]);
					if(towerDistance < 6){
						return true;
					}
				}
				return false;
			}
			function areUnderEnemyTower(allUnits){
				if(!allUnits || !allUnits.length){
					return [];
				}
				return allUnits.filter(isUnderEnemyTower);
			}
			function sortEnemiesByDistance(){
				if(!AI.HERO){
					return [];
				}
				var distanceList = [];
				AI.ENEMY_HEROES.forEach(function(oneEnemyHero){
					var hisDistance = unitDistance(AI.HERO, oneEnemyHero);
					distanceList.push({
						distance: hisDistance,
						unit: oneEnemyHero
					});
				});
				distanceList = distanceList.sort(function(firstUnit, secondUnit){
					return firstUnit.distance - secondUnit.distance;
				});
				return distanceList;
			}
			function groupUnitsByDistances(){
				var groups = {
					KITE : [],
					ATTACK : [],
					CHASE : []
				};
				if(!AI.HERO){
					return groups;
				}
				var KITE_DISTANCE = 4;
				var ATTACK_DISTANCE = 7;
				var CHASE_DISTANCE = 10;
				AI.ENEMY_DISTANCES.forEach(function(oneGuy){
					if(oneGuy.distance < KITE_DISTANCE){
						groups.KITE.push(oneGuy);
					}else if(oneGuy.distance < ATTACK_DISTANCE){
						groups.ATTACK.push(oneGuy);
					}else if(oneGuy.distance < CHASE_DISTANCE){
						groups.CHASE.push(oneGuy);
					}
				});
				return groups;
			}
			function checkIfEnemyInKiteRange(){
				if(AI.RANGE.KITE && AI.RANGE.KITE.length){
					return AI.RANGE.KITE;
				}
			}
			/******************* KITE LOGIC ****************************/
			function findBestKiteLocation(){
				if(!AI.ENEMY_TO_KITE || !AI.HERO){
					return;
				}
				try{
					var startTile = {x: Math.round(AI.HERO.getX()), y: Math.round(AI.HERO.getY())};
					var surroundingTiles = makeTilesAround(startTile);
					surroundingTiles = onlyWalkableTiles(surroundingTiles);
					tilesFarFromEnemies(surroundingTiles);
					tilesCloseToAllies(surroundingTiles);
					travelDistanceToTiles(surroundingTiles);
					surroundingTiles = tilesWithinDistance(surroundingTiles, 3);
					surroundingTiles = sortByBestTileToKite(surroundingTiles);
					if(surroundingTiles.length){
						return surroundingTiles[0];
					}
				}catch(Pokemon){
					console.log('Error during findBestKiteLocation:\n'+Pokemon);
				}
			}
			function makeTilesAround(startTile){
				var tiles = [];
				for(var xa = startTile.x - 4; xa <= startTile.x + 4; xa++){
					for(var ya = startTile.y - 4; ya <= startTile.y + 4; ya++){
						tiles.push({x: xa, y: ya, cost: 0, value:0});
					}
				}
				return tiles;
			}
			function onlyWalkableTiles(allTiles){
				return allTiles.filter(function(oneTile){
					return scope.positionIsPathable(oneTile.x, oneTile.y);
				});
			}
			function tilesFarFromEnemies(allTiles){
				for(var i = 0, max = allTiles.length; i < max; i++){
					var oneTile = allTiles[i];
					for(var j = 0, maxJ = AI.ENEMY_DISTANCES.length; j < maxJ; j++){
						oneTile.value += Math.max(6, AI.ENEMY_DISTANCES[j].distance);
					}
				}
			}
			function tilesCloseToAllies(allTiles){
				for(var i = 0, max = allTiles.length; i < max; i++){
					var oneTile = allTiles[i];
					for(var j = 0, maxJ = AI.ALLY_HEROES.length; j < maxJ; j++){
						var oneAlly = AI.ALLY_HEROES[j];
						var distanceToAlly = distance(oneAlly.getX(), oneAlly.getY(), oneTile.x, oneTile.y);
						if(distanceToAlly < 1){
							oneTile.value += -1;
						} else if(distanceToAlly < 4){
							oneTile.value += 1;
						}else if(distanceToAlly < 6){
							oneTile.value += 2;
						}else if(distanceToAlly < 7){
							oneTile.value += 1;
						}else{
							oneTile.value += -1;
						}
					}
				}
			}
			function travelDistanceToTiles(allTiles){
				for(var i = 0, max = allTiles.length; i < max; i++){
					var oneTile = allTiles[i];
					oneTile.cost = distance(AI.HERO.getX(), AI.HERO.getY(), oneTile.x, oneTile.y);
				}
			}
			function tilesWithinDistance(allTiles, maxDistance){
				return allTiles.filter(function(oneTile){
					return oneTile.cost <= maxDistance;
				});
			}
			function sortByBestTileToKite(allTiles){
				return allTiles.sort(function(tileA, tileB){
					if(tileB.value == tileA.value){
						return tileB.cost - tileA.cost;
					}else{
						return tileB.value - tileA.value;
					}
				});
			}
			/******************* ORIENT OTHER *************************/
			function checkIfEnemyInAttackRange(){
				if(AI.RANGE.ATTACK && AI.RANGE.ATTACK.length){
					return AI.RANGE.ATTACK;
				}
			}
			function checkIfEnemyInChaseRange(){
				if(AI.RANGE.CHASE && AI.RANGE.CHASE.length){
					return AI.RANGE.CHASE;
				}
			}
			function findClosestEnemy(){
				if(AI.RANGE.KITE && AI.RANGE.KITE[0]){
					return AI.RANGE.KITE[0];
				}
				if(AI.RANGE.ATTACK && AI.RANGE.ATTACK[0]){
					return AI.RANGE.ATTACK[0];
				}
				if(AI.RANGE.CHASE && AI.RANGE.CHASE[0]){
					return AI.RANGE.CHASE[0];
				}
			}
			function findPositionBehindMobs(){
				var defaultPosition = AI.MAP.MY.NEXUS;
				var laneMobs = AI.ALLY_MOB_GROUPS.filter(function(oneGroup){
					var Y = oneGroup[0].getY();
					return oneGroup.length >= 3 && ((AI.ON_BOT && Y > 50) || (!AI.ON_BOT && Y < 50));
				});
				if(!laneMobs || !laneMobs.length){
					return defaultPosition;
				}
				laneMobs = laneMobs.sort(function(firstGroup, secondGroup){
					var X1 = firstGroup[0].getX();
					var X2 = secondGroup[0].getX();
					return (AI.ON_LEFT) ? X2 - X1 : X1 - X2;
				});
				defaultPosition = scope.getCenterOfUnits(laneMobs[0]);
				defaultPosition.x += (AI.ON_LEFT) ? -2 : 2 ;
				return defaultPosition;
			}
			function findAttackPosition(){
				if(AI.AM_I_TEAM_LEADER && AI.RUNE_AVAILABLE){
					return findClosestRunePosition();
				}
				if(AI.AM_I_TEAM_LEADER){
					return AI.POSITION_BEHIND_MOBS;
				}
				if(AI.LEADER_HERO){
					return {x: AI.LEADER_HERO.getX(), y: AI.LEADER_HERO.getY()};
				}
				return AI.POSITION_BEHIND_MOBS;
			}
			function findClosestRunePosition(){
				//TODO
				return AI.MAP.RUNE.bot;
			}
			/**********************************************************/
			/******************* MAKE ACTIONS *************************/
			/**********************************************************/
			function act(){
				if(AI.STAGE == 'WAIT'){
					return;
				}
				if(AI.STAGE == 'BEFORE FIGHT'){
					chooseCharacter();
                    if(!AI.LEADER_HERO){
                        moveToGate();
                    }else{
                        guardPlayer();
                    }
					return;
				}
				//hero.act();
				//workers - act();
				//army - act();
				if(AI.LOW_ON_HP || AI.HERO_UNDER_ENEMY_TOWER ){
					runToHealUp();
					return;
				}
				attack(AI.POSITION_TO_ATTACK);
				recruit();

				/*
				if(AI.ENEMY_CLOSE_TO_ME){
					//hero.act();
				}
				if(!AI.AM_I_TEAM_LEADER){
					guardPlayer();
				}else{
                    
                }*/
			}
			/******************* LIST OF ACTIONS *****************/
			function chooseCharacter(){
				if(AI.HERO){
					return;
				}
				scope.order(AI.HERO_NAME.replace('.','zz'), AI.CHOOSE);//"Play as "+
			}
			function runToHealUp(){
				if(!AI.HERO){
					return;
				}
				scope.order("Move", [AI.HERO], AI.MAP.MY.HEAL);
			}
			function moveToGate(){
				if(!AI.HERO){
					return;
				}
				scope.order("Move", [AI.HERO], AI.MAP.MY.TOWER1_BOT);
			}
			function guardPlayer(){
				if(!AI.LEADER_HERO || !AI.HERO){
					return;
				}
				try{
					var distanceToPlayer = unitDistance(AI.LEADER_HERO, AI.HERO);
					var playerLocation = {x: AI.LEADER_HERO.getX(), y: AI.LEADER_HERO.getY()};
					if(AI.ENEMY_TO_KITE){
						scope.order("Move", [AI.HERO], AI.KITE_LOCATION);
						scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit},{shift:true});
					} else if(distanceToPlayer > 5){
						scope.order("Move", [AI.HERO], playerLocation);
					}else if(AI.ENEMY_CLOSE_TO_ME){
						scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit});
					}else{
						scope.order("AMove", [AI.HERO], playerLocation);
					}
				}catch(Pokemon){
					console.log(Pokemon);
				}
			}
			function attack(position){
				if(AI.HERO){
					var castedAbility = AI.HERO_INFO.act();
					var heroDistance = distance(AI.HERO.getX(), AI.HERO.getY(), position.x, position.y);
					var heroOrder = (heroDistance > 5) ? "Move" : "AMove";
					scope.order(heroOrder, [AI.HERO], position, {shift:castedAbility});
				}
				if(AI.MY_ARMY && AI.MY_ARMY.length){
					var armyToMove = [];
					var armyToAttack = [];
					for(var i = 0, max = AI.MY_ARMY.length; i < max; i++){
						var oneUnit = AI.MY_ARMY[i];
						var hisDistance = distance(oneUnit.getX(), oneUnit.getY(), position.x, position.y);
						if(hisDistance > 5){
							armyToMove.push(oneUnit);
						}else{
							armyToAttack.push(oneUnit);
						}
					}
					if(armyToMove.length){
						scope.order("Move", armyToMove, position);
					}
					if(armyToAttack.length){
						scope.order("AMove", armyToAttack, position);
					}
				}
			}
			function recruit(){
				if(AI.GOLD >= 115){
					AI.GOLD -= 115;
					scope.order(".Recruit Cleric", AI.CENTER);
				}
			}
			/******** MACRO DECISIONS - WHAT TO DO NEXT ******/
			/********** ABILITIES & UPGRADES *************/
			function useAbilities(){
				if(!AI.HERO){
					return false;
				}
				//var currentAbility;
				//var enemy = AI.ENEMY_CLOSE_TO_ME.unit;
				try{
					/*
					var isClose = (unitDistance(enemy, AI.HERO) < 4);

					currentAbility = AI.ABILITY.Dodge;
					if(AI.IS_DODGE_READY && AI.KITE_LOCATION && isClose){
						castToArea("Dodge", AI.HERO, AI.KITE_LOCATION);
						//scope.order("Dodge", [AI.HERO], AI.KITE_LOCATION);//doesn't work
						currentAbility.lastTime = AI.TIME_NOW;
						scope.order("Attack", [AI.HERO], {unit: enemy}, {shift:true});
						return true;
					}
					currentAbility = AI.ABILITY["Bomb Arrow"];
					if(AI.IS_KABOOM_READY && (AI.IS_KABOOM_MAXED || isClose)){
						scope.order("Bomb Arrow", [AI.HERO], {unit: enemy});
						currentAbility.lastTime = AI.TIME_NOW;
						scope.order("Attack", [AI.HERO], {unit: enemy}, {shift:true});
						return true;
					}
					currentAbility = AI.ABILITY.Vanish;
					var isBoss = (enemy.getTypeName() == "Stray Golem");
					if(canCastAbility(currentAbility) && (isBoss || isClose)){
						scope.order("Vanish", [AI.HERO], {unit: enemy});
						currentAbility.lastTime = AI.TIME_NOW;
						scope.order("Attack", [AI.HERO], {unit: enemy}, {shift:true});
						return true;
					}
					currentAbility = AI.ABILITY["Use Sensor"];
					if(canCastAbility(currentAbility)){
						scope.order("Use Sensor", [AI.HERO]);
						currentAbility.lastTime = AI.TIME_NOW;
						return true;
					}
					if(isClose && AI.ENEMY_TO_KITE){
						scope.order("Move", [AI.HERO], AI.KITE_LOCATION);
						scope.order("Attack", [AI.HERO], {unit: enemy}, {shift:true});
						return true;
					}
					*/
				}catch(Pokemon){
					console.log('Error during casting abilities');
					console.log(Pokemon);
				}
				return false;
			}
			function castToArea(orderName, unit, location){
				var command = scope.getCommandFromCommandName(orderName);
				var targetField = new Field(location.x, location.y, true);
				game.issueOrderToUnits2([unit.unit], command, targetField);
			}
			function canCastAbility(currentAbility){
				if(!AI.HERO){
					return false;
				}
				return currentAbility.learnt && 
					currentAbility.lastTime + currentAbility.cooldown < AI.TIME_NOW &&
					currentAbility.cost < AI.HERO.unit.mana;
			}
			/**********************************************************/
			/******************* MATH / DISTANCE **********************/
			/**********************************************************/
			function unitDistance(a, b){
				return distance(a.getX(), a.getY(), b.getX(), b.getY());
			}
			function distance(x1, y1, x2, y2){
				return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
			}
			return{
				init:init,
				makeMove:makeMove
			};
		})();
		scope.Eruner.init();
	}else{
		scope.Eruner.makeMove();
	}
}catch(Pokemon){
	console.log(Pokemon);
}
