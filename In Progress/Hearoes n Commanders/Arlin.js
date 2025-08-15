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
					loadSkillTree();
                    loadAbilities();
					loadTeamLeader();
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
				DATA.GOAL_START = 0;// - DATA.GOAL_DURATION;
				DATA.HERO_NAMES = ["Arlin", "Zalarc", "Qatar", "Viola", "Poly", "Karnon"];
				DATA.HEALED = true;
				DATA.MID = {
					heal : (team == 'top') ? 10 : 106,
					base : (team == 'top') ? 32 : 84,
					push : (team == 'top') ? 1 : -1
				};
				DATA.MID.line = DATA.MID.base + DATA.MID.push;
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
				DATA.MAP.top = {
					HEAL 	: {x:10,y:10},
					GATE 	: {x:14,y:37},
					WOLF 	: {x:39,y:68},
					SOLDIER : {x:15,y:73},
					ARCHER 	: {x:61,y:88},
					MAGE 	: {x:36,y:91},
					PRIEST 	: {x:9 ,y:88},
					BOSS 	: {x:11,y:106}
				};
				DATA.MAP.bottom = {
					HEAL 	: {x:106,y:106},
					GATE 	: {x:102,y:79},
					WOLF 	: {x:78 ,y:48},
					SOLDIER : {x:101,y:42},
					ARCHER 	: {x:54 ,y:27},
					MAGE 	: {x:80 ,y:22},
					PRIEST 	: {x:107,y:27},
					BOSS 	: {x:105,y:10}
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
					"Cleave",
					"Bolster Up",
					"Bolster Up",
					"Bolster Up",
					"Bolster Up",
					"Rifting Blade"
				];
			}
            function loadAbilities(){
                DATA.ABILITY = {
                    "Pistol Whip" : {cost:30, cooldown: 4, lastTime : 0, learnt : false},
                    "Cleave" : {cost:55, cooldown: 12, lastTime : 0, learnt : false},
                    "Bolster Up" : {cost:75, cooldown: 15, lastTime : 0, learnt : false},
                    "Rifting Blade" : {cost:200, cooldown: 90, lastTime : 0, learnt : false}
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
			/**********************************************************/
			/********************* OBSERVE ****************************/
			/**********************************************************/
			function observe(){
				DATA.GOLD = scope.getGold();
				DATA.TIME_NOW = scope.getCurrentGameTimeInSec();
				DATA.CENTER = scope.getBuildings({type:"Heroic Center", player: me, onlyFinshed: true})[0];
				DATA.IS_BARRIER = findBarriers();
				DATA.STAGE = whatStageItIs();
				DATA.HERO = findHero();
                DATA.JUNGLE_MOBS = findJungleMobs();
                if(DATA.AM_I_TEAM_LEADER){
					if(DATA.GOAL == 'INVADE'){
						var enemyTeam = (me % 2 == 0) ? 'top' : 'bottom';
						DATA.JUNGLE_POSITION = DATA.MAP[enemyTeam][DATA.JUNGLE_TARGET];
					}else{
						DATA.JUNGLE_POSITION = DATA.MAP[team][DATA.JUNGLE_TARGET];
					}
                    DATA.JUNGLE_POSITION = DATA.MAP[team][DATA.JUNGLE_TARGET];
                    DATA.MOB_NEARBY = isMobNearby();
                    DATA.CLOSE_TO_POSITION = isPositionClose();
                    DATA.ALLY_CLOSE_TO_POSITION = isAllyPositionClose();
                    DATA.JUNGLE_TARGET = nextJungleTarget();
                    DATA.JUNGLE_IS_EMPTY = isJungleEmpty();
                    DATA.JUNGLE_IS_FULL = isJungleFull();
					DATA.MID.distance = myDistanceFromMid();
					DATA.MID.CLOSE_ENEMIES = enemiesAtMid();
                }else{
                    DATA.PLAYER = findPlayerHero();
                }
				DATA.ENEMY_HEROES = findEnemyHeroes();
				DATA.ENEMY_CLOSE_TO_ME = isEnemyCloseToMe();
				DATA.UNDER_ENEMY_TOWER = isUnderEnemyTower();
				DATA.LEVEL_UP = false;
				DATA.LEVEL = checkLevel();
				DATA.LOW_HP = isLowHP();
			}
			function findBarriers(){
				var barriers = scope.getBuildings({type: "Barrier"});
				return !!barriers.length;
			}
			function whatStageItIs(){
				if(DATA.TIME_NOW <= DATA.LUCKY_NUMBER){
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
			function nextJungleTarget(){
				var mobOrder = ['WOLF','ARCHER','SOLDIER','MAGE','PRIEST'];//BOSS
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
							//console.log('going to next = '+nextMobName);
							return nextMobName;
						}
					}
					//console.log('going to default WOLF camp');
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
			function isEnemyCloseToMe(){
				try{
					if(!DATA.HERO){
						return;
					}
					var closeEnemy = findClosest(DATA.ENEMY_HEROES, 7);
					if(closeEnemy){
						return closeEnemy;
					}
					closeEnemy = findClosest(DATA.JUNGLE_MOBS.BOSS, 7);
					if(closeEnemy){
						return closeEnemy;
					}
					closeEnemy = findClosest(DATA.JUNGLE_MOBS.PRIEST, 7);
					if(closeEnemy){
						return closeEnemy;
					}
					closeEnemy = findClosest(DATA.JUNGLE_MOBS.MAGE, 7);
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
			function isLowHP(){
				//Dead hero will respawn with full HP
				if(!DATA.HERO){
					DATA.HEALED = true;
					return true;
				}
				var currentHp = DATA.HERO.getCurrentHP();
				var maxHp = 923 + Math.round(DATA.LEVEL * 202.5);
				var percentHp = Math.round(currentHp * 100 / maxHp);
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
				if(DATA.HEALED && (currentHp < 250 || percentHp < 20) ){
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
				randomUpgrade();
				if(DATA.LOW_HP || DATA.UNDER_ENEMY_TOWER || DATA.GOAL == 'BACK'){
					runToHealUp();
					return;
				}
				if(DATA.GOAL == 'GATE'){
					moveToGate();
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
			function learnAbility(){
				if(!DATA.HERO || !DATA.LEVEL_UP){
					return;
				}
				var newSkillName = DATA.LEARN_UP_SKILLS[DATA.LEVEL - 1];
				learn(DATA.HERO, newSkillName);
                DATA.ABILITY[newSkillName].learnt = true;
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
				scope.order("Move", [DATA.HERO], DATA.MAP[team].GATE);
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
			function decideNextTeamGoal(){
				if(!DATA.AM_I_TEAM_LEADER){
                    console.log('NON-LEADER IS DECIDING ABOUT NEXT TEAM GOAL!!!');
					return;
				}
				if(!DATA.GOAL){
					console.log('GOAL IS MISSING!');
				}
				switch(DATA.GOAL){
					case 'JUNGLE':
						afterJungle();
						break;
					case 'MID':
						afterMid();
						break;
					case 'GATE':
						afterGate();
						break;
					case 'BACK':
						afterRetreat();
						break;
					case 'BOSS':
						afterBoss();
						break;
					case 'HEAL':
						afterHeal();
						break;
				}
			}
			function afterJungle(){
				if(DATA.JUNGLE_IS_EMPTY){
					DATA.GOAL = 'MID';
					DATA.GOAL_START = DATA.TIME_NOW;
					DATA.MID.line = DATA.MID.base + DATA.MID.push;
				}//else continue jungling
			}
			function afterMid(){
				if(DATA.JUNGLE_IS_FULL){
					DATA.GOAL = 'GATE';
					DATA.GOAL_START = DATA.TIME_NOW;
				}
			}
			function afterGate(){
				var enoughTime = (DATA.GOAL_START + DATA.GOAL_DURATION < DATA.TIME_NOW);
				if(enoughTime){
					DATA.GOAL = 'JUNGLE';
					DATA.JUNGLE_TARGET = 'WOLF';
				}

			}
			function afterRetreat(){
				var enoughTime = (DATA.GOAL_START + DATA.GOAL_DURATION < DATA.TIME_NOW);
				if(enoughTime){
					DATA.GOAL = 'JUNGLE';
					DATA.JUNGLE_TARGET = 'WOLF';
				}
			}
			function afterBoss(){
				if(DATA.SPAWN.BOSS.lastTime + DATA.SPAWN.BOSS.cooldown < DATA.TIME_NOW){
                    console.log('GOAL = Continue to boss.');
					return;
				}else{
					DATA.GOAL = 'HEAL';
				}
			}
			function afterHeal(){

			}

				/*
				var availableGoals = ['JUNGLE', 'BOSS', 'MID', 'INVADE'];
				if(DATA.SPAWN.BOSS.lastTime + DATA.SPAWN.BOSS.cooldown > DATA.TIME_NOW){
                    console.log('Boss not ready');
					availableGoals.splice(1,1);
				}
				if(!DATA.JUNGLE_IS_FULL){
                    console.log('Jungle not full');
					availableGoals.splice(0,1);
				}
				var currentGoalIndex = availableGoals.indexOf(DATA.GOAL);
				if(currentGoalIndex >= 0){
                    console.log('Changing from '+DATA.GOAL);
					availableGoals.splice(currentGoalIndex,1);
				}
				if(availableGoals.length == 1){
					DATA.GOAL = availableGoals[0];
					DATA.GOAL_START = DATA.TIME_NOW;
					console.log('Only one goal to choose = '+DATA.GOAL);
					return;
				}
				var rngGoal = Math.floor(Math.random() * availableGoals.length);
				DATA.GOAL = availableGoals[rngGoal];
				if(DATA.GOAL!= 'JUNGLE' && DATA.GOAL != 'BOSS'){
					DATA.GOAL_START = DATA.TIME_NOW;
                    console.log('Goal starts at '+DATA.GOAL_START);
				}
				console.log('Changing Team goal to '+DATA.GOAL);*/
			function useAbilities(){
				if(!DATA.HERO || !DATA.ENEMY_CLOSE_TO_ME){
					return false;
				}
				try{
					var isTroop = (DATA.ENEMY_CLOSE_TO_ME.getTypeName()=="Troop Ranger");
					var currentAbility = DATA.ABILITY["Pistol Whip"];
					if(currentAbility.learnt && currentAbility.lastTime + currentAbility.cooldown < DATA.TIME_NOW && !isTroop){
						scope.order("Pistol Whip", [DATA.HERO], {unit: DATA.ENEMY_CLOSE_TO_ME});
						scope.order("Attack", [DATA.HERO], {unit: DATA.ENEMY_CLOSE_TO_ME},{shift:true});
						currentAbility.lastTime = DATA.TIME_NOW;
						return true;
					}
					var isClose = (unitDistance(DATA.ENEMY_CLOSE_TO_ME, DATA.HERO) < 4);
					currentAbility = DATA.ABILITY.Cleave;
					if(currentAbility.learnt && currentAbility.lastTime + currentAbility.cooldown < DATA.TIME_NOW && isClose){
						scope.order("Cleave", [DATA.HERO], {unit: DATA.ENEMY_CLOSE_TO_ME});
						currentAbility.lastTime = DATA.TIME_NOW;
						return true;
					}
				}catch(Pokemon){
					console.log('Error during casting abilities');
				}
				return false;
			}
			function randomUpgrade(){
				if(!DATA.UPGRADES || !DATA.UPGRADES.length || DATA.TIME_NOW < 60){
					return;//everything upgraded OR cannot upgrade yet
				}
				try{
					var rngTechNumber = Math.floor(Math.random() * DATA.UPGRADES.length);
					var rngTech = DATA.UPGRADES[rngTechNumber];
					if(!rngTech || rngTech.cost > DATA.GOLD || !DATA.CENTER){
						return;
					}
					scope.order(rngTech.name, [DATA.CENTER]);
					DATA.GOLD -= rngTech.cost;
					rngTech.times--;
					DATA.UPGRADES[rngTechNumber] = rngTech;
					if(rngTech.times < 1){
						DATA.UPGRADES.splice(rngTechNumber, 1);
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
