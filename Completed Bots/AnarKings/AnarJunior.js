/*
	Map = AnarKings
	Bot = plays as random hero

	Features:
	- picks random hero
	- goes to top lane
	- hides behind lane mobs/creeps
	- uses abilities
	- tries to heal up when low on hp
	- recruits clerics & golems & 1-2 workers
	- grabs top Rune
	- pushes towers and nexus

*/
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
					loadRecruitment();
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
				AI.ON_BOT = false;
				AI.WAITING_TIME = 9;
				AI.HERO_NAMES = [
					".Soldier Hero",
					".Sharpshooter Hero",
					".Mage Hero",
					".Niko Hero",
					".Oathbroken Hero",
					".Druides Hero",
					".Herald Hero",
					"...Eclipse Hero"
				];
				AI.HERO_NAME = AI.HERO_NAMES[Math.floor(Math.random()*AI.HERO_NAMES.length)];
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
			function loadPositions(){
				AI.MAP = {};
				var leftMap = {
					HEAL 	: {x:23,y:41},
					NEXUS	: {x:32,y:50},
					TOWER3	: {x:35,y:50},
					TOWER2_TOP	: {x:52,y:31},
					TOWER2_MID: {x:60,y:50},
					TOWER2_BOT	: {x:52,y:69},
					TOWER1_TOP	: {x:82,y:31},
					TOWER1_MID: {x:75,y:50},
					TOWER1_BOT	: {x:82,y:69}
				};
				var rightMap = {
					HEAL 	: {x:177,y:41},
					NEXUS	: {x:168,y:50},
					TOWER3	: {x:165,y:50},
					TOWER2_TOP	: {x:148,y:31},
					TOWER2_MID: {x:140,y:50},
					TOWER2_BOT	: {x:148,y:69},
					TOWER1_TOP	: {x:118,y:31},
					TOWER1_MID: {x:125,y:50},
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
					'top':{x:100,y:7},
					'mid':{x:100,y:50},
					'bot':{x:100,y:96}
				};
				AI.MAP.CHECKPOINTS = {
					top:[{x:32,y:50},{x:52,y:31},{x:82,y:31},{x:118,y:31},{x:148,y:31},{x:168,y:50}],
					bot:[{x:32,y:50},{x:52,y:69},{x:82,y:69},{x:118,y:69},{x:148,y:69},{x:168,y:50}]
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
							var slash = AI.HERO_INFO.abilities[0];
							if(AI.CLOSEST_ENEMY_DISTANCE < 2.15 && canCastAbility(slash)){
								scope.order(slash.name, [AI.HERO]);
								AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
								return true;
							}
							var shatter = AI.HERO_INFO.abilities[1];
							if(AI.ENEMY_TO_KITE && AI.ENEMY_TO_KITE.length && canCastAbility(shatter)){
								scope.order(shatter.name, [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit});
								AI.HERO_INFO.abilities[1].lastTime = AI.TIME_NOW;
								return true;
							}
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
							if(AI.ENEMY_TO_KITE && AI.KITE_LOCATION){
								scope.order("Move", [AI.HERO], AI.KITE_LOCATION);
								return true;
							}
							var mark = AI.HERO_INFO.abilities[0];
							if(AI.ENEMY_CLOSE_TO_ME && canCastAbility(mark)){
								castToArea(mark.name, AI.HERO, {x: AI.ENEMY_CLOSE_TO_ME.unit.getX(),y: AI.ENEMY_CLOSE_TO_ME.unit.getY()});
								AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
								return true;
							}
							var knees = AI.HERO_INFO.abilities[1];
							if(AI.ENEMY_CLOSE_TO_ME && canCastAbility(knees)){
								castToArea(knees.name, AI.HERO, {x: AI.ENEMY_CLOSE_TO_ME.unit.getX(),y: AI.ENEMY_CLOSE_TO_ME.unit.getY()});
								AI.HERO_INFO.abilities[1].lastTime = AI.TIME_NOW;
								return true;
							}
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
							if(AI.ENEMY_TO_KITE && AI.KITE_LOCATION){
								scope.order("Move", [AI.HERO], AI.KITE_LOCATION);
								return true;
							}
							var flames = AI.HERO_INFO.abilities[0];
							if(AI.ENEMY_TO_ATTACK && canCastAbility(flames)){
								castToArea(flames.name, AI.HERO, {x: AI.ENEMY_CLOSE_TO_ME.unit.getX(),y: AI.ENEMY_CLOSE_TO_ME.unit.getY()});
								AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
								return true;
							}
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
						isRanged:false,
						act:function(){
							var aoeHeal = AI.HERO_INFO.abilities[1];
							if(AI.HP.CURRENT < 200 && canCastAbility(aoeHeal)){
								castToArea(aoeHeal.name, AI.HERO, {x: AI.HERO.getX(),y: AI.HERO.getY()});
								AI.HERO_INFO.abilities[1].lastTime = AI.TIME_NOW;
								return true;
							}
							if(AI.INJURED_ALLY_HERO && canCastAbility(aoeHeal)){
								castToArea(aoeHeal.name, AI.HERO, {x: AI.INJURED_ALLY_HERO.getX(),y: AI.INJURED_ALLY_HERO.getY()});
								AI.HERO_INFO.abilities[1].lastTime = AI.TIME_NOW;
								return true;
							}
							var singleHeal = AI.HERO_INFO.abilities[0];
							if(AI.INJURED_ALLY_HERO && canCastAbility(singleHeal)){
								castToArea(singleHeal.name, AI.HERO, {x: AI.INJURED_ALLY_HERO.getX(),y: AI.INJURED_ALLY_HERO.getY()});
								AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
								return true;
							}

							var aoeDmg = AI.HERO_INFO.abilities[3];
							if(AI.ENEMY_TO_KITE && AI.KITE_LOCATION && AI.ENEMY_CLOSE_TO_ME && canCastAbility(aoeDmg)){
								castToArea(aoeDmg.name, AI.HERO, {x: AI.ENEMY_CLOSE_TO_ME.unit.getX(),y: AI.ENEMY_CLOSE_TO_ME.unit.getY()});
								scope.order("Move", [AI.HERO], AI.KITE_LOCATION, {shift:true});
								AI.HERO_INFO.abilities[3].lastTime = AI.TIME_NOW;
								return true;
							}
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
							var daybreak = AI.HERO_INFO.abilities[0];
							if(AI.ENEMY_CLOSE_TO_ME && AI.ENEMY_CLOSE_TO_ME.distance < 3 && canCastAbility(daybreak)){
								scope.order(daybreak.name, [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit});
								scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit}, {shift:true});
								AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
								return true;
							}
							var shackle = AI.HERO_INFO.abilities[1];
							if(AI.ENEMY_CLOSE_TO_ME && AI.ENEMY_CLOSE_TO_ME.distance < 3 && canCastAbility(shackle)){
								scope.order(shackle.name, [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit});
								scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit}, {shift:true});
								AI.HERO_INFO.abilities[1].lastTime = AI.TIME_NOW;
								return true;
							}
						}
					},
					".Druides Hero":{
						abilities:[{
							name:".Leaf of Envy",
							cooldown:22,
							cost:0,
							lastTime:0,
							range:6,
							description:"heal totem target area"
						},{
							name:".A Tree Falls Training",
							cooldown:13,
							cost:0,
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
							if(AI.ENEMY_CLOSE_TO_ME && AI.ENEMY_CLOSE_TO_ME.distance < 6 && AI.MY_WOLF && AI.MY_WOLF.length){
								scope.order("Attack", AI.MY_WOLF, {unit: AI.ENEMY_CLOSE_TO_ME.unit});
							}
							var summon = AI.HERO_INFO.abilities[1];
							if((!AI.MY_WOLF || !AI.MY_WOLF.length) && canCastAbility(summon)){
								castToArea(summon.name, AI.HERO, {x: AI.HERO.getX(),y: AI.HERO.getY()});
								AI.HERO_INFO.abilities[1].lastTime = AI.TIME_NOW;
								return true;
							}
							if(summon.lastTime + 5 >= AI.TIME_NOW){
								return true;
							}
							var ward = AI.HERO_INFO.abilities[0];
							if(AI.VANGUARD_ALLY && AI.VANGUARD_ALLY.distance < 2 && canCastAbility(ward)){
								castToArea(ward.name, AI.HERO, {x: AI.VANGUARD_ALLY.tank.getX(),y: AI.VANGUARD_ALLY.tank.getY()});
								AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
								return true;
							}
							var buff = AI.HERO_INFO.abilities[2];
							if(AI.VANGUARD_ALLY && AI.VANGUARD_ALLY.distance < 2 && canCastAbility(buff)){
								castToArea(buff.name, AI.HERO, {x: AI.VANGUARD_ALLY.tank.getX(),y: AI.VANGUARD_ALLY.tank.getY()});
								AI.HERO_INFO.abilities[2].lastTime = AI.TIME_NOW;
								return true;
							}
							if(AI.MY_WOLF && AI.MY_WOLF.length && AI.MY_WOLF[0] && AI.MY_WOLF[0].getCurrentHP() < 180 && canCastAbility(ward)){
								castToArea(ward.name, AI.HERO, {x: AI.MY_WOLF[0].getX(),y: AI.MY_WOLF[0].getY()});
								AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
								return true;
							}
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
							if(AI.ENEMY_TO_KITE){
								scope.order("Move", [AI.HERO], AI.MAP.MY.NEXUS);
								AI.CHANNELING = false;
								return true;
							}
							var rally = AI.HERO_INFO.abilities[0];
							if(AI.CHANNELING){
								if(AI.MOBS_AROUND_ME.ally.length < 3){
									AI.CHANNELING = false;
									AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
									scope.order("Move", [AI.HERO], AI.MAP.MY.NEXUS);
									return false;
								}
								return true;
							}
							if(canCastAbility(rally) && AI.MOBS_AROUND_ME.ally.length > 3 && AI.MOBS_AROUND_ME.enemy.length){
								AI.CHANNELING = true;
								scope.order(rally.name, [AI.HERO], AI.HERO);
								return true;
							}
						}
					},
					"...Eclipse Hero":{
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
							cost:0,
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
						},{
							name:".Shadows",
							cooldown:50,
							cost:0,
							lastTime:0,
							range:1,
							description:"self heal"
						}],
						hp:255,
						hp_lv:15,
						isRanged:false,
						act:function(){
							var shade = AI.HERO_INFO.abilities[2];
							if(AI.ENEMY_CLOSE_TO_ME && AI.ENEMY_CLOSE_TO_ME.distance < 6 && canCastAbility(shade)){
								castToArea(shade.name, AI.HERO, {x: AI.ENEMY_CLOSE_TO_ME.unit.getX(),y: AI.ENEMY_CLOSE_TO_ME.unit.getY()});
								scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit}, {shift:true});
								AI.HERO_INFO.abilities[2].lastTime = AI.TIME_NOW;
								return true;
							}
							var apex = AI.HERO_INFO.abilities[0];
							if(AI.ENEMY_CLOSE_TO_ME && AI.ENEMY_CLOSE_TO_ME.distance < 6 && canCastAbility(apex)){
								castToArea(apex.name, AI.HERO, {x: AI.ENEMY_CLOSE_TO_ME.unit.getX(),y: AI.ENEMY_CLOSE_TO_ME.unit.getY()});
								scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit}, {shift:true});
								AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
								return true;
							}
						}
					}
				};
				AI.HERO_INFO = AI.HERO_BRAINS[AI.HERO_NAME];
			}
			function loadRecruitment(){
				AI.RECRUIT = {
					".Gyrocraft":{name: ".Recruit Gyrocraft",	cost: 25,	supply: 1},
					".Arbalist"	:{name: ".Recruit Arbalist",	cost: 55,	supply: 3},
					".Berserker":{name: ".Recruit Berserker", 	cost: 60,	supply: 3},
					".Cleric"	:{name: ".Recruit Cleric",		cost: 115, 	supply: 5},
					".Catapult"	:{name: ".Recruit Catapult",	cost: 120,	supply: 4},
					".Golem"	:{name: ".Recruit Protector",	cost: 175,	supply: 5},
					".Leyshaper":{name: ".Recruit Leyshaper",	cost: 130,	supply: 5},
					".Pyroclast":{name: ".Recruit Pyroclast",	cost: 200,	supply: 4},
					".Knight"	:{name: ".Recruit Knight",		cost: 275,	supply: 5}
				};
			}
			/**********************************************************/
			/********************* OBSERVE ****************************/
			/**********************************************************/
			function observe(){
				AI.GOLD = scope.getGold();
				AI.TIME_NOW = scope.getCurrentGameTimeInSec();
				AI.SUPPLY = scope.getMaxSupply() - scope.getCurrentSupply();
				AI.CHOOSE = scope.getBuildings({type:"..PICK YOUR HERO", player: AI.me, onlyFinshed: true});
				AI.CENTER = scope.getBuildings({type: AI.BARRACKS, player: AI.me, onlyFinshed: true});
				AI.TOWN = scope.getBuildings({type:".Worker Guild", player: AI.me, onlyFinshed: true})[0];
				AI.GOLD_MINES = scope.getBuildings({type: ".Small Goldmine"});
				AI.CLOSEST_GOLD_MINE = findClosestGoldMine();
				AI.ALLY_TOWERS = findTowers(AI.teamNumber);
				AI.ENEMY_TOWERS = findTowers(AI.enemyTeamNumber);
				AI.RUNE_AVAILABLE = isTimeForRune();
				AI.RUNE_SPOTS = scope.getBuildings({type: AI.RUNE_SPAWNER_NAME, onlyFinshed: true});
				AI.RUNES = scope.getUnits({type: AI.RUNE_NAME});
				AI.ALLY_HEROES = findHeroes(AI.teamNumber);
				AI.ENEMY_HEROES = findHeroes(AI.enemyTeamNumber);
				AI.LEADER_HERO = findLeaderHero();
				AI.HERO = findOnlyMyHero();
				AI.INJURED_ALLY_HERO = findInjuredAllyHeroes();
				AI.MY_WOLF = scope.getUnits({type:".Timber", player: AI.me});
				AI.ALLY_ARMY = findArmy(AI.teamNumber);
				AI.ENEMY_ARMY = findArmy(AI.enemyTeamNumber);
				AI.MY_ARMY = findOnlyMyArmy();
				AI.ALLY_MOBS = findMobs(AI.teamNumber, AI.MOB_ALLY_NAMES);
				AI.ENEMY_MOBS = findMobs(AI.enemyTeamNumber, AI.MOB_ENEMY_NAMES);
				AI.ALLY_MOB_GROUPS = groupMobs(AI.ALLY_MOBS);
				AI.ENEMY_MOB_GROUPS = groupMobs(AI.ENEMY_MOBS);
				AI.MY_WORKERS = scope.getUnits({type:".Gatherer", player: AI.me});
				AI.LEVEL = checkLevel();
				AI.HP = compareHpWithPreviousHp();
			}
			/************** OBSERVE BUILDINGS *********/
			function findClosestGoldMine(){
				if(!AI.GOLD_MINES || !AI.GOLD_MINES.length || !AI.TOWN){
					return;
				}
				var minDistance = 100;
				var bestMine;
				for(var i = 0, max = AI.GOLD_MINES.length; i < max; i++){
					var oneMine = AI.GOLD_MINES[i];
					if(oneMine.getValue('gold') < 5){
						continue;
					}
					var itsDistance = unitDistance(AI.TOWN, oneMine);
					if(itsDistance < minDistance){
						minDistance = itsDistance;
						bestMine = oneMine;
					}
				}
				return bestMine;
			}
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
			function findInjuredAllyHeroes(){
				if(!AI.HERO || !AI.ALLY_HEROES || !AI.ALLY_HEROES.length){
					return;
				}
				var injuredHero;
				var minHP = 200;
				var maxDistance = 8;
				for(var i = 0, max = AI.ALLY_HEROES.length; i < max; i++){
					var oneAllyHero = AI.ALLY_HEROES[i];
					if(oneAllyHero.getCurrentHP() > minHP){
						continue;
					}
					var hisDistance = unitDistance(oneAllyHero, AI.HERO);
					if(hisDistance > maxDistance){
						continue;
					}
					if(!injuredHero || injuredHero.getCurrentHP() > oneAllyHero.getCurrentHP()){
						injuredHero = oneAllyHero;
					}
				}
				return injuredHero;
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
				if(AI.MY_WOLF && AI.MY_WOLF.length){
					myUnits.push(AI.MY_WOLF[0]);
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
				var diffHp = currentHp - previousHp;
				return {
					PREVIOUS : previousHp,
					CURRENT : currentHp,
					DIFFERENCE : diffHp,
					BONUS : bonusHp
				};
			}
			function isTimeForRune(){
				if((AI.TIME_NOW < 41)){
					return false;//too soon
				}
				if(AI.TIME_NOW % 181 > 40){
					AI.RUNE_ATTACKED = false;
					return false;//not spawning yet
				}
				if(AI.RUNE_ATTACKED && !AI.CAN_ATTACK_RUNE){
					return false;//already claimed
				}
				return true;//yeah, it will spawn
			}
			/**********************************************************/
			/********************** ORIENT ****************************/
			/**********************************************************/
			function orient(){
				AI.STAGE = hasGameStarted();
				AI.LOW_ON_HP = isLowOnHP();
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
				AI.CLOSEST_ENEMY_DISTANCE = measureNearestEnemyDistance();
				AI.VANGUARD_ALLY = findAllyClosestToEnemy();
				AI.MOBS_AROUND_ME = findMobsAroundMe();
				AI.CAN_ATTACK_RUNE = runeCloseToHero();
			}
			/******************* ORIENT FUNCTIONS *********************/
			function hasGameStarted(){
				if(AI.TIME_NOW <= AI.WAITING_TIME){
					return 'WAIT';
				}
				if(AI.TIME_NOW <= 20){
					return 'BEFORE FIGHT';
				}
				if(AI.TIME_NOW <= 21){
					return 'ALL LOADED';
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
				var amIUnderTower = false;
				var whichTower;
				for(var i = 0, max = AI.ENEMY_TOWERS.length; i < max; i++){
					whichTower = AI.ENEMY_TOWERS[i];
					var towerDistance = unitDistance(oneUnit, whichTower);
					if(towerDistance < 6){
						amIUnderTower = true;
						break;
					}
				}
				if(!amIUnderTower){
					return amIUnderTower;
				}//else I am under enemy tower
				if(AI.HP.DIFFERENCE < 0){
					return amIUnderTower;//i took damage under tower
				}
				var allEnemies = AI.ENEMY_ARMY.concat(AI.ENEMY_MOBS.concat(AI.ENEMY_HEROES));
				allEnemies = allEnemies.filter(function(oneEnemy){
					return unitDistance(oneEnemy, oneUnit) < 6;
				});
				return allEnemies.length;
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
				var defaultPosition = AI.MAP.MY.TOWER2_TOP;
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
				if(AI.RUNE_AVAILABLE){
					return findClosestRunePosition();
				}
				if(AI.AM_I_TEAM_LEADER){
					return AI.POSITION_BEHIND_MOBS;
				}
				//if(AI.LEADER_HERO){
				//	return {x: AI.LEADER_HERO.getX(), y: AI.LEADER_HERO.getY()};
				//}
				return AI.POSITION_BEHIND_MOBS;
			}
			function measureNearestEnemyDistance(){
				if(!AI.HERO){
					return 100;
				}
				var allEnemies = AI.ENEMY_HEROES.concat(AI.ENEMY_ARMY).concat(AI.ENEMY_MOBS);
				var smallestDistance = 100;
				for(var i = 0, max = allEnemies.length; i < max; i++){
					var oneEnemy = allEnemies[i];
					var hisDistance = unitDistance(AI.HERO, oneEnemy);
					if(hisDistance < smallestDistance){
						smallestDistance = hisDistance;
					}
				}
				return smallestDistance;
			}
			function findAllyClosestToEnemy(){
				if(!AI.ENEMY_HEROES || !AI.ENEMY_HEROES.length){
					return;
				}
				var myHeroes = [];
				if(AI.HERO){
					myHeroes.push(AI.HERO);
				}
				if(AI.ALLY_HEROES && AI.ALLY_HEROES.length){
					myHeroes = myHeroes.concat(AI.ALLY_HEROES);
				}
				if(!myHeroes.length){
					return;
				}
				var vanguard = {
					tank: undefined,
					enemy: undefined,
					distance : 100
				};
				for(var i = AI.ENEMY_HEROES.length - 1; i >= 0; i--) {
					var oneEnemy = AI.ENEMY_HEROES[i];
					for(var j = myHeroes.length - 1; j >= 0; j--) {
						var oneHero = myHeroes[j];
						var theirDistance = unitDistance(oneEnemy, oneHero);
						if(theirDistance < vanguard.distance){
							vanguard.tank = oneHero;
							vanguard.enemy = oneEnemy;
							vanguard.distance = theirDistance;
						}
					}
				}
				vanguard.myDistance = (AI.HERO) ? unitDistance(vanguard.tank, AI.HERO) : 100;
				return vanguard;
			}
			function findMobsAroundMe(){
				var mobs = {ally:[],enemy:[]};
				if(!AI.HERO){
					return mobs;
				}
				mobs.ally = AI.ALLY_MOBS.filter(function(allyMob){
					return unitDistance(allyMob, AI.HERO) < 4.5;
				});
				mobs.enemy = AI.ENEMY_MOBS.filter(function(enemyMob){
					return unitDistance(enemyMob, AI.HERO) < 4.5;
				});
				return mobs;
			}
			function findClosestRunePosition(){
				if(!AI.HERO){
					return AI.MAP.RUNE.bot;
				}
				var sides = ['top','bot'];//,'mid'
				var minDistance = 100;
				var bestSide = 'top';
				for(var i = 0, max = sides.length; i < max; i++){
					var sideLocation = AI.MAP.RUNE[sides[i]];
					var heroDistance = distance(AI.HERO.getX(), AI.HERO.getY(), sideLocation.x, sideLocation.y);
					if(heroDistance < minDistance){
						bestSide = 	sides[i];
						minDistance = heroDistance;
					}
				}
				return AI.MAP.RUNE[bestSide];
			}
			function runeCloseToHero(){
				if(!AI.HERO || !AI.RUNES){
					return;
				}
				var closeRunes = AI.RUNES.filter(function(oneRune){
					return unitDistance(AI.HERO, oneRune) < 12;
				});
				if(closeRunes && closeRunes.length){
					return closeRunes[0];
				}
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
				if(AI.STAGE == 'ALL LOADED'){
					rallyTownCenterToGoldMine();
				}
				if(AI.LOW_ON_HP || AI.HERO_UNDER_ENEMY_TOWER ){
					runToHealUp();
					return;
				}
				if(AI.ENEMY_CLOSE_TO_ME){
					teamFight();
				}else{
					attack(AI.POSITION_TO_ATTACK);
				}
				recruit();
				mineGold();
			}
			/******************* LIST OF ACTIONS *****************/
			function chooseCharacter(){
				if(AI.HERO){
					return;
				}
				scope.order(AI.HERO_NAME.replace('...','zz').replace('.','zz'), AI.CHOOSE);
			}
			function rallyTownCenterToGoldMine(){
				scope.order("Move", [AI.TOWN], {unit: AI.CLOSEST_GOLD_MINE});
			}
			function runToHealUp(){
				if(!AI.HERO){
					return;
				}
				if(AI.HERO_NAME == ".Mage Hero"){
					var teleport = AI.HERO_INFO.abilities[2];
					if(canCastAbility(teleport)){
						scope.order(teleport.name, [AI.HERO], AI.MAP.MY.HEAL);
						scope.order("Move", [AI.HERO], AI.MAP.MY.HEAL, {shift:true});
						AI.HERO_INFO.abilities[2].lastTime = AI.TIME_NOW;
					}else{
						splitAndMoveArmy(AI.MAP.MY.HEAL, [AI.HERO]);
					}
				}else if(AI.HERO_NAME == ".Herald Hero"){
					var speed = AI.HERO_INFO.abilities[1];
					if(canCastAbility(speed)){
						scope.order(speed.name, [AI.HERO]);
						scope.order("Move", [AI.HERO], AI.MAP.MY.HEAL, {shift:true});
						AI.HERO_INFO.abilities[1].lastTime = AI.TIME_NOW;
					}else{
						splitAndMoveArmy(AI.MAP.MY.HEAL, [AI.HERO]);
					}
				}else if(AI.HERO_NAME == "...Eclipse Hero"){
					var blink = AI.HERO_INFO.abilities[1];
					var selfHeal = AI.HERO_INFO.abilities[3];
					if(canCastAbility(blink)){
						var blinkLocation = {x: AI.HERO.getX(), y: AI.HERO.getY()};
						blinkLocation.x += (AI.ON_LEFT) ? -4 : 4 ;
						castToArea(blink.name, AI.HERO, blinkLocation);
						scope.order("Move", [AI.HERO], AI.MAP.MY.HEAL, {shift:true});
						AI.HERO_INFO.abilities[1].lastTime = AI.TIME_NOW;
					}else if(canCastAbility(selfHeal)){
						scope.order(selfHeal.name, [AI.HERO], {unit: AI.HERO});
						scope.order("Move", [AI.HERO], AI.MAP.MY.HEAL, {shift:true});
						AI.HERO_INFO.abilities[3].lastTime = AI.TIME_NOW;
					}else{
						splitAndMoveArmy(AI.MAP.MY.HEAL, [AI.HERO]);
					}
				}else{
					splitAndMoveArmy(AI.MAP.MY.HEAL, [AI.HERO]);
				}
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
			function teamFight(){
				if(AI.MY_ARMY && AI.MY_ARMY.length){
					try{
						attackThroughCheckpoints(AI.MY_ARMY, AI.ENEMY_CLOSE_TO_ME.unit);
					}catch(Pokemon){
						console.log('attackThroughCheckpoints failed');
						console.log(Pokemon);
					}
				}
				if(AI.HERO_NAME == ".Herald Hero"){
					return heraldTeamFight();
				}
				if(AI.HERO && AI.ENEMY_CLOSE_TO_ME){
					var castedAbility = AI.HERO_INFO.act();
					var heroOrder = (AI.ENEMY_CLOSE_TO_ME.distance > 6) ? "Move" : "AMove";
					if(castedAbility){
						scope.order(heroOrder, [AI.HERO], AI.ENEMY_CLOSE_TO_ME.unit, {shift:true});
					}else{
						scope.order(heroOrder, [AI.HERO], AI.ENEMY_CLOSE_TO_ME.unit);
					}
				}
			}
			function attackThroughCheckpoints(army, targetUnit){
				var TARGET_BONUS = 7;
				var targetX = targetUnit.getX();
				var checkpoints = AI.ON_BOT ? AI.MAP.CHECKPOINTS.bot : AI.MAP.CHECKPOINTS.top;
				var directlyAttacking = [];
				var checkpointedUnits = {};
				army.forEach(function(oneUnit){
					var unitX = oneUnit.getX();
					var goingRight = unitX < targetX;
					var goodCheckpoints = checkpoints.filter(function(oneCheckpoint){
						if(goingRight){
							return (oneCheckpoint.x - TARGET_BONUS > unitX) && (oneCheckpoint.x + TARGET_BONUS < targetX);
						}
						return (oneCheckpoint.x + TARGET_BONUS < unitX) && (oneCheckpoint.x - TARGET_BONUS > targetX);
					});
					if(!goodCheckpoints.length){
						directlyAttacking.push(oneUnit);
						return;
					}
					var bestCheckpoint = goingRight ? goodCheckpoints[0] : goodCheckpoints[goodCheckpoints.length - 1];
					if(!checkpointedUnits[JSON.stringify(bestCheckpoint)]){
						checkpointedUnits[JSON.stringify(bestCheckpoint)] = [];
					}
					checkpointedUnits[JSON.stringify(bestCheckpoint)].push(oneUnit);
				});
				Object.keys(checkpointedUnits).forEach(function(oneCheckpoint){
					scope.order("AMove", checkpointedUnits[oneCheckpoint], JSON.parse(oneCheckpoint));
				});
				if(directlyAttacking.length){
					scope.order("Attack", directlyAttacking, {unit: targetUnit});
				}
			}
			function heraldTeamFight(){
				if(!AI.HERO){
					return;
				}
				var castedAbility = AI.HERO_INFO.act();
				if(castedAbility){
					return;
				}
				if(!AI.ALLY_HEROES.length){
					scope.order("Move", [AI.HERO], AI.MAP.MY.NEXUS);
					return;
				}
				var lowestHpHero = AI.ALLY_HEROES[0];
				if(AI.ALLY_HEROES.length == 1){
					scope.order("Attack", [AI.HERO], {unit: lowestHpHero});
					return;
				}
				var nextHero = AI.ALLY_HEROES[1];
				if(lowestHpHero.getCurrentHP() > nextHero.getCurrentHP()){
					lowestHpHero = nextHero;
				}
				scope.order("Attack", [AI.HERO], {unit: lowestHpHero});
			}
			function attack(position){
				if(AI.MY_ARMY && AI.MY_ARMY.length){
					splitAndMoveArmy(position, AI.MY_ARMY);
				}
				if(AI.HERO_NAME == ".Herald Hero"){
					return heraldAttack(position);
				}
				if(AI.HERO){
					var castedAbility = AI.HERO_INFO.act();
					if(AI.CAN_ATTACK_RUNE){
						scope.order("Attack", [AI.HERO], {unit: AI.CAN_ATTACK_RUNE});
						AI.RUNE_ATTACKED = true;
						return;
					}
					splitAndMoveArmy(position, [AI.HERO], castedAbility);
				}
			}
			function splitAndMoveArmy(position, army, castedAbility){
				var attackingUnits = [];
				var movingUnits = [];
				var checkpointingUnits = {};
				for(var i = 0, max = army.length; i < max; i++){
					var oneUnit = army[i];
					var hisDistance = distance(oneUnit.getX(), oneUnit.getY(), position.x, position.y);
					if(hisDistance < 8){
						attackingUnits.push(oneUnit);
					}else if(hisDistance < 16){
						movingUnits.push(oneUnit);
					}else{
						var hisCheckpoint = findCheckpoint(position, oneUnit);
						if(!checkpointingUnits[hisCheckpoint]){
							checkpointingUnits[hisCheckpoint] = [];
						}
						checkpointingUnits[hisCheckpoint].push(oneUnit);
					}
				}
				if(attackingUnits.length){
					scope.order("AMove", attackingUnits, position);
				}
				if(movingUnits.length){
					scope.order("Move", movingUnits, position);
				}
				var CPs = Object.keys(checkpointingUnits);
				if(CPs.length){
					CPs.forEach(function(oneCP){
						var positionOfCheckpoint = JSON.parse(oneCP);
						var unitsToMove = checkpointingUnits[oneCP];
						scope.order("Move", unitsToMove, positionOfCheckpoint);
					});
				}
			}
			function findCheckpoint(position, oneUnit){
				var unitX = oneUnit.getX();
				var targetX = position.x;
				var goingRight = unitX < targetX;
				var checkpoints = AI.ON_BOT ? AI.MAP.CHECKPOINTS.bot : AI.MAP.CHECKPOINTS.top;
				var TARGET_BONUS = 6;
				var goodCheckpoints = checkpoints.filter(function(oneCheckpoint){
					if(goingRight){
						return (unitX < oneCheckpoint.x - TARGET_BONUS) && (targetX > oneCheckpoint.x + TARGET_BONUS);
					}
					return (unitX > oneCheckpoint.x + TARGET_BONUS) && (targetX < oneCheckpoint.x - TARGET_BONUS);
				});
				if(!goodCheckpoints.length){
					return JSON.stringify(position);
				}
				var bestCheckpoint = goingRight ? goodCheckpoints[0] : goodCheckpoints[goodCheckpoints.length - 1];
				if(!bestCheckpoint){
					var errorMsg = 'ERROR in findCheckpoint = bestCheckpoint is undefined. ';
					errorMsg += 'Position = '+JSON.stringify(position)+', Unit = ['+unitX+','+oneUnit.getY()+'].\n';
					errorMsg += 'goodCheckpoints = '+JSON.stringify(goodCheckpoints);
					console.log(errorMsg);
					return JSON.stringify(position);
				}
				return JSON.stringify(bestCheckpoint);
			}
			function heraldAttack(position){
				if(!AI.HERO){
					return;
				}
				var castedAbility = AI.HERO_INFO.act();
				if(castedAbility){
					return;
				}
				if(AI.CAN_ATTACK_RUNE){
					scope.order("Attack", [AI.HERO], {unit: AI.CAN_ATTACK_RUNE});
					return;
				}
				var heroDistance = distance(AI.HERO.getX(), AI.HERO.getY(), position.x, position.y);
				if(heroDistance > 6){
					scope.order("Move", [AI.HERO], position);
					return;
				}
				var injuredMobs = AI.MOBS_AROUND_ME.ally.filter(function(oneMob){
					return oneMob.getCurrentHP() < 100;
				});
				if(injuredMobs.length){
					scope.order("Attack", [AI.HERO], {unit: injuredMobs[0]});
					return;
				}/*towers get more damaged than healed, so do NOT heal them
				var closeTowers = AI.ALLY_TOWERS.filter(function(oneTower){
					return unitDistance(oneTower, AI.HERO) < 4.5 && oneTower.getCurrentHP() < 700;
				});
				if(closeTowers.length){
					scope.order("Attack", [AI.HERO], {unit: closeTowers[0]});
					return;
				}*/
				scope.order("Move", [AI.HERO], position);
			}
			/********** RECRUIT / MINE *************/
			function recruit(){
				if(AI.SUPPLY >= 5 && AI.GOLD >= 175){
					AI.GOLD -= 175;
					AI.SUPPLY -= 5;
					scope.order(".Recruit Protector", AI.CENTER);
				}
				if(AI.SUPPLY >= 10 && AI.GOLD >= 115){
					AI.GOLD -= 115;
					AI.SUPPLY -= 5;
					scope.order(".Recruit Cleric", AI.CENTER);
				}
				if(AI.SUPPLY > 1 && AI.MY_WORKERS.length < 1 && AI.GOLD >= 50){
					AI.GOLD -= 50;
					AI.SUPPLY--;
					scope.order(".Recruit Gatherer", [AI.TOWN]);
				}
			}
			function mineGold(){
				if(!AI.CLOSEST_GOLD_MINE || !AI.MY_WORKERS || !AI.MY_WORKERS.length){
					return;
				}
				var idleWorkers = AI.MY_WORKERS.filter(function(oneWorker){
					return oneWorker.getCurrentOrderName() == "Stop";
				});
				if(idleWorkers.length){
					scope.order("Mine", idleWorkers, {unit: AI.CLOSEST_GOLD_MINE});
				}
			}
			/********** ABILITIES *************/
			function castToArea(orderName, unit, location){
				var command = scope.getCommandFromCommandName(orderName);
				var targetField = new Field(location.x, location.y, true);
				game.issueOrderToUnits2([unit.unit], command, targetField);
			}
			function canCastAbility(currentAbility){
				if(!AI.HERO){
					return false;
				}
				var cooldownReady = (currentAbility.lastTime + currentAbility.cooldown < AI.TIME_NOW);
				var enoughMana = (!currentAbility.cost || (currentAbility.cost < AI.HERO.unit.mana));
				return cooldownReady && enoughMana;
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
