/*
	Map = Heroes n Commanders
	Bot = plays as hero Arlin
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
	var teamName = 'TEAM-' + teamNumber;
	if(!scope['BOT-' + me]){
		scope['BOT-' + me] = (function(){
			var DATA;
			function init() {
				try{
					loadDefaultVariables();
					loadTeamMemory();
					loadBuildings();
					loadTechnologies();
					loadPositions();
					loadRespawns();
					loadSkillTree();
				}catch(Pokemon){
					console.log('Error during init:\n'+Pokemon);
				}
			}
			function makeMove(){
				try{
					observe();
					act();
				}catch(Pokemon){
					console.log('Error during makeMove:\n'+Pokemon);
				}
			}
			/************* LOADING ******************/
			function loadDefaultVariables(){
				DATA = {};
				DATA.HERO_NAME = "Arlin";//hardcoded choice
				DATA.LUCKY_NUMBER = Math.floor(Math.random() * 3) + 10;
				DATA.JUNGLE_TARGET = 'WOLF';
				DATA.LEVEL = 0;
				DATA.GOAL_DURATION = 300;
				DATA.GOAL_START = 0;// - DATA.GOAL_DURATION;
				DATA.HERO_NAMES = ["Arlin", "Zalarc", "Qatar", "Viola", "Poly", "Karnon"];
			}
			function loadTeamMemory(){
				if(!game[teamName]){
					game[teamName] = {goal:'JUNGLE'};
				}
				if(!game[teamName].leader || game[teamName].leader > me){
					game[teamName].leader = me;
				}
				for(var i = 0, max = game.players.length; i < max; i++){
					var onePlayer = game.players[i];
					var playerName = onePlayer.name;
					var hisTeam = onePlayer.team.number;
					if(hisTeam == teamNumber && playerName.indexOf('Computer') < 0){
						game[teamName].leader = onePlayer.number;
						game[teamName].goal = 'PROTECT';
					}
				}
			}
			function loadBuildings(){
				DATA.CHOOSE = scope.getBuildings({type:"Select Character!", player: me, onlyFinshed: true})[0];
				DATA.CENTER = scope.getBuildings({type:"Heroic Center", player: me, onlyFinshed: true})[0];
			}
			function loadTechnologies(){
				DATA.UPGRADES = [
					{ name : "Buy Hero Attack", cost : 110, times : 20 },
					{ name : "Buy Hero Pierce", cost : 180, times : 20 },
					{ name : "Buy Hero Attack Speed", cost : 110, times : 10 },
					{ name : "Buy Hero Scaling", cost : 440, times : 10 },
					{ name : "Buy Hero HP", cost : 140, times : 20 },
					{ name : "Buy Hero Armor", cost : 185, times : 20 },
					{ name : "Buy Hero Regeneration", cost : 300, times : 10 },
					{ name : "Buy Hero Leech", cost : 500, times : 10 },
					{ name : "Buy More Infantry", cost : 100, times : 5 },
					{ name : "Buy More Ranger", cost : 100, times : 5 },
					{ name : "Buy More Cleric", cost : 250, times : 3 },
					{ name : "Buy More Wizard", cost : 250, times : 3 },
					{ name : "Buy More Flyer", cost : 400, times : 3 },
					{ name : "Buy More Mangonel", ost : 1250, times : 1 },
					{ name : "Buy More Titan", cost : 2500, times : 1 },
					{ name : "Buy Hero Mana", cost : 160, times : 20 },
					{ name : "Buy Hero Mana Rate", cost : 160, times : 20 },
					{ name : "Buy Hero Cooldown", cost : 440, times : 10 },
					{ name : "Buy Hero Movespeed", cost : 425, times : 10 },
					{ name : "Buy Hero Income", cost : 800, times : 1 },
					{ name : "Buy Troop Atk", cost : 200, times : 10 },
					{ name : "Buy Troop Pierce", cost : 250, times : 10 },
					{ name : "Buy Troop HP", cost : 200, times : 10 },
					{ name : "Buy Troop Armor", cost : 300, times : 10 },
					{ name : "Buy Troop Atk Speed", cost : 600, times : 5 },
					{ name : "Buy Troop HP Regeneration", cost : 400, times : 5 }
				];
			}
			function loadPositions(){
				DATA.MAP = {};
				DATA.MAP.GATE = (team == 'top') ? {x:14,y:37} : {x:102,y:79};
				DATA.MAP.WOLF = (team == 'top') ? {x:39,y:68} : {x:78,y:48};
				DATA.MAP.SOLDIER = (team == 'top') ? {x:15,y:73} : {x:101,y:42};
				DATA.MAP.ARCHER = (team == 'top') ? {x:61,y:88} : {x:54,y:27};
				DATA.MAP.MAGE = (team == 'top') ? {x:36,y:91} : {x:80,y:22};
				DATA.MAP.PRIEST = (team == 'top') ? {x:9,y:88} : {x:107,y:27};
				DATA.MAP.BOSS = (team == 'top') ? {x:11,y:106} : {x:105,y:10};
			}
			function loadRespawns(){
				DATA.SPAWN = {};
				DATA.SPAWN.WOLF = { cooldown: 90, lastTime: -120};
				DATA.SPAWN.SOLDIER = { cooldown: 90, lastTime: -120};
				DATA.SPAWN.ARCHER = { cooldown: 90, lastTime: -120};
				DATA.SPAWN.MAGE = { cooldown: 180, lastTime: -180};
				DATA.SPAWN.PRIEST = { cooldown: 180, lastTime: -180};
				DATA.SPAWN.BOSS = { cooldown: 300, lastTime: -300};
			}
			function loadSkillTree(){
				DATA.LEARN_UP_SKILLS = [
					"Pistol Whip",
					"Cleave",
					"Pistol Whip",
					"Cleave",
					"Pistol Whip",
					"Cleave",
					"Pistol Whip",
					"Cleave",
					"Pistol Whip",
					"Cleave",
					"Pistol Whip",
					"Cleave"
				];
				DATA.SKILLS = {
					"Pistol Whip" : {cost: 30, cooldown : 4},
					"Bolster Up" : {cost: 75, cooldown : 15},
					"Cleave" : {cost: 55, cooldown : 12}
				};
			}
			/************* OBSERVE ******************/
			function observe(){
				DATA.GOLD = scope.getGold();
				DATA.TIME_NOW = scope.getCurrentGameTimeInSec();
				DATA.CENTER = scope.getBuildings({type:"Heroic Center", player: me, onlyFinshed: true})[0];
				DATA.IS_BARRIER = findBarriers();
				DATA.NOW = whatTimeItIs();
				DATA.AM_I_TEAM_LEADER = amILeader();
				DATA.HERO = findHero();
				DATA.ALLY_HEROES = findAllies();
				DATA.PLAYER = findLeaderHero();
				DATA.ENEMY_HEROES = findEnemyHeroes();
				DATA.JUNGLE_MOBS = findJungleMobs();
				DATA.JUNGLE_POSITION = DATA.MAP[DATA.JUNGLE_TARGET];
				DATA.MOB_NEARBY = isMobNearby();
				DATA.CLOSE_TO_POSITION = isPositionClose();
				DATA.ALLY_CLOSE_TO_POSITION = isAllyPositionClose();
				DATA.JUNGLE_TARGET = nextJungleTarget();
				DATA.JUNGLE_IS_EMPTY = isJungleEmpty();
				DATA.JUNGLE_IS_FULL = isJungleFull();
				DATA.ENEMY_CLOSE_TO_ME = isEnemyCloseToMe();
				DATA.LEVEL_UP = false;
				DATA.LEVEL = checkLevel();
				DATA.GOAL = checkTeamGoal();
			}
			function findBarriers(){
				var barriers = scope.getBuildings({type: "Barrier"});
				return !!barriers.length;
			}
			function whatTimeItIs(){
				var currentTime = scope.getCurrentGameTimeInSec();
				if(currentTime <= DATA.LUCKY_NUMBER){
					return 'WAIT';
				}
				if(DATA.IS_BARRIER){
					return 'BEFORE FIGHT';
				}
				return 'FIGHT';
			}
			function findHero(){
				var fightingUnits = scope.getUnits({type: DATA.HERO_NAME, player: me});
				if(fightingUnits.length){
					return fightingUnits[0];
				}
			}
			function findAllies(){
				var allyHeroes = [];
				DATA.HERO_NAMES = ["Arlin", "Zalarc", "Qatar", "Viola", "Poly", "Karnon"];
				allyHeroes = allyHeroes.concat(scope.getUnits({type: "Arlin", team :teamNumber}));
				allyHeroes = allyHeroes.concat(scope.getUnits({type: "Zalarc", team :teamNumber}));
				allyHeroes = allyHeroes.concat(scope.getUnits({type: "Qatar", team :teamNumber}));
				allyHeroes = allyHeroes.concat(scope.getUnits({type: "Viola", team :teamNumber}));
				allyHeroes = allyHeroes.concat(scope.getUnits({type: "Poly", team :teamNumber}));
				allyHeroes = allyHeroes.concat(scope.getUnits({type: "Karnon", team :teamNumber}));
				allyHeroes = allyHeroes.filter(function(oneUnit){
					return oneUnit.unit.owner.number != me;
				});
				return allyHeroes;
			}
			function findLeaderHero(){
				if(!DATA.ALLY_HEROES || !DATA.ALLY_HEROES.length){
					return;
				}
				if(DATA.AM_I_TEAM_LEADER){
					return;
				}
				var leaderHeroes = DATA.ALLY_HEROES.filter(function(oneAllyHero){
					return oneAllyHero.unit.owner.number == game[teamName].leader;
				});
				if(!leaderHeroes || !leaderHeroes.length){
					return;
				}
				return leaderHeroes[0];
			}
			function findEnemyHeroes(){
				var enemyHeroes = [];
				var enemyTeamNumber = (teamNumber % 2) + 1;
				enemyHeroes = enemyHeroes.concat(scope.getUnits({type: "Arlin", team :enemyTeamNumber}));
				enemyHeroes = enemyHeroes.concat(scope.getUnits({type: "Zalarc", team :enemyTeamNumber}));
				enemyHeroes = enemyHeroes.concat(scope.getUnits({type: "Qatar", team :enemyTeamNumber}));
				enemyHeroes = enemyHeroes.concat(scope.getUnits({type: "Viola", team :enemyTeamNumber}));
				enemyHeroes = enemyHeroes.concat(scope.getUnits({type: "Poly", team :enemyTeamNumber}));
				enemyHeroes = enemyHeroes.concat(scope.getUnits({type: "Karnon", team :enemyTeamNumber}));
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
			function nextJungleTarget(){
				var mobOrder = ['WOLF', 'SOLDIER','ARCHER','MAGE','PRIEST'];//,'BOSS'
				if(DATA.ALLY_CLOSE_TO_POSITION && !DATA.MOB_NEARBY){
					//mark current as completed
					DATA.SPAWN[DATA.JUNGLE_TARGET].lastTime = DATA.TIME_NOW;
					var currentMobIndex = mobOrder.indexOf(DATA.JUNGLE_TARGET);
					//find next available
					for(var i = 1; i <= mobOrder.length; i++){
						var nextMobIndex = (currentMobIndex + i) % mobOrder.length;
						var nextMobName = mobOrder[nextMobIndex];
						var mobSpawn = DATA.SPAWN[nextMobName];
						if(mobSpawn.lastTime + mobSpawn.cooldown < DATA.TIME_NOW){
							console.log('going to next = '+nextMobName);
							return nextMobName;
						}
					}
					console.log('going to default WOLF camp');
					//when in doubt, go to default
					return 'WOLF';
				}
				return DATA.JUNGLE_TARGET;
			}
			function isJungleEmpty(){
				var mobOrder = ['WOLF', 'SOLDIER','ARCHER','MAGE','PRIEST'];
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
			function isMobNearby(){
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
			function isEnemyCloseToMe(){
				if(!DATA.HERO){
					return;
				}
				if(DATA.ENEMY_HEROES && DATA.ENEMY_HEROES.length){
					for(var c = 0, maxC = DATA.ENEMY_HEROES.length; c < maxC; c++){
						var enemyHero = DATA.ENEMY_HEROES[c];
						if(unitDistance(DATA.HERO, enemyHero) < 6){
							return enemyHero;
						}
					}
				}
				if(DATA.JUNGLE_MOBS.BOSS && DATA.JUNGLE_MOBS.BOSS.length){
					for(var b = 0, maxB = DATA.JUNGLE_MOBS.BOSS.length; b < maxB; b++){
						var oneBoss = DATA.JUNGLE_MOBS.BOSS[b];
						if(unitDistance(DATA.HERO, oneBoss) < 2){
							return oneBoss;
						}
					}
				}
				if(DATA.JUNGLE_MOBS.PRIEST && DATA.JUNGLE_MOBS.PRIEST.length){
					for(var a = 0, maxA = DATA.JUNGLE_MOBS.PRIEST.length; a < maxA; a++){
						var onePriest = DATA.JUNGLE_MOBS.PRIEST[a];
						if(unitDistance(DATA.HERO, onePriest) < 2){
							return onePriest;
						}
					}
				}
			}
			function isPositionClose(){
				if(!DATA.HERO){
					return false;
				}
				return distance(DATA.HERO.getX(), DATA.HERO.getY(), DATA.JUNGLE_POSITION.x, DATA.JUNGLE_POSITION.y) < 4;
			}
			function isAllyPositionClose(){
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
			function checkLevel(){
				if(!DATA.HERO){
					return DATA.LEVEL;
				}
				var currentLevel = DATA.HERO.unit.level;
				if(currentLevel > DATA.LEVEL){
					DATA.LEVEL_UP = true;
				}
				return currentLevel;
			}
			function checkTeamGoal(){
				return game[teamName].goal;
			}
			function amILeader(){
				return game[teamName].leader == me;
			}
			/************* ACTING ******************/
			function act(){
				if(DATA.NOW == 'WAIT'){
					return;
				}
				learnAbility();
				if(DATA.NOW == 'BEFORE FIGHT'){
					chooseCharacter();
					moveToGate();
					return;
				}
				if(DATA.GOAL == 'JUNGLE'){
					jungle();
				}
				if(DATA.GOAL == 'PROTECT'){
					guardPlayer();
				}
				useAbilities();
				randomUpgrade();
				decideNextTeamGoal();
			}
			function learnAbility(){
				if(!DATA.HERO || !DATA.LEVEL_UP){
					return;
				}
				var newSkillName = DATA.LEARN_UP_SKILLS[DATA.LEVEL - 1];
				learn(DATA.HERO, newSkillName);
			}
			function learn(unit, ability){
				var command = scope.getCommandFromCommandName(ability);
				unit.unit.learn(command);
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
				scope.order("Move", [DATA.HERO], DATA.MAP.GATE);
			}
			function jungle(){
				if(!DATA.HERO){
					return;
				}
				if(!DATA.CLOSE_TO_POSITION || DATA.HERO.getCurrentOrderName() == "Stop"){
					scope.order("AMove", [DATA.HERO], DATA.JUNGLE_POSITION);
				}
			}
			function guardPlayer(){
				if(!DATA.PLAYER || !DATA.HERO){
					return;
				}
				try{
					var distanceToPlayer = unitDistance(DATA.PLAYER, DATA.HERO);
					var playerLocation = {x: DATA.PLAYER.getX(), y: DATA.PLAYER.getY()};
					if(distanceToPlayer > 10){
						scope.order("Move", [DATA.HERO], playerLocation);
					}else{
						scope.order("AMove", [DATA.HERO], playerLocation);
					}
				}catch(Pokemon){
					console.log(Pokemon);
				}
			}
			function useAbilities(){
				if(!DATA.HERO || !DATA.ENEMY_CLOSE_TO_ME){
					return;
				}
				scope.order("Pistol Whip", [DATA.HERO], {unit: DATA.ENEMY_CLOSE_TO_ME});
				scope.order("Cleave", [DATA.HERO], {unit: DATA.ENEMY_CLOSE_TO_ME});
			}
			function randomUpgrade(){
				if(!DATA.UPGRADES.length || DATA.TIME_NOW < 60){
					return;//everything upgraded
				}
				var rngTechNumber = Math.floor(Math.random() * DATA.UPGRADES.length);
				var rngTech = DATA.UPGRADES[rngTechNumber];
				if(!rngTech || rngTech.cost > DATA.GOLD || !DATA.CENTER){
					return;
				}
				scope.order(rngTech.name, [DATA.CENTER]);
				DATA.GOLD -= rngTech.cost;
				rngTech.times--;
				if(rngTech.times < 1){
					DATA.UPGRADES.splice(rngTechNumber, 1);
				}
			}
			function decideNextTeamGoal(){
				if(!DATA.AM_I_TEAM_LEADER){
					return;
				}
				if(DATA.GOAL == 'PROTECT'){
					return;
				}
				if(DATA.GOAL == 'JUNGLE' && !DATA.JUNGLE_IS_EMPTY){
					return;
				}
				if(DATA.GOAL == 'BOSS' && DATA.SPAWN.BOSS.lastTime + DATA.SPAWN.BOSS.cooldown < DATA.TIME_NOW){
					return;
				}
				if(DATA.GOAL_START + DATA.GOAL_DURATION > DATA.TIME_NOW){
					DATA.GOAL = 'REGROUP';
					DATA.GOAL_START = DATA.TIME_NOW;
					game[teamName].goal = DATA.GOAL;
					console.log('Changing Team goal to '+DATA.GOAL);
					return;
				}
				if(DATA.GOAL == 'REGROUP' && DATA.GOAL_START + DATA.GOAL_DURATION / 2 < DATA.TIME_NOW){
					return;
				}
				var availableGoals = ['JUNGLE', 'BOSS', 'MID', 'INVADE'];
				if(DATA.SPAWN.BOSS.lastTime + DATA.SPAWN.BOSS.cooldown > DATA.TIME_NOW){
					availableGoals.splice(1,1);
				}
				if(!DATA.JUNGLE_IS_FULL){
					availableGoals.splice(0,1);
				}
				var currentGoalIndex = availableGoals.indexOf(DATA.GOAL);
				if(currentGoalIndex >= 0){
					availableGoals.splice(currentGoalIndex,1);
				}
				if(availableGoals.length == 1){
					DATA.GOAL = availableGoals[0];
					DATA.GOAL_START = DATA.TIME_NOW;
					game[teamName].goal = DATA.GOAL;
					console.log('Changing Team goal to '+DATA.GOAL);
					return;
				}
				var rngGoal = Math.floor(Math.random() * availableGoals.length);
				DATA.GOAL = availableGoals[rngGoal];
				if(DATA.GOAL!= 'JUNGLE' && DATA.GOAL != 'BOSS'){
					DATA.GOAL_START = DATA.TIME_NOW;
				}
				game[teamName].goal = DATA.GOAL;
				console.log('Changing Team goal to '+DATA.GOAL);
			}
			/********** MATH MAGIC **********/
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