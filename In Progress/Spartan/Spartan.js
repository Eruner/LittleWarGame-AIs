var scope = scope || null;
try{
	if(!scope){
		console.log('Scope is not initialized');
		return;
	}
	var me = scope.getMyPlayerNumber();
	var enemy = 5;
	if(!scope['BOT-' + me]){
		scope['BOT-' + me] = (function(){
			var DATA;
			function init() {
				try{
					DATA = {};
					resetCooldowns();
					DATA.JAVELIN_DISTANCE = 10;
				}catch(Pokemon){
					console.log('Error during init:\n'+Pokemon);
				}
			}
			function resetCooldowns(){
				DATA.TIME_OF_PUSH = -21;
				DATA.TIME_OF_RAGE = -21;
				DATA.TIME_OF_JAVELIN = -21;
				DATA.TIME_OF_STUN = -21;
			}
			function makeMove(){
				try{
					loadEnviroment();
					upgradeInForge();
					var stage = orientInEnviroment();
					switch(stage){
					case 'give up':
						break;
					case 'need revive':
						revive();
						break;
					case 'need healing':
						fallBackAndHeal();
						pushEnemies();
						break;
					case 'endure':
						endure();
						break;
					case 'too far':
						attackMove();
						throwJavelin();
						break;
					case 'rage is ready':
						attackMove();
						activateRage();
						throwJavelin();
						stunBoss();
						break;
					}
				}catch(Pokemon){
					console.log('Error during makeMove:\n'+Pokemon);
				}
			}
			/************* LOADING ******************/
			function loadEnviroment(){
				try{
					DATA.WARRIOR = findWarrior();//AMove Attack Hold Position Move Moveto Stop
					// Endure Rage Run Push Stun "Throw the javelin"
					DATA.RESPAWN = findRespawn();//respawn command = spartanhero
					DATA.HEALS = findHealings();
					DATA.FORGE = findUpgrades();//upgrade command = spartanupgradea
					DATA.NOW = Math.round(scope.getCurrentGameTimeInSec());
				}catch(Pokemon){
					console.log('Error during loadEnviroment:\n'+Pokemon);
				}
			}
			function findWarrior(){
				var fightingUnits = scope.getUnits({type: "Spartan", player: me});
				if(fightingUnits.length){
					return fightingUnits[0];
				}
			}
			function findRespawn(){
				var allRespawns = scope.getBuildings({type:"house", player: me, onlyFinshed: true});
				if(allRespawns.length){
					return allRespawns[0];
				}
			}
			function findHealings(){
				var wards = [
					{x: 10, y: 14},
					{x: 10, y: 22},
					{x: 10, y: 32}
				]; // they are in same spot
				return wards;
			}
			function findUpgrades(){
				var allForges = scope.getBuildings({type:"spartanforge", player: me, onlyFinshed: true});
				if(allForges.length){
					return allForges[0];
				}
			}
			/************* ORIENTING ******************/
			function upgradeInForge(){
				var upgradeLevel = (
					scope.player && 
					scope.player.upgrades && 
					scope.player.upgrades["spartanup"]
				) ? scope.player.upgrades["spartanup"] : 0;
				// because scope.getUpgradeLevel("spartanup") fails
				// because scope.getUpgradeLevel("spartanupgradea") fails too
				var upgradeCost = 50 * upgradeLevel + 50;
				DATA.HP_BONUS = 50 * upgradeLevel;
				if(scope.getGold() - 10 > upgradeCost){
					scope.order("spartanupgradea" ,[DATA.FORGE]);
				}
			}
			function orientInEnviroment(){
				if(!DATA.RESPAWN){
					return 'give up';
				}
				if(!DATA.WARRIOR){
					return 'need revive';
				}
				var rageIsReady = (DATA.NOW > DATA.TIME_OF_RAGE + 20);
				var rageIsOngoing = (DATA.NOW < DATA.TIME_OF_RAGE + 10);
				DATA.CLOSEST_ENEMY = findClosestEnemy();
				var enemyDistance = DATA.CLOSEST_ENEMY ? unitDistance(DATA.WARRIOR, DATA.CLOSEST_ENEMY) : 99;
				var enemyIsClose = enemyDistance < 3;
				if(rageIsReady || rageIsOngoing){
					if(enemyIsClose){
						return 'rage is ready';
					}
					return 'too far';
				}
				var HP_Percent = Math.round(100 * DATA.WARRIOR.getCurrentHP() / (500 + DATA.HP_BONUS));
				if(HP_Percent < 60){
					return 'endure';
				}
				var needHealing = (HP_Percent < 30);
				var stopHealing = (HP_Percent > 60);
				if(needHealing){
					//console.log('need healing');
					return 'need healing';
				}
				if(stopHealing){
					//console.log('stop healing');
					return 'too far';
				}
			}
			function findClosestEnemy(){
				var enemies = scope.getUnits({player: enemy});
				if(!enemies.length){
					return;
				}
				var shortestDistance = 99999;
				var closestEnemy;
				for(var i = 0, max = enemies.length; i < max; i++){
					var oneEnemy = enemies[i];
					var hisDistance = unitDistance(DATA.WARRIOR, oneEnemy);
					if(hisDistance < shortestDistance){
						shortestDistance = hisDistance;
						closestEnemy = oneEnemy;
					}
				}
				return closestEnemy;
			}
			/************* ACTING ******************/
			function revive(){
				scope.order("Revive Spartan" ,[DATA.RESPAWN]);
				resetCooldowns();
			}
			function pushEnemies(){
				if(scope.getGold() < 10){
					return;
				}
				if(DATA.NOW > DATA.TIME_OF_PUSH + 10 && unitDistance(DATA.WARRIOR, DATA.CLOSEST_ENEMY) < 3){
					DATA.TIME_OF_PUSH = DATA.NOW + 1;
					scope.order("Push",[DATA.WARRIOR]);
					//console.log('going home after push');
					scope.order("Move", [DATA.WARRIOR], {x: 7, y: 22}, true);
				}
			}
			function fallBackAndHeal(){
				if(DATA.WARRIOR.getCurrentOrderName() != "Move" || DATA.WARRIOR.getX() > 11){
					//console.log('falling back anyway');
					scope.order("Move", [DATA.WARRIOR], {x: 7, y: 22});
				}
			}
			function activateRage(){
				if(scope.getGold() < 10){
					return;
				}
				if(DATA.NOW > DATA.TIME_OF_RAGE + 20){
					DATA.TIME_OF_RAGE = DATA.NOW + 1;
					scope.order("Rage" ,[DATA.WARRIOR]);
				}
			}
			function endure(){
				if(scope.getGold() < 20){
					return;
				}
				scope.order("Endure" ,[DATA.WARRIOR]);
			}
			function attackMove(){
				if(DATA.WARRIOR.getX() < 33){
					scope.order("AMove", [DATA.WARRIOR], {x: 41, y: 22});
					return;
				}
				if(DATA.WARRIOR.getX() < 38){//DATA.WARRIOR.getCurrentOrderName() != "AMove" && 
					var rngY = 22 + Math.round(Math.random()*9);
					scope.order("AMove", [DATA.WARRIOR], {x: 51, y: rngY});//, true
				}
				if(DATA.WARRIOR.getX() < 50){//DATA.WARRIOR.getCurrentOrderName() != "AMove" && 
					var rngY = 22 + Math.round(Math.random()*9);
					scope.order("AMove", [DATA.WARRIOR], {x: 71, y: rngY});//, true
				}
			}
			function throwJavelin(){
				if(DATA.NOW <= DATA.TIME_OF_JAVELIN + 20){
					return;
				}
				if(scope.getGold() < 20){
					return;
				}
				var enemies = scope.getUnits({player: enemy});//type: "persian bossa"
				if(!enemies.length){
					return;
				}
				var enemyTypes = {};
				var target;
				for(var i = 0, max = enemies.length; i < max; i++){
					var oneEnemy = enemies[i];
					enemyTypes[oneEnemy.getTypeName()] = true;
					var hisDistance = unitDistance(DATA.WARRIOR, oneEnemy);
					if(hisDistance > 15){
						continue;
					}
					if(oneEnemy.getTypeName().indexOf("boss") > 0){
						target = oneEnemy;
					}
				}
				if(target){
					DATA.TIME_OF_JAVELIN = DATA.NOW + 1;
					scope.order("Throw the javelin", [DATA.WARRIOR], {x: target.getX(),y: target.getY()});
				}
			}
			function stunBoss(){
				if(DATA.NOW <= DATA.TIME_OF_Stun + 30){
					return;
				}
				if(scope.getGold() < 30){
					return;
				}
				var enemies = scope.getUnits({player: enemy});//type: "persian bossa"
				if(!enemies.length){
					return;
				}
				var target;
				for(var i = 0, max = enemies.length; i < max; i++){
					var oneEnemy = enemies[i];
					if(oneEnemy.getTypeName().indexOf("boss") < 1){
						continue;
					}
					var hisDistance = unitDistance(DATA.WARRIOR, oneEnemy);
					if(hisDistance > 3){
						continue;
					}
					target = oneEnemy;
				}
				if(target){
					DATA.TIME_OF_Stun = DATA.NOW + 1;
					scope.order("Stun", [DATA.WARRIOR], {x: target.getX(),y: target.getY()});
					scope.order("AMove", [DATA.WARRIOR], {x: target.getX(),y: target.getY()}, true);
				}
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