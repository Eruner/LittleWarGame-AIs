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
	if(!scope['BOT-' + me]){
		scope['BOT-' + me] = (function(){
			var DATA;
			function init() {
				try{
					DATA = {};
					DATA.HERO_NAME = "Arlin";//hardcoded choice
					DATA.LUCKY_NUMBER = Math.floor(Math.random() * 10) + 5;
					DATA.JUNGLE_TARGET = 'WOLF';
					loadBuildings();
					loadTechnologies();
					loadPositions();
					loadRespawns();
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
				DATA.SPAWN.WOLF = { cooldown: 120, lastTime: -120};
				DATA.SPAWN.SOLDIER = { cooldown: 120, lastTime: -120};
				DATA.SPAWN.ARCHER = { cooldown: 120, lastTime: -120};
				DATA.SPAWN.MAGE = { cooldown: 180, lastTime: -180};
				DATA.SPAWN.PRIEST = { cooldown: 180, lastTime: -180};
				DATA.SPAWN.BOSS = { cooldown: 300, lastTime: -300};
			}
			/************* OBSERVE ******************/
			function observe(){
				DATA.IS_BARRIER = findBarriers();
				DATA.NOW = whatTimeItIs();
				DATA.HERO = findHero();
				DATA.JUNGLE_POSITION = DATA.MAP[DATA.JUNGLE_TARGET];
				DATA.ENEMY_NEARBY = isEnemyNearby();
				DATA.CLOSE_TO_POSITION = isPositionClose();
				DATA.JUNGLE_TARGET = nextJungleTarget();
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
			function nextJungleTarget(){
				return 'WOLF';
				//TODO = am I near target? and is target dead? then NEXT
			}
			function isEnemyNearby(){
				var enemies = scope.getUnits();
				if(!DATA.HERO || !enemies || !enemies.length){
					return false;
				}
				var isClose;
				for(var i = 0, max = enemies.length; i < max; i++){
					var oneEnemy = enemies[i];
					if(unitDistance(DATA.HERO, oneEnemy) < 5){
						console.log(oneEnemy.getTypeName());
						console.log('Enemy is close!');
						isClose = true;
					}
				}
				return isClose;
			}
			function isPositionClose(){
				if(!DATA.HERO){
					return false;
				}
				return distance(DATA.HERO.getX(), DATA.HERO.getY(), DATA.JUNGLE_POSITION.x, DATA.JUNGLE_POSITION.y) < 6;
			}
			/************* ACTING ******************/
			function act(){
				if(DATA.NOW == 'WAIT'){
					return;
				}
				if(DATA.NOW == 'BEFORE FIGHT'){
					chooseCharacter();
					moveToGate();
					return;
				}
				jungle();
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
				scope.order("AMove", [DATA.HERO], DATA.JUNGLE_POSITION);
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