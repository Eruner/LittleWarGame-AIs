/*
	Map = Evolution
	Bot = Passive AI

	Features:
		- fights for center
		- upgrades towers
		- all kinds of build orders
		- does NOT conquer you

	How To:
	0. Save this as .js file in your computer
	1. Open/Refresh Little War Game web page
	2. "Load custom AI" - in Options, next to F.A.Q.
	3. Play vs CPU
	4. Edit teams as you want
	5. Play
	6. Try to win
*/
var scope = scope || null;
try{
	if(!scope){
		console.log('Scope is not initialized');
		return;
	}
	var me = scope.getMyPlayerNumber();
	if(!scope['BOT-' + me]){
		scope['BOT-' + me] = (function(){
			var DATA;
			function init() {
				try{
					DATA = {};
					loadBuildings();
					loadTechnologies();
					rallyTowers();
				}catch(Pokemon){
					console.log('Error during init:\n'+Pokemon);
				}
			}
			function makeMove(){
				try{
					observe();
					attack();
					upgradeAllTowers();
				}catch(Pokemon){
					console.log('Error during makeMove:\n'+Pokemon);
				}
			}
			/************ LOADING *****************/
			function loadBuildings(){
				DATA.TOWERS = scope.getBuildings({type:"Tower(Primitive)", player: me, onlyFinshed: true});
				DATA.WARD = {x:87,y:87};
			}
			function loadTechnologies(){
				DATA.TECH = [/* Tech Name, Cost */
					"Upgrade To Archer",
					"Upgrade To Swordsman",
					"Upgrade To Wolf"
				];
				DATA.TECH_ARCHER = [
					"Upgrade To Rifleman",
					"Upgrade To Elf Archer",
					"Upgrade To Mage"
				];
				DATA.TECH_SOLDIER = [
					"Upgrade To Heavy Swordsman",
					"Upgrade To Giant Shield",
					"Upgrade To Skeleton"
				];
				DATA.TECH_WOLF = [
					"Upgrade To Catapult",
					"Upgrade to Shadow Wolf",
					"Upgrade to Bird"
				];
				DATA.TOWER_NAMES = [
					"Tower(Primitive)",
					"Tower(Archer)",
					"Tower(Swordsman)",
					"Tower(Wolf)",
					"Tower(Rifleman)",
					"Tower(Elf Archer)",
					"Tower(Mage)",
					"Tower(Heavy Swordsman)",
					"Tower(Giant Shield)",
					"Tower(Skeleton)",
					"Tower(Catapult)",
					"Tower(Shadow Wolf)",
					"Tower(Bird)"
				];
				DATA.TECH_RIFLEMAN = [
					"Upgrade to Warplane",
					"Upgrade to Elementalist"
				];
				DATA.TECH_ELF_ARCHER = [
					"Upgrade to Elementalist",
					"Upgrade to Arrow Tower"
				];
				DATA.TECH_MAGE = [
					"Upgrade to Arrow Tower",
					"Upgrade To Priest"
				];
				DATA.TECH_HEAVY_SWORDSMAN = [
					"Upgrade To Priest",
					"Upgrade To Ballista"
				];
				DATA.TECH_GIANT_SHIELD = [
					"Upgrade To Ballista",
					"Upgrade to Bionic Man"
				];
				DATA.TECH_SKELETON = [
					"Upgrade to Bionic Man",
					"Upgrade to Mutant"
				];
				DATA.TECH_CATAPULT = [
					"Upgrade to Mutant",
					"Upgrade To Werewolf"
				];
				DATA.TECH_SHADOW_WOLF = [
					"Upgrade To Werewolf",
					"Upgrade to Dragon"
				];
				DATA.TECH_BIRD = [
					"Upgrade to Dragon",
					"Upgrade to Warplane"
				];
			}
			function rallyTowers(){
				var centerOfTowers = scope.getCenterOfUnits(DATA.TOWERS);
				scope.order("Move", DATA.TOWERS, centerOfTowers);
			}
			/********** ACTIONS **********/
			function observe(){
				DATA.GOLD = scope.getGold();
				DATA.SUPPLY = scope.getCurrentSupply();
				DATA.TOWERS = scope.getBuildings({player: me, onlyFinshed: true});
				DATA.TOWERS_PRIMITIVE = scope.getBuildings({type: "Tower(Primitive)", player: me, onlyFinshed: true});
				DATA.TOWERS_ARCHER = scope.getBuildings({type: "Tower(Archer)", player: me, onlyFinshed: true});
				DATA.TOWERS_SWORDSMAN = scope.getBuildings({type: "Tower(Swordsman)", player: me, onlyFinshed: true});
				DATA.TOWERS_WOLF = scope.getBuildings({type: "Tower(Wolf)", player: me, onlyFinshed: true});
				DATA.TOWERS_RIFLEMAN = scope.getBuildings({type: "Tower(Rifleman)", player: me, onlyFinshed: true});
				DATA.TOWERS_ELF_ARCHER = scope.getBuildings({type: "Tower(Elf Archer)", player: me, onlyFinshed: true});
				DATA.TOWERS_MAGE = scope.getBuildings({type: "Tower(Mage)", player: me, onlyFinshed: true});
				DATA.TOWERS_HEAVY_SWORDSMAN = scope.getBuildings({type: "Tower(Heavy Swordsman)", player: me, onlyFinshed: true});
				DATA.TOWERS_GIANT_SHIELD = scope.getBuildings({type: "Tower(Giant Shield)", player: me, onlyFinshed: true});
				DATA.TOWERS_SKELETON = scope.getBuildings({type: "Tower(Skeleton)", player: me, onlyFinshed: true});
				DATA.TOWERS_CATAPULT = scope.getBuildings({type: "Tower(Catapult)", player: me, onlyFinshed: true});
				DATA.TOWERS_SHADOW_WOLF = scope.getBuildings({type: "Tower(Shadow Wolf)", player: me, onlyFinshed: true});
				DATA.TOWERS_BIRD = scope.getBuildings({type: "Tower(Bird)", player: me, onlyFinshed: true});
			}
			function attack(){
				if(DATA.SUPPLY < 10){
					return;//too small army
				}
				var fightingUnits = scope.getUnits({notOfType: "Worker", player: me});
				scope.order("AMove", fightingUnits, DATA.WARD);
			}
			/********** ADVANCE **********/
			function upgradeAllTowers(){
				upgradeTowers(DATA.TOWERS_PRIMITIVE, DATA.TECH, 50);
				upgradeTowers(DATA.TOWERS_ARCHER, DATA.TECH_ARCHER, 150);
				upgradeTowers(DATA.TOWERS_SWORDSMAN, DATA.TECH_SOLDIER, 150);
				upgradeTowers(DATA.TOWERS_WOLF, DATA.TECH_WOLF, 150);
				upgradeTowers(DATA.TOWERS_RIFLEMAN, DATA.TECH_RIFLEMAN, 250);
				upgradeTowers(DATA.TOWERS_ELF_ARCHER, DATA.TECH_ELF_ARCHER, 250);
				upgradeTowers(DATA.TOWERS_MAGE, DATA.TECH_MAGE, 250);
				upgradeTowers(DATA.TOWERS_HEAVY_SWORDSMAN, DATA.TECH_HEAVY_SWORDSMAN, 250);
				upgradeTowers(DATA.TOWERS_GIANT_SHIELD, DATA.TECH_GIANT_SHIELD, 250);
				upgradeTowers(DATA.TOWERS_SKELETON, DATA.TECH_SKELETON, 250);
				upgradeTowers(DATA.TOWERS_CATAPULT, DATA.TECH_CATAPULT, 250);
				upgradeTowers(DATA.TOWERS_SHADOW_WOLF, DATA.TECH_SHADOW_WOLF, 250);
				upgradeTowers(DATA.TOWERS_BIRD, DATA.TECH_BIRD, 250);
			}
			function upgradeTowers(towers, techs, cost){
				if( !towers||
					!towers.length ||
					DATA.GOLD < cost
				){
					return;
				}
				var rngTech = Math.floor(Math.random() * techs.length);
				var techName = techs[rngTech];
				scope.order(techName, [towers[0]], {shift: true}, {shift: true});
				DATA.GOLD -= cost;
			}
			/********** EXPORT **********/
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