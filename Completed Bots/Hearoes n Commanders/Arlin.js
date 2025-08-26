/*
	Map = Heroes n Commanders
	Bot = plays as hero Arlin

	Features:
	- always picks Arlin hero
	- follows and protects human player
	- buys shop upgrades at random
	- uses 3 basic abilities (not ultimate yet)
	- clears jungle
	- clears enemy jungle
	- kills boss too
	- protects mid-line in between
	- runs away when low on HP
*/
var scope = scope || null;
try{
	if(!scope){
		console.log('Scope is not initialized');
		return;
	}
	var me = scope.getMyPlayerNumber();
	var team = (me % 2 == 1) ? 'top' : 'bottom';
	var teamNumber = scope.getMyTeamNumber();
	var enemyTeamNumber = (teamNumber % 2) + 1;
	if(!scope['BOT-' + me]){
		scope['BOT-' + me] = (function(){
			var DATA;
			function init() {
				try{
					loadDefaultVariables();
					loadBuildings();
					loadTechnologies();
					loadPositions();
					loadRespawns();
                    loadAbilities();
					loadTeamLeader();
					loadSkillTree();
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
				DATA = {};
				DATA.HERO_NAME = "Arlin";//hardcoded choice
				DATA.LUCKY_NUMBER = Math.floor(Math.random() * 2) + 6;
				DATA.JUNGLE_TARGET = 'WOLF';
				DATA.LEVEL = 0;
				DATA.GOAL_DURATION = 15;
				DATA.GOAL_START = 0;
				DATA.HERO_NAMES = ["Arlin", "Zalarc", "Qatar", "Viola", "Poly", "Karnon"];
				DATA.HEALED = true;
				DATA.MID = {
					heal : (team == 'top') ? 10 : 106,
					base : (team == 'top') ? 32 : 84,
					push : (team == 'top') ? 1 : -1
				};
				DATA.MID.line = DATA.MID.base + DATA.MID.push;
				DATA.HP = {
					PREVIOUS : 0,
					CURRENT : 0,
					DIFFERENCE : 0,
					BONUS : 0
				};
			}
			function loadBuildings(){
				DATA.CHOOSE = scope.getBuildings({type:"Select Character!", player: me, onlyFinshed: true})[0];
				DATA.CENTER = scope.getBuildings({type:"Heroic Center", player: me, onlyFinshed: true})[0];
			}
			function loadTechnologies(){
				DATA.UPGRADES = [
					[
						{ name : "Buy Hero Income", cost : 800, times : 1 }
					],[
						{ name : "Buy Hero Attack Speed", cost : 110, times : 10 },
						{ name : "Buy Hero Movespeed", cost : 425, times : 10 },
						{ name : "Buy Hero HP", cost : 140, times : 20 },
						{ name : "Buy Scouting Sensor", cost : 0, times : 1 }
					],[
						{ name : "Buy Hero Attack", cost : 110, times : 20 },
						{ name : "Buy Hero Pierce", cost : 180, times : 20 },
						{ name : "Buy Hero Scaling", cost : 440, times : 10 },
						{ name : "Buy Hero Armor", cost : 185, times : 20 },
						{ name : "Buy Hero Regeneration", cost : 300, times : 10 },
						{ name : "Buy Hero Leech", cost : 500, times : 10 },
						{ name : "Buy Hero Mana", cost : 160, times : 20 }
					],[
						{ name : "Buy Troop Atk", cost : 200, times : 10 },
						{ name : "Buy Troop Pierce", cost : 250, times : 10 },
						{ name : "Buy Troop HP", cost : 200, times : 10 },
						{ name : "Buy Troop Armor", cost : 300, times : 10 },
						{ name : "Buy Troop Atk Speed", cost : 600, times : 5 },
						{ name : "Buy Troop HP Regeneration", cost : 400, times : 5 }
					],[
						{ name : "Buy Hero Mana Rate", cost : 160, times : 20 },
						{ name : "Buy More Infantry", cost : 100, times : 5 },
						{ name : "Buy More Ranger", cost : 100, times : 5 },
						{ name : "Buy More Cleric", cost : 250, times : 3 },
						{ name : "Buy More Wizard", cost : 250, times : 3 },
						{ name : "Buy More Flyer", cost : 400, times : 3 },
						{ name : "Buy More Mangonel", cost : 1250, times : 1 },
						{ name : "Buy More Titan", cost : 2500, times : 1 }
					],[
						{ name : "Buy Scouting Ward", cost : 400, times : 1 },
						{ name : "Buy Scouting Bird", cost : 800, times : 1 },
						{ name : "Buy Scouting Lookout", cost : 1200, times : 1 },
						{ name : "Buy Scouting HP", cost : 40, times : 10 },
						{ name : "Buy Scouting Cooldown", cost : 40, times : 5 },
						{ name : "Buy Scouting Detection", cost : 300, times : 1 },
						{ name : "Buy Scouting Income", cost : 400, times : 1 },
						{ name : "Buy Hero Cooldown", cost : 440, times : 10 }
					]
				];
			}
			function loadPositions(){
				DATA.MAP = {};
				DATA.MAP.top = {
					HEAL 	: {x:10,y:10},
					GATE 	: {x:14,y:37},
					WOLF 	: {x:39,y:68},
					SOLDIER : {x:15,y:73},
					ARCHER 	: {x:61,y:88},
					MAGE 	: {x:36,y:91},
					PRIEST 	: {x:9 ,y:88},
					BOSS 	: {x:11,y:106},
					GATE2	: {x:38,y:14}
				};
				DATA.MAP.bottom = {
					HEAL 	: {x:106,y:106},
					GATE 	: {x:102,y:79},
					WOLF 	: {x:78 ,y:48},
					SOLDIER : {x:101,y:42},
					ARCHER 	: {x:54 ,y:27},
					MAGE 	: {x:80 ,y:22},
					PRIEST 	: {x:107,y:27},
					BOSS 	: {x:105,y:10},
					GATE2	: {x:78 ,y:102}
				};
			}
			function loadRespawns(){
				DATA.SPAWN = {};
				DATA.SPAWN.WOLF = { cooldown: 90, lastTime: -120};
				DATA.SPAWN.SOLDIER = { cooldown: 90, lastTime: -120};
				DATA.SPAWN.ARCHER = { cooldown: 90, lastTime: -120};
				DATA.SPAWN.MAGE = { cooldown: 100, lastTime: -180};
				DATA.SPAWN.PRIEST = { cooldown: 100, lastTime: -180};
				DATA.SPAWN.BOSS = { cooldown: 300, lastTime: -300};
				DATA.SPAWN.ENEMY = {};
				DATA.SPAWN.ENEMY.WOLF = { cooldown: 90, lastTime: -120};
				DATA.SPAWN.ENEMY.SOLDIER = { cooldown: 90, lastTime: -120};
				DATA.SPAWN.ENEMY.ARCHER = { cooldown: 90, lastTime: -120};
				DATA.SPAWN.ENEMY.MAGE = { cooldown: 100, lastTime: -180};
				DATA.SPAWN.ENEMY.PRIEST = { cooldown: 100, lastTime: -180};
				DATA.SPAWN.ENEMY.BOSS = { cooldown: 300, lastTime: -300};
			}
            function loadAbilities(){
                DATA.ABILITY = {
                    "Pistol Whip" : {cost:30, cooldown: 4, lastTime : 0, learnt : false, level : 0, range:[5,5.5,6,6.5,7,9]},
                    "Cleave" : {cost:55, cooldown: 12, lastTime : 0, learnt : false, level : 0},
                    "Bolster Up" : {cost:75, cooldown: 15, lastTime : 0, learnt : false, level : 0},
                    "Rifting Blade" : {cost:200, cooldown: 90, lastTime : 0, learnt : false, level : 0, range:10},
                    "Use Ward" : {cost:0, cooldown: 60, lastTime : 0, learnt : false, level : 0},
                    "Use Sensor" : {cost:0, cooldown: 30, lastTime : 0, learnt : false, level : 0},
                    "Use Bird" : {cost:0, cooldown: 90, lastTime : 0, learnt : false, level : 0},
                    "Use Lookout" : {cost:0, cooldown: 10, lastTime : 0, learnt : false, level : 0}
                };
            }
			function loadTeamLeader(){
                DATA.LEADER = me;
                var allPlayers = game.players;
                for(var i = 0, max = allPlayers.length; i < max; i++){
					var onePlayer = allPlayers[i];
                    if(onePlayer.team.number != teamNumber){
                        continue;
                    }
					if(onePlayer.name.indexOf('Computer') < 0){
						DATA.LEADER = onePlayer.number;
                        break;
					}
                    if(onePlayer.number > DATA.LEADER){
                        DATA.LEADER = onePlayer.number;
                    }
				}
                DATA.AM_I_TEAM_LEADER = (DATA.LEADER == me);
                DATA.GOAL = DATA.AM_I_TEAM_LEADER ? 'JUNGLE' : 'PROTECT';
			}
			function loadSkillTree(){
				if(DATA.AM_I_TEAM_LEADER){
					DATA.LEARN_UP_SKILLS = [
						"Pistol Whip", "Bolster Up",
						"Pistol Whip", "Bolster Up",
						"Pistol Whip", "Bolster Up",
						"Pistol Whip", "Rifting Blade",
						"Pistol Whip", "Bolster Up",
						"Pistol Whip", "Bolster Up",
						"Bolster Up", "Cleave",
						"Cleave", "Rifting Blade",
						"Cleave", "Cleave",
						"Cleave", "Cleave",
						undefined, undefined,
						undefined, "Rifting Blade"
					];
				}else{
					DATA.LEARN_UP_SKILLS = [
						"Pistol Whip", "Cleave",
						"Pistol Whip", "Cleave",
						"Pistol Whip", "Cleave",
						"Pistol Whip", "Rifting Blade",
						"Pistol Whip", "Cleave",
						"Pistol Whip", "Cleave",
						"Cleave", "Bolster Up",
						"Bolster Up", "Rifting Blade",
						"Bolster Up", "Bolster Up",
						"Bolster Up", "Bolster Up",
						undefined, undefined,
						undefined, "Rifting Blade"
					];
				}
			}
			/**********************************************************/
			/********************* OBSERVE ****************************/
			/**********************************************************/
			function observe(){
				DATA.GOLD = scope.getGold();
				DATA.TIME_NOW = scope.getCurrentGameTimeInSec();
				DATA.CENTER = scope.getBuildings({type:"Heroic Center", player: me, onlyFinshed: true})[0];
				DATA.HERO = findHero();
            	DATA.ALLY_HEROES = findAllyHeroes();
                DATA.JUNGLE_MOBS = findJungleMobs();
				DATA.ENEMY_HEROES = findEnemyHeroes();
				DATA.ANY_BARRIES_ARROUND = findBarriers();
				DATA.LEVEL = checkLevel();
				DATA.HP = compareHpWithPreviousHp();
			}
			/************** OBSERVE UNITS *************/
			function findHero(){
				var fightingUnits = scope.getUnits({type: DATA.HERO_NAME, player: me});
				if(fightingUnits.length){
					return fightingUnits[0];
				}
			}
			function findAllyHeroes() {
				var allyHeroes = [];
				try{
	                DATA.HERO_NAMES.forEach(function(heroName){
	                	var sameHeroes = scope.getUnits({type : heroName, team : teamNumber});
	                	sameHeroes = sameHeroes.filter(function(oneHero){
	                		return oneHero.getOwnerNumber() != me;
	                	});
	                	if(sameHeroes && sameHeroes.length){
	                		allyHeroes = allyHeroes.concat(sameHeroes);
	                	}
	                });
				}catch(Pokemon){
					console.log('problem in finding ally heroes.');
					console.log(Pokemon);
				}
				return allyHeroes;
			}
			function findEnemyHeroes(){
				var enemyHeroes = [];
				var enemyTeamNumber = (teamNumber % 2) + 1;
                DATA.HERO_NAMES.forEach(function(heroName){
                    enemyHeroes = enemyHeroes.concat(scope.getUnits({type : heroName, team : enemyTeamNumber}));
                });
				return enemyHeroes;
			}
			function findJungleMobs(){
				var jungle = {};
				jungle.WOLF = scope.getUnits({type: "Stray Wolf"});
				jungle.SOLDIER = scope.getUnits({type: "Stray Soldier"});
				jungle.ARCHER = scope.getUnits({type: "Stray Archer"});
				jungle.MAGE = scope.getUnits({type: "Stray Mage"});
				jungle.PRIEST = scope.getUnits({type: "Stray Priest"});
				jungle.BOSS = scope.getUnits({type: "Stray Golem"});
				return jungle;
			}
			/************** OBSERVE OTHER *************/
			function findBarriers(){
				var barriers = scope.getBuildings({type: "Barrier"});
				return !!barriers.length;
			}
			function checkLevel(){
				DATA.LEVEL_UP = false;
				if(!DATA.HERO){
					return DATA.LEVEL;
				}
				var currentLevel = DATA.HERO.unit.level;
				if(currentLevel > DATA.LEVEL){
					DATA.LEVEL_UP = true;
				}
				return currentLevel;
			}
			function compareHpWithPreviousHp(){
				var bonusHp = DATA.HP.BONUS;
				if(!DATA.HERO){
					return {
						PREVIOUS : 0,
						CURRENT : 0,
						DIFFERENCE : 0,
						BONUS : bonusHp
					};
				}
				var previousHp = DATA.HP.CURRENT;
				var currentHp = DATA.HERO.getCurrentHP();
				var diffHp = currentHp - currentHp;
				return {
					PREVIOUS : previousHp,
					CURRENT : currentHp,
					DIFFERENCE : diffHp,
					BONUS : bonusHp
				};
			}
			/**********************************************************/
			/********************** ORIENT ****************************/
			/**********************************************************/
			function orient(){
				if(DATA.AM_I_TEAM_LEADER){
					if(DATA.GOAL == 'INVADE'){
						var enemyTeam = (me % 2 == 0) ? 'top' : 'bottom';
						DATA.JUNGLE_POSITION = DATA.MAP[enemyTeam][DATA.JUNGLE_TARGET];
					}else{
						DATA.JUNGLE_POSITION = DATA.MAP[team][DATA.JUNGLE_TARGET];
					}
                    DATA.MOB_NEARBY = isJungleMobNearby();
                    DATA.CLOSE_TO_POSITION = isCloseToJunglePosition();
                    DATA.ALLY_CLOSE_TO_POSITION = isAllyCloseToJunglePosition();
                    if(DATA.GOAL == 'INVADE'){
                    	DATA.JUNGLE_TARGET = nextJungleTarget(DATA.SPAWN.ENEMY);
                    }else{
                    	DATA.JUNGLE_TARGET = nextJungleTarget(DATA.SPAWN);
                    }
                    DATA.JUNGLE_IS_EMPTY = isJungleEmpty();
                    DATA.JUNGLE_IS_FULL = isJungleFull();
                    DATA.ENEMY_JUNGLE_IS_EMPTY = isEnemyJungleEmpty();
                    DATA.ENEMY_JUNGLE_IS_FULL = isEnemyJungleFull();
					DATA.MID.distance = myDistanceFromMid();
					DATA.MID.CLOSE_ENEMIES = enemiesAtMid();
					DATA.NEAR_HEAL = nearHealingSpot();
                }else{
                    DATA.PLAYER = findPlayerHero();
                }
				DATA.STAGE = hasGameStarted();
				DATA.ENEMY_CLOSE_TO_ME = isEnemyCloseToMe();
				DATA.UNDER_ENEMY_TOWER = isUnderEnemyTower();
				DATA.LOW_ON_HP = isLowOnHP();
			}
			/******************* ORIENT IN JUNGLE *********************/
			function isJungleMobNearby(){
				var enemies = DATA.JUNGLE_MOBS[DATA.JUNGLE_TARGET];
				var allyUnits = scope.getUnits({team : teamNumber});
				if(!enemies || !enemies.length || !allyUnits || !allyUnits.length){
					return false;
				}
				for(var i = 0, max = enemies.length; i < max; i++){
					var oneEnemy = enemies[i];
					for(var j = 0, maxJ = allyUnits.length; j < maxJ; j++){
						var oneAlly = allyUnits[j];
						if(unitDistance(oneAlly, oneEnemy) < 7){
							return true;
						}
					}
				}
			}
			function isCloseToJunglePosition(){
				if(!DATA.HERO){
					return false;
				}
				return distance(DATA.HERO.getX(), DATA.HERO.getY(), DATA.JUNGLE_POSITION.x, DATA.JUNGLE_POSITION.y) < 4;
			}
			function isAllyCloseToJunglePosition(){
				var allyUnits = scope.getUnits({team : teamNumber});
				if(!allyUnits || !allyUnits.length){
					return false;
				}
				for(var i = 0, max = allyUnits.length; i < max; i++){
					var hisUnit = allyUnits[i];
					var hisDistance = distance(hisUnit.getX(), hisUnit.getY(), DATA.JUNGLE_POSITION.x, DATA.JUNGLE_POSITION.y);
					if(hisDistance < 4){
						return true;
					}
				}
				return false;
			}
			function nextJungleTarget(spawn){
				var mobOrder = ['WOLF','ARCHER','SOLDIER','MAGE','PRIEST'];
				if(DATA.LEVEL > 7){
					mobOrder.push('BOSS');
				}
				if(DATA.ALLY_CLOSE_TO_POSITION && !DATA.MOB_NEARBY){
					spawn[DATA.JUNGLE_TARGET].lastTime = DATA.TIME_NOW;
					var currentMobIndex = mobOrder.indexOf(DATA.JUNGLE_TARGET);
					for(var i = 1; i <= mobOrder.length; i++){
						var nextMobIndex = (currentMobIndex + i) % mobOrder.length;
						var nextMobName = mobOrder[nextMobIndex];
						var mobSpawn = spawn[nextMobName];
						if(mobSpawn.lastTime + mobSpawn.cooldown < DATA.TIME_NOW){
							return nextMobName;
						}
					}
					return 'WOLF';
				}
				return DATA.JUNGLE_TARGET;
			}
			function isJungleEmpty(){
				var mobOrder = ['WOLF', 'SOLDIER','ARCHER','MAGE','PRIEST'];
				if(DATA.LEVEL > 9){
					mobOrder.push('BOSS');
				}
				for(var i = 0; i < mobOrder.length; i++){
					var currentMob = DATA.SPAWN[mobOrder[i]];
					if((currentMob.lastTime + currentMob.cooldown) < DATA.TIME_NOW){
						return false;
					}
				}
				return true;
			}
			function isJungleFull() {
				var mobOrder = ['WOLF', 'SOLDIER','ARCHER','MAGE','PRIEST'];
				for(var i = 0; i < mobOrder.length; i++){
					var currentMob = DATA.SPAWN[mobOrder[i]];
					if(currentMob.lastTime + currentMob.cooldown > DATA.TIME_NOW){
						return false;
					}
				}
				return true;
			}
			function isEnemyJungleEmpty(){
				var mobOrder = ['WOLF', 'SOLDIER','ARCHER','MAGE','PRIEST'];
				if(DATA.LEVEL > 9){
					mobOrder.push('BOSS');
				}
				for(var i = 0; i < mobOrder.length; i++){
					var currentMob = DATA.SPAWN.ENEMY[mobOrder[i]];
					if((currentMob.lastTime + currentMob.cooldown) < DATA.TIME_NOW){
						return false;
					}
				}
				return true;
			}
			function isEnemyJungleFull() {
				var mobOrder = ['WOLF', 'SOLDIER','ARCHER','MAGE','PRIEST'];
				for(var i = 0; i < mobOrder.length; i++){
					var currentMob = DATA.SPAWN.ENEMY[mobOrder[i]];
					if(currentMob.lastTime + currentMob.cooldown > DATA.TIME_NOW){
						return false;
					}
				}
				return true;
			}
			/******************* ORIENT AT MID-LANE *******************/
			function myDistanceFromMid(){
				if(!DATA.HERO){
					return;
				}
				return lineDistance(DATA.HERO.getX(), DATA.HERO.getY(), DATA.MID.line);
			}
			function enemiesAtMid(){
				var enemyTeamNumber = (teamNumber % 2) + 1;
				var currentDistance;
				var enemies = scope.getUnits({team : enemyTeamNumber});
				for(var i = 0, max = enemies.length; i < max; i++){
					var oneEnemy = enemies[i];
					currentDistance = distance(oneEnemy.getX(), oneEnemy.getY(), DATA.MID.line, DATA.MID.line);
					if(currentDistance < 3){
						return true;
					}
				}
				var enemyTowers = scope.getBuildings({type: "Guardian Tower", team : enemyTeamNumber});
				for(var j = 0, maxJ = enemyTowers.length; j < maxJ; j++){
					var oneTower = enemyTowers[j];
					currentDistance = distance(oneTower.getX(), oneTower.getY(), DATA.MID.line, DATA.MID.line);
					if(currentDistance < 15){
						return true;
					}
				}
				return false;
			}
			function isUnderEnemyTower(){
				if(!DATA.HERO){
					return false;
				}
				var enemyTowers = scope.getBuildings({type: "Guardian Tower", team : enemyTeamNumber});
				enemyTowers = enemyTowers.concat(scope.getBuildings({type: "Forest Tower", team : enemyTeamNumber}));
				for(var i = 0, max = enemyTowers.length; i < max; i++){
					var towerDistance = unitDistance(DATA.HERO, enemyTowers[i]);
					if(towerDistance < 9){
						return true;
					}
				}
				return false;
			}
			/******************* ORIENT OTHER *************************/
			function nearHealingSpot(){
				if(!DATA.HERO){
					return false;
				}
				var distanceToHeal = distance(DATA.HERO.getX(), DATA.HERO.getY(), DATA.MAP[team].HEAL.x, DATA.MAP[team].HEAL.y);
				return distanceToHeal < 2;
			}
			function findPlayerHero(){
				var allyHeroes = [];
                DATA.HERO_NAMES.forEach(function(heroName){
                    allyHeroes = allyHeroes.concat(scope.getUnits({type : heroName, player : DATA.LEADER}));
                });
				if(!allyHeroes.length){
					return;
				}
                return allyHeroes[0];
			}
			function hasGameStarted(){
				if(DATA.TIME_NOW <= DATA.LUCKY_NUMBER){
					return 'WAIT';
				}
				if(DATA.ANY_BARRIES_ARROUND){
					return 'BEFORE FIGHT';
				}
				return 'FIGHT';
			}
			function isEnemyCloseToMe(){
				try{
					if(!DATA.HERO){
						return;
					}
					var closeEnemy = findClosest(DATA.ENEMY_HEROES, 10);
					if(closeEnemy){
						return closeEnemy;
					}
					closeEnemy = findClosest(DATA.JUNGLE_MOBS.BOSS, 10);
					if(closeEnemy){
						return closeEnemy;
					}
					closeEnemy = findClosest(DATA.JUNGLE_MOBS.PRIEST, 10);
					if(closeEnemy){
						return closeEnemy;
					}
					closeEnemy = findClosest(DATA.JUNGLE_MOBS.MAGE, 10);
					if(closeEnemy){
						return closeEnemy;
					}
					var troopRanges = scope.getUnits({type: "Troop Ranger", team: enemyTeamNumber});
					closeEnemy = findClosest(troopRanges, 4.5);
					if(closeEnemy){
						return closeEnemy;
					}
					var stealthWolfs = scope.getUnits({type: "AI Stealth Wolf", team: enemyTeamNumber});
					closeEnemy = findClosest(stealthWolfs, 4);
					if(closeEnemy){
						return closeEnemy;
					}
				}catch(Pokemon){
					console.log('ERROR in isEnemyCloseToMe');
					console.error(Pokemon);
				}
			}
			function findClosest(enemies, minDistance){
				if(!enemies || !enemies.length || !DATA.HERO){
					return;
				}
				var closestEnemy;
				for(var i = 0, max = enemies.length; i < max; i++){
					var oneEnemy = enemies[i];
					var hisDistance = unitDistance(DATA.HERO, oneEnemy);
					if(hisDistance < minDistance){
						closestEnemy = oneEnemy;
						minDistance = hisDistance;
					}
				}
				return closestEnemy;
			}
			function isLowOnHP(){
				//Dead hero will respawn with full HP
				if(!DATA.HERO){
					DATA.HEALED = true;
					return true;
				}
				var maxHp = 923 + Math.round(DATA.LEVEL * 202.5) + DATA.HP.BONUS;
				var percentHp = Math.round(DATA.HP.CURRENT * 100 / maxHp);
				//Was injured - now fully healed up
				if(!DATA.HEALED && percentHp > 80){
					DATA.HEALED = true;
					return false;
				}
				//Was injured - going to heal up
				if(!DATA.HEALED){
					return true;
				}
				//Was full hp - took a lot of damage
				if(DATA.HEALED && (DATA.HP.CURRENT < 250 || percentHp < 20) ){
					DATA.HEALED = false;
					return true;
				}
				//was full hp - has enough hp
				return false;
			}
			/**********************************************************/
			/******************* MAKE ACTIONS *************************/
			/**********************************************************/
			function act(){
				if(DATA.STAGE == 'WAIT'){
					return;
				}
				learnAbility();
				if(DATA.STAGE == 'BEFORE FIGHT'){
					chooseCharacter();
                    if(!DATA.PLAYER){
                        moveToGate();
                    }else{
                        guardPlayer();
                    }
					return;
				}
				buyRandomUpgrade();
				if(DATA.LOW_ON_HP || DATA.UNDER_ENEMY_TOWER || DATA.GOAL == 'BACK'){
					runToHealUp();
					return;
				}
				if(DATA.GOAL == 'GATE'){
					moveToGate();
				}
				if(DATA.GOAL == 'GATE2'){
					moveTo2ndGate();
				}
				if(DATA.GOAL == 'JUNGLE' || DATA.GOAL == 'INVADE'){
					jungle();
				}
				if(DATA.GOAL == 'MID'){
					decideNextMidLocation();
					mid();
				}
				if(DATA.GOAL == 'PROTECT'){
					guardPlayer();
				}else{
                    decideNextTeamGoal();
                }
				useAbilities();
			}
			/******************* LIST OF ACTIONS *****************/
			function learnAbility(){
				if(!DATA.HERO || !DATA.LEVEL_UP || DATA.LEVEL >= DATA.LEARN_UP_SKILLS.length){
					return;
				}
				var newSkillName = DATA.LEARN_UP_SKILLS[DATA.LEVEL - 1];
				if(!newSkillName){
					return;
				}
				learn(DATA.HERO, newSkillName);
                DATA.ABILITY[newSkillName].learnt = true;
                DATA.ABILITY[newSkillName].level++;
			}
			function learn(unit, ability){
				var command = scope.getCommandFromCommandName(ability);
				unit.unit.learn(command);//workaround for abilities that require target
			}
			function chooseCharacter(){
				if(DATA.HERO){
					return;
				}
				scope.order("Play as "+DATA.HERO_NAME, [DATA.CHOOSE]);
			}
			function moveToGate(){
				if(!DATA.HERO){
					return;
				}
				scope.order("Move", [DATA.HERO], DATA.MAP[team].GATE);
			}
			function moveTo2ndGate(){
				if(!DATA.HERO){
					return;
				}
				scope.order("Move", [DATA.HERO], DATA.MAP[team].GATE2);
			}
			function runToHealUp(){
				if(!DATA.HERO){
					return;
				}
				scope.order("Move", [DATA.HERO], DATA.MAP[team].HEAL);
			}
			function guardPlayer(){
				if(!DATA.PLAYER || !DATA.HERO){
					return;
				}
				try{
					var distanceToPlayer = unitDistance(DATA.PLAYER, DATA.HERO);
					var playerLocation = {x: DATA.PLAYER.getX(), y: DATA.PLAYER.getY()};
					if(distanceToPlayer > 3){
						scope.order("Move", [DATA.HERO], playerLocation);
					}else if(DATA.ENEMY_CLOSE_TO_ME && DATA.ENEMY_CLOSE_TO_ME.getTypeName()!="Troop Ranger"){
						scope.order("Attack", [DATA.HERO], {unit: DATA.ENEMY_CLOSE_TO_ME});
					}else{
						scope.order("AMove", [DATA.HERO], playerLocation);
					}
				}catch(Pokemon){
					console.log(Pokemon);
				}
			}
			function jungle(){
				if(!DATA.HERO){
					return;
				}
				if(!DATA.CLOSE_TO_POSITION || DATA.HERO.getCurrentOrderName() == "Stop"){
					scope.order("AMove", [DATA.HERO], DATA.JUNGLE_POSITION);
				}
			}
			function mid(){
				if(!DATA.HERO){
					return;
				}
				var side = (Math.random() > 0.5) ? 4 : -4;
				var midLocation = {x: DATA.MID.line + side, y: DATA.MID.line - side};
				if(DATA.MID.distance > 2){
					scope.order("Move", [DATA.HERO], midLocation);
				} else{// if(DATA.MID.distance > 1){
					scope.order("AMove", [DATA.HERO], midLocation);
				}// else{
				//	scope.order("Hold Position", [DATA.HERO]);
				//}
			}
			function decideNextMidLocation(){
				if(DATA.MID.CLOSE_ENEMIES){
					DATA.MID.line -= DATA.MID.push;
				}else{
					DATA.MID.line += DATA.MID.push;
				}
			}
			/******** MACRO DECISIONS - WHAT TO DO NEXT ******/
			function decideNextTeamGoal(){
				if(!DATA.AM_I_TEAM_LEADER){
                    console.log('NON-LEADER IS DECIDING ABOUT NEXT TEAM GOAL!!!');
					return;
				}
				if(!DATA.GOAL){
					console.log('GOAL IS MISSING!');
				}
				// Hardcoded macro logic:
				// GATE → JUNGLE → MID
				// GATE2 → INVADE → MID OR HEAL
				// HEAL → MID → GATE OR GATE2
				switch(DATA.GOAL){
					case 'GATE':
						alreatyAt1stGate();
						break;
					case 'JUNGLE':
						alreadyJungling();
						break;
					case 'MID':
						alreadyAtMidLane();
						break;
					case 'GATE2':
						alreadyAt2ndGate();
						break;
					case 'INVADE':
						alreadyInvading();
						break;
					case 'HEAL':
						alreadyHealed();
						break;
				}
			}
			function alreatyAt1stGate(){
				var enoughTime = (DATA.GOAL_START + DATA.GOAL_DURATION < DATA.TIME_NOW);
				if(enoughTime){
					DATA.GOAL = 'JUNGLE';
					DATA.JUNGLE_TARGET = 'WOLF';
				}
			}
			function alreadyJungling(){
				if(DATA.JUNGLE_IS_EMPTY){
					DATA.GOAL = 'MID';
					DATA.GOAL_START = DATA.TIME_NOW;
					DATA.MID.line = DATA.MID.base + DATA.MID.push;
				}
			}
			function alreadyAtMidLane(){
				var enoughTime = (DATA.GOAL_START + 3 * DATA.GOAL_DURATION < DATA.TIME_NOW);
				if(!enoughTime){
					return;
				}
				if(DATA.JUNGLE_IS_FULL){
					DATA.GOAL = 'GATE';
					DATA.GOAL_START = DATA.TIME_NOW;
					return;
				}
				if(DATA.ENEMY_JUNGLE_IS_FULL){
					DATA.GOAL = 'GATE2';
					DATA.GOAL_START = DATA.TIME_NOW;
					return;
				}
			}
			function alreadyAt2ndGate(){
				var enoughTime = (DATA.GOAL_START + DATA.GOAL_DURATION < DATA.TIME_NOW);
				if(enoughTime){
					DATA.GOAL = 'INVADE';
					DATA.JUNGLE_TARGET = 'WOLF';
				}
			}
			function alreadyInvading(){
				if(DATA.ENEMY_JUNGLE_IS_EMPTY){
					DATA.GOAL = 'MID';
					DATA.GOAL_START = DATA.TIME_NOW;
					DATA.MID.line = DATA.MID.base + DATA.MID.push;
					return;
				}
				if(DATA.ALLY_HEROES.length < 2){
					DATA.GOAL = 'HEAL';
				}
			}
			function alreadyHealed(){
				if(DATA.NEAR_HEAL){
					DATA.GOAL = 'MID';
					DATA.GOAL_START = DATA.TIME_NOW;
					DATA.MID.line = DATA.MID.base + DATA.MID.push;
				}
			}
			/********** ABILITIES & UPGRADES *************/
			function useAbilities(){
				if(!DATA.HERO){
					return false;
				}
				var currentAbility;
				if(!DATA.ENEMY_CLOSE_TO_ME){
					currentAbility = DATA.ABILITY["Use Sensor"];
					if(canCastAbility(currentAbility)){
						scope.order("Use Sensor", [DATA.HERO]);
						currentAbility.lastTime = DATA.TIME_NOW;
						return true;
					}
					return false;
				}
				try{
					var isTroop = (DATA.ENEMY_CLOSE_TO_ME.getTypeName()=="Troop Ranger");
					currentAbility = DATA.ABILITY["Pistol Whip"];
					if(canCastAbility(currentAbility) && !isTroop){
						var pistolRange = currentAbility.range[currentAbility.level-1];
						var isCloseToPistol = (unitDistance(DATA.ENEMY_CLOSE_TO_ME, DATA.HERO) < pistolRange);
						if(isCloseToPistol){
							scope.order("Pistol Whip", [DATA.HERO], {unit: DATA.ENEMY_CLOSE_TO_ME});
							scope.order("Attack", [DATA.HERO], {unit: DATA.ENEMY_CLOSE_TO_ME},{shift:true});
							currentAbility.lastTime = DATA.TIME_NOW;
							return true;
						}
					}
					var isClose = (unitDistance(DATA.ENEMY_CLOSE_TO_ME, DATA.HERO) < 4);
					currentAbility = DATA.ABILITY.Cleave;
					if(canCastAbility(currentAbility) && isClose){
						scope.order("Cleave", [DATA.HERO], {unit: DATA.ENEMY_CLOSE_TO_ME});
						currentAbility.lastTime = DATA.TIME_NOW;
						return true;
					}
					currentAbility = DATA.ABILITY["Bolster Up"];
					if(canCastAbility(currentAbility) && isClose){
						scope.order("Bolster Up", [DATA.HERO]);
						currentAbility.lastTime = DATA.TIME_NOW;
						return true;
					}
					currentAbility = DATA.ABILITY["Rifting Blade"];
					var isBoss = (DATA.ENEMY_CLOSE_TO_ME.getTypeName() == "Stray Golem");
					if(canCastAbility(currentAbility) && isBoss){
						scope.order("Rifting Blade", [DATA.HERO], {unit: DATA.ENEMY_CLOSE_TO_ME});
						currentAbility.lastTime = DATA.TIME_NOW;
						return true;
					}
					currentAbility = DATA.ABILITY["Use Sensor"];
					if(canCastAbility(currentAbility)){
						scope.order("Use Sensor", [DATA.HERO]);
						currentAbility.lastTime = DATA.TIME_NOW;
						return true;
					}
				}catch(Pokemon){
					console.log('Error during casting abilities');
				}
				return false;
			}
			function canCastAbility(currentAbility){
				return currentAbility.learnt && 
					currentAbility.lastTime + currentAbility.cooldown < DATA.TIME_NOW &&
					currentAbility.cost < DATA.HERO.unit.mana;
			}
			function buyRandomUpgrade(){
				if(!DATA.UPGRADES || !DATA.UPGRADES.length || !DATA.UPGRADES[0].length || DATA.TIME_NOW < 60){
					return;//everything upgraded OR cannot upgrade yet
				}
				try{
					var rngTechNumber = Math.floor(Math.random() * DATA.UPGRADES[0].length);
					var rngTech = DATA.UPGRADES[0][rngTechNumber];
					if(!rngTech || rngTech.cost > DATA.GOLD || !DATA.CENTER){
						return;
					}
					scope.order(rngTech.name, [DATA.CENTER]);
					DATA.GOLD -= rngTech.cost;
					rngTech.times--;
					if(rngTech.name == "Buy Hero HP"){
						DATA.HP.BONUS += 100;
					}
					if(rngTech.name == "Buy Scouting Sensor"){
						DATA.ABILITY["Use Sensor"].learnt = true;
						DATA.ABILITY["Use Sensor"].level = 1;
					}
					DATA.UPGRADES[0][rngTechNumber] = rngTech;
					if(rngTech.times < 1){
						DATA.UPGRADES[0].splice(rngTechNumber, 1);
					}
					if(!DATA.UPGRADES[0].length){
						DATA.UPGRADES.splice(0, 1);
					}
				}catch(Pokemon){
					console.log('Error during buying upgrades');
					console.log(Pokemon);
				}
			}
			/**********************************************************/
			/******************* MATH / DISTANCE **********************/
			/**********************************************************/
			function lineDistance(a, b, l){
				return Math.abs((a + b) / 2 - l);
			}
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
		scope['BOT-' + me].init();
	}else{
		scope['BOT-' + me].makeMove();
	}
}catch(Pokemon){
	console.log(Pokemon);
}
