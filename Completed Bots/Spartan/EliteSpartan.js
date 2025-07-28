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
					DATA = {
						COLOUR : ["Red", "Red", "Blue", "Green", "White", "Black", "Yellow"]
					};
					resetCooldowns();
				}catch(Pokemon){
					console.log('Error during init:\n'+Pokemon);
				}
			}
			function resetCooldowns(){
				DATA.TIME_OF_RAGE = -21;
				DATA.TIME_OF_ENDURE = -41;
				DATA.TIME_OF_PUSH = -11;
				DATA.TIME_OF_JAVELIN = -21;
				DATA.TIME_OF_STUN = -31;
			}
			function makeMove(){
				try{
					observeEnviroment();
					var decision = decide();
					switch(decision){
					case 'give up':
						return;
					case 'need revive':
						revive();
						break;
					case 'need healing':
						fallBackAndHeal();
						pushEnemies();
						break;
					case 'advance':
						attackMove();
						throwJavelin();
						break;
					case 'all in':
						attackMove();
						throwJavelin();
						activateRage();
						stunBoss();
						activateEndure();
						break;
					case 'grind':
						attackMove();
						activateRageOrEndure();
						throwJavelinToArcher();
						break;
					}
					upgradeInForge();
				}catch(Pokemon){
					console.log('Error during makeMove:\n'+Pokemon);
				}
			}
			/************* OBSERVE ******************/
			function observeEnviroment(){
				try{
					DATA.WARRIOR = findWarrior();
					DATA.Y = loadY();
					DATA.RESPAWN = findRespawn();
					DATA.HEALS = findHealings();
					DATA.FORGE = findForge();
					DATA.UPGRADE = findUpgrade();
					DATA.GOLD = scope.getGold();
					DATA.NOW = Math.round(scope.getCurrentGameTimeInSec());
					DATA.RAGE = checkRageAbility();
					DATA.ENDURE = checkEndureAbility();
					DATA.PUSH = checkPushAbility();
					DATA.JAVELIN = checkJavelinAbility();
					DATA.STUN = checkStunAbility();
					DATA.RUN = checkRunAbility();
					DATA.ENEMY = checkEnemies();
					DATA.BOSS = checkBoss();
					DATA.ARCHER = chooseRandomArcher();
					DATA.GOLD_RESERVE = DATA.BOSS ? 60 : 10;
					DATA.HP_Percent = checkHP();
					DATA.MIN_HP = calculateMinimumHP();
				}catch(Pokemon){
					console.log('Error during observeEnviroment:\n'+Pokemon);
				}
			}
			function loadY(){
				if(DATA.Y){
					return DATA.Y;
				}
				if(!DATA.WARRIOR){
					return;
				}
				return DATA.WARRIOR.getY();
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
			function findForge(){
				var allForges = scope.getBuildings({type:"spartanforge", player: me, onlyFinshed: true});
				if(allForges.length){
					return allForges[0];
				}
			}
			function findUpgrade(){
				var upgrade = {};
				upgrade.LEVEL = (
					scope.player && 
					scope.player.upgrades && 
					scope.player.upgrades.spartanup
				) ? scope.player.upgrades.spartanup : 0;
				// because scope.getUpgradeLevel("spartanup") fails
				// because scope.getUpgradeLevel("spartanupgradea") fails too
				upgrade.COST = 50 * upgrade.LEVEL + 50;
				upgrade.HP_BONUS = 50 * upgrade.LEVEL;
				upgrade.NAME = "spartanupgradea";
				return upgrade;
			}
			function checkRageAbility(){
				return {
					isReady : (DATA.NOW > DATA.TIME_OF_RAGE + 20),
					isActive : (DATA.NOW < DATA.TIME_OF_RAGE + 10),
					cooldown : 20,
					duration : 10,
					cost : 10,
					name : "Rage"
				};
			}
			function checkEndureAbility(){
				return {
					isReady : (DATA.NOW > DATA.TIME_OF_ENDURE + 40),
					isActive : (DATA.NOW < DATA.TIME_OF_ENDURE + 20),
					cooldown : 40,
					duration : 20,
					cost : 50,
					name : "Endure"
				};
			}
			function checkPushAbility(){
				return {
					isReady : (DATA.NOW > DATA.TIME_OF_RAGE + 10),
					cooldown : 10,
					cost : 10,
					name : "Push"
				};
			}
			function checkJavelinAbility(){
				return {
					isReady : (DATA.NOW > DATA.TIME_OF_JAVELIN + 20),
					distance : 7,
					cooldown : 20,
					cost : 20,
					name : "Throw the javelin"
				};
			}
			function checkStunAbility(){
				return {
					isReady : (DATA.NOW > DATA.TIME_OF_STUN + 30),
					isActive : (DATA.NOW < DATA.TIME_OF_STUN + 10),
					cooldown : 30,
					duration : 5,
					cost : 10,
					name : "Stun"
				};
			}
			function checkRunAbility(){
				return {
					isReady : (DATA.NOW > DATA.TIME_OF_RUN + 10),
					isActive : (DATA.NOW < DATA.TIME_OF_RUN + 2),
					cooldown : 10,
					duration : 2,
					cost : 10
				};
			}
			function checkEnemies(){
				if(!DATA.WARRIOR){
					return;
				}
				var allEnemies = scope.getUnits({player: enemy});
				if(!allEnemies.length){
					return;
				}
				var enemies = {
					distance : 99,
					ALL : allEnemies
				};
				for(var i = 0, max = allEnemies.length; i < max; i++){
					var oneEnemy = allEnemies[i];
					var hisDistance = unitDistance(DATA.WARRIOR, oneEnemy);
					if(hisDistance < enemies.distance){
						enemies.closest = oneEnemy;
						enemies.distance = hisDistance;
					}
				}
				return enemies;
			}
			function checkBoss(){
				if(!DATA.WARRIOR || !DATA.ENEMY){
					return;
				}
				var boss = {
					distance : 99,
					units : []
				};
				for(var i = 0, max = DATA.ENEMY.ALL.length; i < max; i++){
					var oneBoss = DATA.ENEMY.ALL[i];
					if(oneBoss.getTypeName().indexOf("boss") < 0){
						continue;//not a boss
					}
					boss.units.push(oneBoss);
					var hisDistance = unitDistance(DATA.WARRIOR, oneBoss);
					if(hisDistance < boss.distance){
						boss.closest = oneBoss;
						boss.distance = hisDistance;
					}
				}
				if(boss.distance == 99){
					return;
				}
				return boss;
			}
			function chooseRandomArcher(){
				if(!DATA.WARRIOR || !DATA.ENEMY){
					return;
				}
				var archers = {
					units : []
				};
				for(var i = 0, max = DATA.ENEMY.ALL.length; i < max; i++){
					var oneGuy = DATA.ENEMY.ALL[i];
					if(oneGuy.getTypeName().indexOf("arch") < 0){
						continue;//not an archer
					}
					archers.units.push(oneGuy);
				}
				if(!archers.units.length){
					return;
				}
				var rngIndex = Math.floor(Math.random() * archers.units.length);
				archers.target = archers.units[rngIndex];
				archers.distance = unitDistance(DATA.WARRIOR, archers.target);
				return archers;
			}
			function checkHP(){
				if(!DATA.WARRIOR){
					return 0;
				}
				return Math.round(100 * DATA.WARRIOR.getCurrentHP() / (500 + DATA.UPGRADE.HP_BONUS));
			}
			function calculateMinimumHP(){
				var minimumHP = 1;
				if(DATA.BOSS){
					if(DATA.RAGE.isReady || DATA.RAGE.isActive){
						if(DATA.ENDURE.isReady || DATA.ENDURE.isActive){
							minimumHP = 10;
						}else{
							minimumHP = 20;
						}
					}else{
						if(DATA.ENDURE.isReady || DATA.ENDURE.isActive){
							minimumHP = 40;
						}else{
							minimumHP = 70;
						}
					}
				}else{
					if(DATA.RAGE.isReady || DATA.RAGE.isActive){
						if(DATA.ENDURE.isReady || DATA.ENDURE.isActive){
							minimumHP = 5;
						}else{
							minimumHP = 15;
						}
					}else{
						if(DATA.ENDURE.isReady || DATA.ENDURE.isActive){
							minimumHP = 25;
						}else{
							minimumHP = 40;
						}
					}
				}
				return minimumHP;
			}
			/************* DECIDE ******************/
			function decide(){
				if(!DATA.RESPAWN){
					return 'give up';
				}
				if(!DATA.WARRIOR){
					return 'need revive';
				}
				if(DATA.HP_Percent < DATA.MIN_HP){
					return 'need healing';
				}
				if(DATA.ENEMY.distance > 3){
					return 'advance';
				}
				if(DATA.BOSS){
					return 'all in';
				}
				return 'grind';
			}
			/************* ACT ******************/
			function revive(){
				if(DATA.GOLD < 50){
					if(!DATA.LAST_WORDS){
						DATA.LAST_WORDS = "I died and cannot revive, good luck guys.";
						scope.chatMsg(DATA.COLOUR[me] + ": " + DATA.LAST_WORDS); 
					}
					return;
				}
				DATA.GOLD -= 50;
				scope.order("Revive Spartan" ,[DATA.RESPAWN]);
				resetCooldowns();
			}
			function upgradeInForge(){
				if(DATA.GOLD - DATA.GOLD_RESERVE < DATA.UPGRADE.COST){
					return;
				}
				DATA.GOLD -= DATA.UPGRADE.COST;
				scope.order(DATA.UPGRADE.NAME ,[DATA.FORGE]);//"spartanupgradea"
			}
			function pushEnemies(){
				if( DATA.GOLD < DATA.PUSH.cost || 
					!DATA.ENEMY || 
					!DATA.PUSH.isReady ||
					DATA.ENEMY.distance > 3
				){
					return;
				}
				DATA.TIME_OF_PUSH = DATA.NOW + 1;
				DATA.GOLD -= DATA.PUSH.cost;
				scope.order("Push",[DATA.WARRIOR]);
				scope.order("Move", [DATA.WARRIOR], {x: 7, y: 22}, true);
			}
			function fallBackAndHeal(){
				if(DATA.WARRIOR.getCurrentOrderName() != "Move" || DATA.WARRIOR.getX() > 11){
					scope.order("Move", [DATA.WARRIOR], {x: 7, y: 22});
				}
			}
			function activateRage(){
				if( DATA.GOLD < DATA.RAGE.cost ||
					!DATA.RAGE.isReady ||
					!DATA.ENEMY || 
					DATA.ENEMY.distance > 2.5
				){
					return;
				}
				DATA.TIME_OF_RAGE = DATA.NOW + 1;
				DATA.GOLD -= DATA.RAGE.cost;
				scope.order("Rage" ,[DATA.WARRIOR]);
			}
			function activateEndure(){
				if( DATA.GOLD < DATA.ENDURE.cost ||
					!DATA.ENDURE.isReady
				){
					return;
				}
				DATA.TIME_OF_ENDURE = DATA.NOW + 1;
				DATA.GOLD -= DATA.ENDURE.cost;
				scope.order("Endure" ,[DATA.WARRIOR]);
			}
			function attackMove(){
				if(DATA.WARRIOR.getX() < 33){
					scope.order("AMove", [DATA.WARRIOR], {x: 41, y: DATA.Y});
					return;
				}
				scope.order("AMove", [DATA.WARRIOR], {x: 81, y: DATA.Y});
			}
			function throwJavelin(){
				if( DATA.GOLD < DATA.JAVELIN.cost ||
					!DATA.JAVELIN.isReady ||
					!DATA.BOSS ||
					!DATA.BOSS.closest ||
					DATA.BOSS.distance > 8
				){
					return;
				}
				var target = DATA.BOSS.closest;
				DATA.TIME_OF_JAVELIN = DATA.NOW + 1;
				DATA.GOLD -= DATA.JAVELIN.cost;
				scope.order("Throw the javelin", [DATA.WARRIOR], {x: target.getX(),y: target.getY()});
			}
			function stunBoss(){
				if( DATA.GOLD < DATA.STUN.cost ||
					!DATA.STUN.isReady ||
					!DATA.BOSS ||
					!DATA.BOSS.closest ||
					DATA.BOSS.distance > 3
				){
					return;
				}
				var target = DATA.BOSS.closest;
				DATA.TIME_OF_STUN = DATA.NOW + 1;
				DATA.GOLD -= DATA.STUN.cost;
				scope.order("Stun", [DATA.WARRIOR], {x: target.getX(),y: target.getY()});
				scope.order("AMove", [DATA.WARRIOR], {x: target.getX(),y: target.getY()}, true);
			}
			function activateRageOrEndure(){
				var canRage = (DATA.GOLD >= DATA.RAGE.cost && DATA.RAGE.isReady);
				var canEndure = (DATA.GOLD >= DATA.ENDURE.cost && !DATA.RAGE.isActive && DATA.ENDURE.isReady);
				if(canRage){
					activateRage();
					return;
				}
				if(canEndure && DATA.HP_Percent < 70){
					activateEndure();
				}
			}
			function throwJavelinToArcher(){
				if( DATA.GOLD < DATA.JAVELIN.cost ||
					!DATA.JAVELIN.isReady ||
					!DATA.ARCHER ||
					!DATA.ARCHER.target ||
					DATA.ARCHER.distance > 7
				){
					return;
				}
				var target = DATA.ARCHER.target;
				DATA.TIME_OF_JAVELIN = DATA.NOW + 1;
				DATA.GOLD -= DATA.JAVELIN.cost;
				scope.order("Throw the javelin", [DATA.WARRIOR], {x: target.getX(),y: target.getY()});
			}
			/********** DISTANCE **********/
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