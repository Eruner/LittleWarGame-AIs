/*
	Map = AnarKings
	Bot = plays as random hero

	Features:
	- picks random hero
	- goes to lane
	- hides behind lane mobs/creeps
	- uses abilities
	- buys and uses ultimate abilities
	- tries to heal up when low on hp
	- grabs top Rune
	- recruits 7 workers
	- recruits Berserkers and Arbalists
	- pushes towers and nexus
	- switches between top and bot lane
	- summons Boss

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
				AI = { ALLY:{}, ENEMY:{}, MY:{}, RUNE:{}};
				AI.me = scope.getMyPlayerNumber();
				AI.teamNumber = scope.getMyTeamNumber();
				AI.team = (AI.teamNumber == 1) ? 'left' : 'right';
				AI.enemyTeamNumber = (AI.teamNumber == 1) ? 4 : 1;
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
				//AI.HERO_NAME = "...Eclipse Hero";
				AI.HERO_NAME = AI.HERO_NAMES[Math.floor(Math.random()*AI.HERO_NAMES.length)];
				AI.LEVEL = 0;
				AI.HEALED = true;
				AI.HP = {
					PREVIOUS : 0,
					CURRENT : 0,
					DIFFERENCE : 0,
					BONUS : 0
				};
				AI.LAPUTA = {
					burst:{
						name:".Hellfire",
						cost:1,
						cooldown:15,
						lastTime:0,
						description:"small aoe dot"
					},
					aoe:{
						name:".Brimstone",
						range:5,
						cooldown:20,
						lastTime:0,
						description:"big aor dmg"
					},
					slow:{
						name:".Ash",
						range:4,
						cooldown:30,
						lastTime:0,
						description:"slowdown aoe"
					}
				};
				AI.STRATEGY = {
					US: 0,
					THEM: 0,
					OUR_COMPOSITION:{},
					THEIR_COMPOSITION:{}
				};
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
				AI.MAP.RUNE = {
					'top':{x:100,y:7},
					'mid':{x:100,y:50},
					'bot':{x:100,y:96}
				};
				AI.MAP.CHECKPOINTS = {
					top:[{x:32,y:50},{x:52,y:31},{x:82,y:31},{x:118,y:31},{x:148,y:31},{x:168,y:50}],
					bot:[{x:32,y:50},{x:52,y:69},{x:82,y:69},{x:118,y:69},{x:148,y:69},{x:168,y:50}]
				};
				AI.WHERE_TO_PUSH_TO_SWITCH_LANE = (AI.ON_LEFT) ? [121,121,151] : [79,79,49];
				AI.LAST_LANE_SWITCH = -40;
				AI.LANE_SWITCH_DURATION = 30;
			}
			function loadTeamLeader(){
				AI.LEADER = AI.me;
				var allPlayers = game.players;
				for(var i = 0, max = allPlayers.length; i < max; i++){
					var onePlayer = allPlayers[i];
					if(!onePlayer){
						continue;
					}
					if(onePlayer.team.number != AI.teamNumber){
						AI.STRATEGY.THEM++;
						continue;
					}
					AI.STRATEGY.US++;
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
						},{
							name:".Unyielding",
							cooldown:70,
							duration:15,
							cost:0,
							lastTime:0,
							range:1,
							description:"HP + Regen + slow self, inspire others"
						}],
						hp:400,
						hp_lv:25,
						isRanged:false,
						ults:[{
							buy:250,
							research:".Ultimate Choose Unyielding"
						}],
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
							var megazord = AI.HERO_INFO.abilities[2];
							if(!AI.HERO_INFO.ults.length && canCastAbility(megazord) && AI.ENEMY_TO_KITE){
								scope.order(megazord.name, [AI.HERO], {unit: AI.HERO});
								AI.HERO_INFO.abilities[2].lastTime = AI.TIME_NOW;
								return true;
							}
						}
					},
					".Sharpshooter Hero":{
						abilities:[{
							name:".Mark of Pride",
							cooldown:10,
							lastTime:0,
							range:30,
							description:"dmg target area"
						},{
							name:".Hit the Knees",
							cooldown:13,
							lastTime:0,
							range:7,
							description:"dmg target area"
						},{
							name:".One in the Quiver",
							cooldown:55,
							lastTime:0,
							range:15,
							description:"dmg everything in this direction"
						}],
						hp:300,
						hp_lv:15,
						isRanged:true,
						ults:[{
							buy:250,
							research:".Ultimate One in the Quiver"
						}],
						act:function(){
							if(AI.CHANNELING){
								AI.CHANNELING = false;
								return true;
							}
							if(AI.ENEMY_TO_KITE && AI.KITE_LOCATION){
								//scope.order("Move", [AI.HERO], AI.MAP.MY.NEXUS);
								scope.order("Move", [AI.HERO], AI.KITE_LOCATION);
								return true;
							}
							var mark = AI.HERO_INFO.abilities[0];
							if(AI.ENEMY_HERO_ON_SAME_SPOT && canCastAbility(mark)){
								castToArea(mark.name, AI.HERO, AI.ENEMY_HERO_ON_SAME_SPOT);
								AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
								return true;
							}
							var knees = AI.HERO_INFO.abilities[1];
							if(AI.ENEMY_CLOSE_TO_ME && canCastAbility(knees)){
								castToArea(knees.name, AI.HERO, {x: AI.ENEMY_CLOSE_TO_ME.unit.getX(),y: AI.ENEMY_CLOSE_TO_ME.unit.getY()});
								AI.HERO_INFO.abilities[1].lastTime = AI.TIME_NOW;
								return true;
							}
							if(AI.CLOSEST_ENEMY && AI.CLOSEST_ENEMY_DISTANCE < 3.5){
								scope.order("Move", [AI.HERO], AI.MAP.MY.NEXUS);
								return true;
							}
							var laser = AI.HERO_INFO.abilities[2];
							if(!AI.HERO_INFO.ults.length && AI.ENEMY_HERO_ON_SAME_SPOT && canCastAbility(laser)){
								AI.CHANNELING = true;
								castToArea(laser.name, AI.HERO, AI.ENEMY_HERO_ON_SAME_SPOT);
								AI.HERO_INFO.abilities[2].lastTime = AI.TIME_NOW;
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
						ults:[{
							buy:250,
							research:".Ultimate Choose Arcane Aura"
						}],
						act:function(){
							if(AI.ENEMY_TO_KITE && AI.KITE_LOCATION){
								//scope.order("Move", [AI.HERO], AI.MAP.MY.NEXUS);
								scope.order("Move", [AI.HERO], AI.KITE_LOCATION);
								return true;
							}
							var flames = AI.HERO_INFO.abilities[0];
							if(AI.ENEMY_TO_ATTACK && canCastAbility(flames)){
								castToArea(flames.name, AI.HERO, {x: AI.ENEMY_CLOSE_TO_ME.unit.getX(),y: AI.ENEMY_CLOSE_TO_ME.unit.getY()});
								AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
								scope.order("Move", [AI.HERO], AI.MAP.MY.NEXUS, {shift:true});
								return true;
							}
							if(AI.CLOSEST_ENEMY && AI.CLOSEST_ENEMY_DISTANCE < 3.5){
								scope.order("Move", [AI.HERO], AI.MAP.MY.NEXUS);
								return true;
							}
							var firelink = AI.HERO_INFO.abilities[1];
							if(canCastAbility(firelink) && AI.CLOSEST_ENEMY && AI.CLOSEST_ENEMY_DISTANCE < 7.5){
								castToArea(firelink.name, AI.HERO, {x: AI.CLOSEST_ENEMY.getX(), y: AI.CLOSEST_ENEMY.getY()});
								AI.HERO_INFO.abilities[1].lastTime = AI.TIME_NOW;
								return true;
							}
							if(!AI.HERO_INFO.ults.length && canCastAbility(flames) && AI.HERO.unit.mana >= 150 && AI.CLOSEST_ENEMY && AI.CLOSEST_ENEMY_DISTANCE < 6.5){
								castToArea(flames.name, AI.HERO, {x: AI.CLOSEST_ENEMY.getX(), y: AI.CLOSEST_ENEMY.getY()});
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
						},{
							name:".The World Machine",
							cooldown:60,
							cost:0,
							lastTime:0,
							duration:15,
							range:2,
							description:"buff self, speed dmg"
						}],
						hp:250,
						hp_lv:20,
						isRanged:false,
						ults:[{
							buy:250,
							research:".Ultimate Choose Entify"
						}],
						act:function(){
							//Pancake
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
							//Keep healing ally
							var singleHeal = AI.HERO_INFO.abilities[0];
							if(AI.INJURED_ALLY_HERO && canCastAbility(singleHeal)){
								castToArea(singleHeal.name, AI.HERO, {x: AI.INJURED_ALLY_HERO.getX(),y: AI.INJURED_ALLY_HERO.getY()});
								AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
								return true;
							}
							//Molotov
							var aoeDmg = AI.HERO_INFO.abilities[4];
							if(AI.ENEMY_TO_KITE && AI.KITE_LOCATION && AI.ENEMY_CLOSE_TO_ME && canCastAbility(aoeDmg)){
								castToArea(aoeDmg.name, AI.HERO, {x: AI.ENEMY_CLOSE_TO_ME.unit.getX(),y: AI.ENEMY_CLOSE_TO_ME.unit.getY()});
								//scope.order("Move", [AI.HERO], AI.KITE_LOCATION, {shift:true});
								AI.HERO_INFO.abilities[4].lastTime = AI.TIME_NOW;
								return true;
							}
							var miniDmg = AI.HERO_INFO.abilities[3];
							if(canCastAbility(miniDmg) && AI.CLOSEST_ENEMY && AI.CLOSEST_ENEMY_DISTANCE < 4.5){
								castToArea(miniDmg.name, AI.HERO, {x: AI.CLOSEST_ENEMY.getX(), y: AI.CLOSEST_ENEMY.getY()});
								//scope.order("Move", [AI.HERO], AI.KITE_LOCATION, {shift:true});
								AI.HERO_INFO.abilities[3].lastTime = AI.TIME_NOW;
								return true;
							}
							if(canCastAbility(singleHeal) && AI.INJURED_ALLY_ARMY_MOB && AI.INJURED_ALLY_ARMY_MOB.distance < 4.5){
								castToArea(singleHeal.name, AI.HERO, {x: AI.INJURED_ALLY_ARMY_MOB.getX(),y: AI.INJURED_ALLY_ARMY_MOB.getY()});
								AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
								return true;
							}
							var machine = AI.HERO_INFO.abilities[6];
							if(AI.ENEMY_TO_KITE && AI.KITE_LOCATION){
								if(!AI.HERO_INFO.ults.length && canCastAbility(machine)){
									scope.order(machine.name, [AI.HERO], {unit: AI.HERO});
									scope.order("Attack", [AI.HERO], {x: AI.HERO.getX(), y: AI.HERO.getY()}, {shift: true});
									AI.HERO_INFO.abilities[6].lastTime = AI.TIME_NOW;
								}else{
									scope.order("Move", [AI.HERO], AI.KITE_LOCATION);
								}
								return true;
							}
							if(AI.CLOSEST_ENEMY && AI.CLOSEST_ENEMY_DISTANCE < 3){
								scope.order("Move", [AI.HERO], AI.MAP.MY.NEXUS);
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
							description:"dmg slow target"
						},{
							name:".A Shackle Broken",
							cooldown:10,
							lastTime:0,
							cost:15,
							range:1,
							description:"dmg target"
						},{
							name:".Burden to Bear",
							cooldown:30,
							lastTime:0,
							range:1,
							description:"transform to werewolf, mana drain"
						},{
							name:".Free Yourself",
							cooldown:10,
							cost:0,
							lastTime:0,
							range:1,
							description:"transform back to default character"
						},{
							name:".Nights Beckon",
							cooldown:9,
							cost:5,
							lastTime:0,
							range:2.8,
							description:"aoe dmg smash when transformed"
						},{
							name:".No Salvation",
							cooldown:16,
							cost:5,
							lastTime:0,
							range:1,
							description:"1v1 locked duel when transformed"
						},{
							name:".The Beast Within",
							cooldown:10,
							duration:5,
							lastTime:0,
							cost:5,
							range:1,
							description:"transform to fast wolf when transformed"
						}],
						hp:400,
						hp_lv:10,
						isRanged:false,
						ults:[{
							buy:250,
							research:".Ultimate Choose Burdento Bear"
						}],
						act:function(){
							var daybreak = AI.HERO_INFO.abilities[0];
							var shackle = AI.HERO_INFO.abilities[1];
							var toWW = AI.HERO_INFO.abilities[2];
							var toNormal = AI.HERO_INFO.abilities[3];
							var smash = AI.HERO_INFO.abilities[4];
							var duel = AI.HERO_INFO.abilities[5];
							if(!AI.CHANNELING){
								if(!AI.ENEMY_CLOSE_TO_ME || AI.ENEMY_CLOSE_TO_ME.distance > 5.5){
									return false;
								}
								if(AI.ENEMY_CLOSE_TO_ME.distance > 3){
									scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit});
									return true;
								}
								if(canCastAbility(daybreak)){
									scope.order(daybreak.name, [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit});
									scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit}, {shift:true});
									AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
									return true;
								}
								if(canCastAbility(shackle)){
									scope.order(shackle.name, [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit});
									scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit}, {shift:true});
									AI.HERO_INFO.abilities[1].lastTime = AI.TIME_NOW;
									return true;
								}
								if(!AI.HERO_INFO.ults.length && canCastAbility(toWW)){
									AI.CHANNELING = true;
									scope.order(toWW.name, [AI.HERO], {unit: AI.HERO});
									scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit}, {shift:true});
									AI.HERO_INFO.abilities[2].lastTime = AI.TIME_NOW;
									return true;
								}
								//Default = fight enemy hero
								scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit});
								return true;
							}else{//wolf form
								if(!AI.ENEMY_CLOSE_TO_ME && canCastAbility(toNormal) && AI.HERO_INFO.abilities[5].lastTime + 5 < AI.TIME_NOW){
									AI.CHANNELING = false;
									scope.order(toNormal.name, [AI.HERO], {unit: AI.HERO});
									AI.HERO_INFO.abilities[3].lastTime = AI.TIME_NOW;
									return true;
								}
								if(AI.RANGE.KITE.length > 1 && canCastAbility(smash) && AI.HERO_INFO.abilities[5].lastTime + 3 < AI.TIME_NOW){
									scope.order(smash.name, [AI.HERO], {unit: AI.HERO});
									AI.HERO_INFO.abilities[4].lastTime = AI.TIME_NOW;
									return true;
								}
								if(AI.ENEMY_CLOSE_TO_ME.distance < 4 && canCastAbility(duel)){
									scope.order(duel.name, [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit});
									AI.HERO_INFO.abilities[5].lastTime = AI.TIME_NOW;
									return true;
								}
								if(AI.ENEMY_CLOSE_TO_ME.distance < 4 && duel.lastTime + 5 >= AI.TIME_NOW){
									scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit});
									return true;
								}
								if(AI.ENEMY_CLOSE_TO_ME){
									scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit});
								}
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
						},{
							name:".Life Gives",
							cooldown:70,
							cost:0,
							lastTime:0,
							range:5,
							description:"aoe hp regen"
						},{
							name:".Life Takes",
							cooldown:75,
							cost:0,
							lastTime:0,
							range:5,
							description:"aoe dot"
						}],
						hp:300,
						hp_lv:20,
						ults:[{
							buy:250,
							research:".Ultimate Choose Life Gives"
						},{
							buy:250,
							research:".Ultimate Choose Life Takes"
						}],
						isRanged:true,
						act:function(){
							var aoeHeal = AI.HERO_INFO.abilities[3];//5 second channel
							var aoeDmg = AI.HERO_INFO.abilities[4];//5 second channel
							if(AI.CHANNELING && (AI.HERO_INFO.abilities[3].lastTime +5 >= AI.TIME_NOW || AI.HERO_INFO.abilities[4].lastTime +5 >= AI.TIME_NOW)){
								return true;
							}
							if(AI.ENEMY_CLOSE_TO_ME && AI.ENEMY_CLOSE_TO_ME.distance < 6 && AI.MY.WOLF && AI.MY.WOLF.length){
								scope.order("Attack", AI.MY.WOLF, {unit: AI.ENEMY_CLOSE_TO_ME.unit});
							}
							if(AI.CLOSEST_ENEMY && AI.CLOSEST_ENEMY_DISTANCE < 3.5){
								scope.order("Move", [AI.HERO], AI.MAP.MY.NEXUS);
								return true;
							}
							var summon = AI.HERO_INFO.abilities[1];
							if((!AI.MY.WOLF || !AI.MY.WOLF.length) && canCastAbility(summon)){
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
							if(AI.MY.WOLF && AI.MY.WOLF.length && AI.MY.WOLF[0] && AI.MY.WOLF[0].getCurrentHP() < 180 && canCastAbility(ward)){
								castToArea(ward.name, AI.HERO, {x: AI.MY.WOLF[0].getX(),y: AI.MY.WOLF[0].getY()});
								AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
								return true;
							}
							if(AI.HERO_INFO.ults.length < 2 && canCastAbility(ward) && AI.VANGUARD_ALLY && AI.VANGUARD_ALLY.distance < 2 && AI.VANGUARD_ALLY.tank.distance < 5){
								castToArea(aoeHeal.name, AI.HERO, {x: AI.HERO.getX(),y: AI.HERO.getY()});
								AI.HERO_INFO.abilities[3].lastTime = AI.TIME_NOW;
								AI.CHANNELING = true;
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
						},{
							name:".Skies Fall",
							cooldown:120,
							cost:0,
							lastTime:0,
							range:1,
							description:"Summon Flying Fortress"
						}],
						hp:225,
						hp_lv:10,
						ults:[{
							buy:250,
							research:".Ultimate Choose Skies Fall"
						}],
						isRanged:true,
						act:function(){
							if(AI.ENEMY_TO_KITE && AI.KITE_LOCATION){
								scope.order("Move", [AI.HERO], AI.KITE_LOCATION);
								if(AI.CHANNELING){
									AI.CHANNELING = false;
									AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
								}
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
							var summonLaputa = AI.HERO_INFO.abilities[2];
							if(!AI.HERO_INFO.ults.length && !AI.MY.LAPUTA.length && canCastAbility(summonLaputa)){
								scope.order(summonLaputa.name, [AI.HERO], {x: AI.HERO.getX(), y: AI.HERO.getY()});
								AI.HERO_INFO.abilities[2].lastTime = AI.TIME_NOW;
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
						},{
							name:".New Moon",
							cooldown:80,
							cost:0,
							lastTime:0,
							range:1,
							description:"aoe eclipse buff"
						}],
						hp:255,
						hp_lv:15,
						ults:[{
							buy:250,
							research:".Ultimate Choose New Moon"
						}],
						isRanged:false,
						act:function(){
							var shade = AI.HERO_INFO.abilities[2];
							if(AI.ENEMY_CLOSE_TO_ME && AI.ENEMY_CLOSE_TO_ME.distance < 5 && canCastAbility(shade)){
								castToArea(shade.name, AI.HERO, {x: AI.ENEMY_CLOSE_TO_ME.unit.getX(),y: AI.ENEMY_CLOSE_TO_ME.unit.getY()});
								scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit}, {shift:true});
								AI.HERO_INFO.abilities[2].lastTime = AI.TIME_NOW;
								//console.log('Throwing Clone Shade');
								return true;
							}
							var apex = AI.HERO_INFO.abilities[0];
							if(AI.ENEMY_CLOSE_TO_ME && AI.ENEMY_CLOSE_TO_ME.distance < 5 && canCastAbility(apex)){
								castToArea(apex.name, AI.HERO, {x: AI.ENEMY_CLOSE_TO_ME.unit.getX(),y: AI.ENEMY_CLOSE_TO_ME.unit.getY()});
								scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit}, {shift:true});
								AI.HERO_INFO.abilities[0].lastTime = AI.TIME_NOW;
								//console.log('Throwing Dagger');
								return true;
							}
							var shroud = AI.HERO_INFO.abilities[4];
							if(!AI.HERO_INFO.ults.length && AI.ENEMY_CLOSE_TO_ME && AI.ENEMY_CLOSE_TO_ME.distance < 2 && canCastAbility(shroud)){
								castToArea(shroud.name, AI.HERO, {x: AI.ENEMY_CLOSE_TO_ME.unit.getX(),y: AI.ENEMY_CLOSE_TO_ME.unit.getY()});
								scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit}, {shift:true});
								AI.HERO_INFO.abilities[4].lastTime = AI.TIME_NOW;
								//console.log('Hiding in Cloak');
								return true;
							}
							if(AI.ENEMY_CLOSE_TO_ME){
								scope.order("Attack", [AI.HERO], {unit: AI.ENEMY_CLOSE_TO_ME.unit});
								//console.log('Chasing the enemy');
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
				//BUILDINGS
				AI.CHOOSE = scope.getBuildings({type:"..PICK YOUR HERO", player: AI.me, onlyFinshed: true});
				AI.CENTER = scope.getBuildings({type: AI.ON_LEFT ? ".Bar" : ".Crypt", player: AI.me, onlyFinshed: true});
				AI.TOWN = scope.getBuildings({type:".Worker Guild", player: AI.me, onlyFinshed: true})[0];
				//GOLD MINES
				AI.GOLD_MINES = scope.getBuildings({type: ".Box of Gold"});
				AI.CLOSEST_GOLD_MINE = findClosest(AI.GOLD_MINES, AI.TOWN, unitDistance);
				AI.MY_WORKERS = scope.getUnits({type:".Gatherer", player: AI.me});
				//TOWERS
				AI.ALLY.TOWERS = findTowers(AI.teamNumber);
				AI.ENEMY.TOWERS = findTowers(AI.enemyTeamNumber);
				//RUNE
				AI.RUNE.AVAILABLE = isTimeForRune();
				AI.RUNE.SPOTS = scope.getBuildings({type: ".Gold Rune Spawner", onlyFinshed: true});
				AI.RUNE.TOTEMS = scope.getUnits({type: ".Gold Rune"});
				//HEROES
				AI.ALLY.HEROES = findHeroes(AI.teamNumber);
				AI.ENEMY.HEROES = findHeroes(AI.enemyTeamNumber);
				AI.ENEMY.HERO_POSITIONS = rememberEnemyPositions();
				AI.LEADER_HERO = findLeaderHero();
				//MY HERO
				AI.HERO = findOnlyMyHero();
				AI.LEVEL = checkLevel();
				AI.HP = compareHpWithPreviousHp();
				//ARMY
				AI.MY.WOLF = scope.getUnits({type:".Timber", player: AI.me});
				AI.ALLY.ARMY = findArmy(AI.teamNumber);
				AI.ENEMY.ARMY = findArmy(AI.enemyTeamNumber);
				AI.MY.ARMY = findOnlyMyArmy();
				//LAPUTA
				AI.MY.LAPUTA = scope.getUnits({type: ".Laputa", player: AI.me});
				AI.LAPUTA_ENEMY = findClosestHeroToLaputa();
				//MOBS
				AI.ALLY.MOBS = findMobs(AI.teamNumber, AI.ON_LEFT ? [".Footman", ".Bowman"] : [".Spider", ".Slither"]);
				AI.ENEMY.MOBS = findMobs(AI.enemyTeamNumber, AI.ON_LEFT ? [".Spider", ".Slither"] : [".Footman", ".Bowman"]);
				sortUnitsByDistanceFromHero();
				AI.ALLY.MOB_GROUPS = groupMobs(AI.ALLY.MOBS);
				AI.ENEMY.MOB_GROUPS = groupMobs(AI.ENEMY.MOBS);
				AI.CLOSEST_ENEMY_MOB_CENTER = findClosestGroupCenter(AI.ENEMY.MOB_GROUPS);
				AI.CLOSEST_ENEMY_MOB_DISTANCE = distanceToEnemyMobCenter();
			}
			/************** OBSERVE TOWERS ************/
			function findTowers(whichTeamNumber){
				var towerTypes = [".HonorGuard T1", ".FeralGuard T1", ".HonorGuard T2", ".FeralGuard T2", ".HonorGuard T3", ".FeralGuard T3"];
				var allTowers = [];
				for(var i = 0, max = towerTypes.length; i < max; i++){
					allTowers = allTowers.concat(scope.getBuildings({type: towerTypes[i], team : whichTeamNumber, onlyFinshed: true}));
				}
				return allTowers;
			}
			/************** OBSERVE RUNE TIMER ********/
			function isTimeForRune(){
				if((AI.TIME_NOW < 41)){
					return false;//too soon
				}
				if(AI.TIME_NOW % 181 > 38){
					AI.RUNE_ATTACKED = false;
					return false;//not spawning yet
				}
				if(AI.RUNE_ATTACKED && !AI.CAN_ATTACK_RUNE){
					return false;//already claimed
				}
				return true;//yeah, it will spawn
			}
			/************** OBSERVE HEROES ************/
			function findHeroes(whichTeamNumber){
				var allHeroes = [];
				for(var i = 0, max = AI.HERO_NAMES.length; i < max; i++){
					allHeroes = allHeroes.concat(scope.getUnits({type : AI.HERO_NAMES[i], team : whichTeamNumber}));
				}
				return allHeroes;
			}
			function rememberEnemyPositions(){
				var positions = {
					prev:[],
					now:[]
				};
				if(!AI.ENEMY.HERO_POSITIONS){
					return positions;
				}
				positions.prev = AI.ENEMY.HERO_POSITIONS.now;
				positions.now = AI.ENEMY.HEROES.map(function(oneHero){
					return {x: oneHero.getX(), y: oneHero.getY()};
				}).sort(function(a, b){
					if(a.x == b.x){
						return a.y - b.y;
					}else{
						return a.x - b.x;
					}
				});
				return positions;
			}
			function findLeaderHero(){
				for(var i = 0, max = AI.ALLY.HEROES.length; i < max; i++){
					var oneHero = AI.ALLY.HEROES[i];
					if(oneHero.getOwnerNumber() == AI.LEADER){
						return oneHero;
					}
				}
			}
			function findOnlyMyHero(){
				for(var i = AI.ALLY.HEROES.length-1; i >= 0; i--){
					var oneHero = AI.ALLY.HEROES[i];
					if(oneHero.getOwnerNumber() == AI.me){
						return AI.ALLY.HEROES.splice(i, 1)[0];
					}
				}
			}
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
			/************** OBSERVE ARMY **************/
			function findArmy(whichTeamNumber){
				var armyTypes = [".Gyrocraft",".Arbalist",".Berserker",".Cleric",".Catapult",".Golem",".Leyshaper",".Pyroclast",".Knight"];
				armyTypes = armyTypes.concat([".Fireling",".Timber","...Eclipse Clone",".Laputa"]);
				var allUnits = [];
				for(var i = 0, max = armyTypes.length; i < max; i++){
					allUnits = allUnits.concat(scope.getUnits({type: armyTypes[i], team : whichTeamNumber}));
				}
				return allUnits;
			}
			function findOnlyMyArmy(){
				var myUnits = [];
				for(var i = AI.ALLY.ARMY.length-1; i >= 0; i--){
					var oneUnit = AI.ALLY.ARMY[i];
					if(oneUnit.getOwnerNumber() == AI.me){
						myUnits.push(AI.ALLY.ARMY.splice(i,1)[0]);
					}
				}
				if(AI.MY.WOLF && AI.MY.WOLF.length){
					myUnits.push(AI.MY.WOLF[0]);
				}
				return myUnits;
			}
			function findClosestHeroToLaputa(){
				var closest = {
					unit:undefined,
					distance:200
				};
				if(!AI.ENEMY.HEROES.length || !AI.MY.LAPUTA || !AI.MY.LAPUTA.length || !AI.MY.LAPUTA[0]){
					return closest;
				}
				for(var i = 0, max = AI.ENEMY.HEROES.length; i < max; i++){
					var oneEnemyHero = AI.ENEMY.HEROES[i];
					var hisDistance = unitDistance(AI.MY.LAPUTA[0], oneEnemyHero);
					if(hisDistance < closest.distance){
						closest.unit = oneEnemyHero;
						closest.distance = hisDistance;
					}
				}
				return closest;
			}
			/************** OBSERVE MOBS **************/
			function findMobs(whichTeamNumber, mobNames){
				var allMobs = [];
				for(var i = 0, max = mobNames.length; i < max; i++){
					allMobs = allMobs.concat(scope.getUnits({type: mobNames[i], team: whichTeamNumber}));
				}
				return allMobs;
			}
			function sortUnitsByDistanceFromHero(){
				AI.ALLY.ARMY.forEach(measureDistanceToHero);
				AI.ENEMY.ARMY.forEach(measureDistanceToHero);
				AI.MY.ARMY.forEach(measureDistanceToHero);
				AI.ALLY.MOBS.forEach(measureDistanceToHero);
				AI.ENEMY.MOBS.forEach(measureDistanceToHero);
			}
			function measureDistanceToHero(oneUnit){
				if(!oneUnit){
					return;
				}
				if(!AI.HERO){
					oneUnit.distance = 200;
					return;
				}
				oneUnit.distance = unitDistance(oneUnit, AI.HERO);
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
			function findClosestGroupCenter(mobGroups){
				if(!AI.HERO || !mobGroups || !mobGroups.length){
					return;
				}
				var bestCenter;
				var shortestDistance = 200;
				for(var i = 0, max = mobGroups.length; i < max; i++){
					var centerLocation = scope.getCenterOfUnits(mobGroups[0]);
					var centerDistance = positionDistance(AI.HERO, centerLocation);
					if(centerDistance < shortestDistance){
						shortestDistance = centerDistance;
						bestCenter = centerLocation;
					}
				}
				return bestCenter;
			}
			function distanceToEnemyMobCenter(){
				if(!AI.HERO || !AI.CLOSEST_ENEMY_MOB_CENTER){
					return 100;
				}
				return positionDistance(AI.HERO, AI.CLOSEST_ENEMY_MOB_CENTER);
			}
			/**********************************************************/
			/********************** ORIENT ****************************/
			/**********************************************************/
			function orient(){
				AI.STAGE = hasGameStarted();
				AI.LOW_ON_HP = isLowOnHP();
				AI.HERO_UNDER_ENEMY_TOWER = isUnderEnemyTower(AI.HERO);
				AI.ARMY_UNDER_ENEMY_TOWER = areUnderEnemyTower(AI.MY.ARMY);
				//POSITION RELATIVE TO ENEMY HEROES
				AI.VANGUARD_ALLY = findAllyClosestToEnemy();
				AI.ENEMY_DISTANCES = sortEnemiesByDistance();
				AI.RANGE = groupEnemyHeroesByDistances();
				AI.ENEMY_TO_KITE = checkIfEnemyInKiteRange();
				AI.KITE_LOCATION = findBestKiteLocation();
				AI.ENEMY_TO_ATTACK = checkIfEnemyInAttackRange();
				AI.ENEMY_TO_CHASE = checkIfEnemyInChaseRange();
				AI.ENEMY_CLOSE_TO_ME = findClosestEnemy();
				//ARMY AND MOBS
				AI.POSITION_BEHIND_MOBS = findPositionBehindMobs();
				AI.POSITION_TO_ATTACK = findAttackPosition();
				AI.INJURED_ALLY_HERO = findInjuredAllyHeroes();
				AI.INJURED_ALLY_ARMY_MOB = findInjuredAllyUnit();
				AI.CLOSEST_ENEMY = findAnyClosestEnemy();
				AI.CLOSEST_ENEMY_DISTANCE = measureNearestEnemyDistance();
				AI.MOBS_AROUND_ME = findMobsAroundMe();
				//OTHER STRATEGIC THINKING
				AI.CAN_ATTACK_RUNE = runeCloseToHero();
				AI.ALLY_ATTACK_RUNE = runeCloseToAllyHero();
				AI.ALLY_ATACKED_RUNE = maybeAllyAttacksRune();
				AI.NOW_SWITCHING_LANE = switchingInProgress();
				AI.SHOULD_SWITCH_LANE = shouldSwitchLane();
				AI.ENEMY_HERO_ON_SAME_SPOT = whichHeroHasNotMoved();
			}
			/************** ORIENT FUNCTIONS **********/
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
				if(AI.HEALED && (AI.HP.CURRENT < 80 || percentHp < 23) ){
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
				for(var i = 0, max = AI.ENEMY.TOWERS.length; i < max; i++){
					whichTower = AI.ENEMY.TOWERS[i];
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
				var allEnemies = AI.ENEMY.ARMY.concat(AI.ENEMY.MOBS.concat(AI.ENEMY.HEROES));
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
			/************** ORIENT VS ENEMY HEROES ****/
			function findAllyClosestToEnemy(){
				if(!AI.ENEMY.HEROES || !AI.ENEMY.HEROES.length){
					return;
				}
				var myHeroes = [];
				if(AI.HERO){
					myHeroes.push(AI.HERO);
				}
				if(AI.ALLY.HEROES && AI.ALLY.HEROES.length){
					myHeroes = myHeroes.concat(AI.ALLY.HEROES);
				}
				if(!myHeroes.length){
					return;
				}
				var vanguard = {
					tank: undefined,
					enemy: undefined,
					distance : 200
				};
				for(var i = AI.ENEMY.HEROES.length - 1; i >= 0; i--) {
					var oneEnemy = AI.ENEMY.HEROES[i];
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
				vanguard.myDistance = (AI.HERO && vanguard.tank) ? unitDistance(vanguard.tank, AI.HERO) : 200;
				return vanguard;
			}
			function sortEnemiesByDistance(){
				if(!AI.HERO){
					return [];
				}
				var distanceList = [];
				AI.ENEMY.HEROES.forEach(function(oneEnemyHero){
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
			function groupEnemyHeroesByDistances(){
				var groups = {
					KITE : [],
					ATTACK : [],
					CHASE : []
				};
				if(!AI.HERO){
					return groups;
				}
				var KITE_DISTANCE = 5;
				var ATTACK_DISTANCE = 8;
				var CHASE_DISTANCE = 11;
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
			/************** ORIENT KITE LOCATION ******/
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
					tilesCloseToNexus(surroundingTiles);
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
					if(xa <= 1 || xa >= 199){continue;}
					for(var ya = startTile.y - 4; ya <= startTile.y + 4; ya++){
						if(ya <= 1 || ya >= 99){continue;}
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
					var enemyDistanceToTile = 0;
					for(var a = 0, maxA = AI.ENEMY_DISTANCES.length; a < maxA; a++){
						enemyDistanceToTile = positionDistance(AI.ENEMY_DISTANCES[a].unit, oneTile);
						oneTile.value += Math.max(6, enemyDistanceToTile);
					}
					for(var b = 0, maxB = AI.ENEMY.ARMY.length; b < maxB; b++){
						enemyDistanceToTile = positionDistance(AI.ENEMY.ARMY[b], oneTile);
						oneTile.value += Math.max(2, enemyDistanceToTile);
					}
					for(var c = 0, maxC = AI.ENEMY.MOBS.length; c < maxC; c++){
						enemyDistanceToTile = positionDistance(AI.ENEMY.MOBS[c], oneTile);
						oneTile.value += Math.max(1, enemyDistanceToTile);
					}
					for(var d = 0, maxD = AI.ENEMY.TOWERS.length; d < maxD; d++){
						enemyDistanceToTile = positionDistance(AI.ENEMY.TOWERS[d], oneTile);
						if(enemyDistanceToTile < 5){
							oneTile -= 30;
						}else if(enemyDistanceToTile < 6){
							oneTile -= 15;
						}
					}
				}
			}
			function tilesCloseToAllies(allTiles){
				for(var i = 0, max = allTiles.length; i < max; i++){
					var oneTile = allTiles[i];
					var oneAlly;
					var distanceToAlly;
					for(var j = 0, maxJ = AI.ALLY.HEROES.length; j < maxJ; j++){
						oneAlly = AI.ALLY.HEROES[j];
						if(!oneAlly){continue;}
						distanceToAlly = positionDistance(oneAlly, oneTile);
						if(distanceToAlly < 1){
							oneTile.value += -1;
						} else if(distanceToAlly < 4){
							oneTile.value += 8;
						}else if(distanceToAlly < 6){
							oneTile.value += 4;
						}else if(distanceToAlly < 7){
							oneTile.value += 2;
						}else{
							oneTile.value += -1;
						}
					}
					for(var a = 0, maxA = AI.ALLY.ARMY.length; a < maxA; a++){
						oneAlly = AI.ALLY.ARMY[a];
						if(!oneAlly){continue;}
						distanceToAlly = positionDistance(oneAlly, oneTile);
						if(distanceToAlly < 1){
							oneTile.value += -1;
						} else if(distanceToAlly < 4){
							oneTile.value += 1;
						}
					}
					for(var b = 0, maxB = AI.MY.ARMY.length; b < maxB; b++){
						oneAlly = AI.MY.ARMY[b];
						if(!oneAlly){continue;}
						distanceToAlly = positionDistance(oneAlly, oneTile);
						if(distanceToAlly < 1){
							oneTile.value += -1;
						} else if(distanceToAlly < 4){
							oneTile.value += 1;
						}
					}
					for(var c = 0, maxC = AI.ALLY.MOBS.length; c < maxC; c++){
						oneAlly = AI.ALLY.MOBS[c];
						if(!oneAlly){continue;}
						distanceToAlly = positionDistance(oneAlly, oneTile);
						if(distanceToAlly < 1){
							oneTile.value += -1;
						}
					}
				}
			}
			function tilesCloseToNexus(allTiles){
				for(var i = 0, max = allTiles.length; i < max; i++){
					var oneTile = allTiles[i];
					oneTile.value -= distance(AI.MAP.MY.NEXUS.x, AI.MAP.MY.NEXUS.y, oneTile.x, oneTile.y);
				}
			}
			function travelDistanceToTiles(allTiles){
				for(var i = 0, max = allTiles.length; i < max; i++){
					var oneTile = allTiles[i];
					oneTile.cost = positionDistance(AI.HERO, oneTile);
					//oneTile.cost = distance(AI.HERO.getX(), AI.HERO.getY(), oneTile.x, oneTile.y);
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
			/************** ORIENT ENEMY HEROES *******/
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
			/************** ORIENT ARMY / MOBS ********/
			function findPositionBehindMobs(){
				var defaultPosition = AI.MAP.MY.TOWER2_TOP;
				var laneMobs = AI.ALLY.MOB_GROUPS.filter(function(oneGroup){
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
				if(AI.RUNE.AVAILABLE){
					return findClosestRunePosition();
				}
				if(AI.NOW_SWITCHING_LANE){
					return AI.MAP.MY.NEXUS;
				}
				if(AI.AM_I_TEAM_LEADER){
					return AI.POSITION_BEHIND_MOBS;
				}
				//Following player or leader hero
				//if(AI.LEADER_HERO){
				//	return {x: AI.LEADER_HERO.getX(), y: AI.LEADER_HERO.getY()};
				//}
				return AI.POSITION_BEHIND_MOBS;
			}
			function findInjuredAllyHeroes(){
				if(!AI.HERO || !AI.ALLY.HEROES || !AI.ALLY.HEROES.length){
					return;
				}
				AI.POSITION_BEHIND_MOBS = findPositionBehindMobs();
				AI.POSITION_TO_ATTACK = findAttackPosition();
				var injuredHero;
				var minHP = 224;
				var maxDistance = 8;
				var minHpPercent = 80;
				for(var i = 0, max = AI.ALLY.HEROES.length; i < max; i++){
					var oneAllyHero = AI.ALLY.HEROES[i];
					if(oneAllyHero.getCurrentHP() > minHP){
						continue;
					}
					var mobDistance = positionDistance(oneAllyHero, AI.POSITION_BEHIND_MOBS);
					var attackDistace = positionDistance(oneAllyHero, AI.POSITION_TO_ATTACK);
					if(mobDistance > 20 && attackDistace > 20){
						continue;
					}
					var hisDistance = unitDistance(oneAllyHero, AI.HERO);
					if(hisDistance > maxDistance){
						continue;
					}
					var heroName = oneAllyHero.getTypeName();
					var heroInfo = AI.HERO_BRAINS[heroName];
					var heroMaxHp = heroInfo.hp + heroInfo.hp_lv * (oneAllyHero.unit.level - 1);
					var heroHpPercent = oneAllyHero.getCurrentHP() / heroMaxHp;
					if(!injuredHero || minHpPercent > heroHpPercent){
						injuredHero = oneAllyHero;
					}
				}
				return injuredHero;
			}
			function findInjuredAllyUnit(){
				if(!AI.HERO){
					return;
				}
				var injuredSoldiers;
				if(AI.MY.ARMY.length){
					injuredSoldiers = AI.MY.ARMY.filter(function(oneUnit){
						return oneUnit.getCurrentHP() < 100;
					});
					if(injuredSoldiers.length){
						return injuredSoldiers[0];
					}
				}
				if(AI.ALLY.ARMY.length){
					injuredSoldiers = AI.ALLY.ARMY.filter(function(oneUnit){
						return oneUnit.getCurrentHP() < 100;
					});
					if(injuredSoldiers.length){
						return injuredSoldiers[0];
					}
				}
				if(AI.ALLY.MOBS.length){
					injuredSoldiers = AI.ALLY.MOBS.filter(function(oneUnit){
						return oneUnit.getCurrentHP() < 100;
					});
					if(injuredSoldiers.length){
						return injuredSoldiers[0];
					}
				}
			}
			function findAnyClosestEnemy(){
				var allEnemies = AI.ENEMY.HEROES.concat(AI.ENEMY.ARMY).concat(AI.ENEMY.MOBS);
				return findClosest(allEnemies, AI.HERO, unitDistance);
			}
			function measureNearestEnemyDistance(){
				if(!AI.HERO || !AI.CLOSEST_ENEMY){
					return 200;
				}
				return unitDistance(AI.HERO, AI.CLOSEST_ENEMY);
			}
			function findMobsAroundMe(){
				var mobs = {ally:[],enemy:[]};
				if(!AI.HERO){
					return mobs;
				}
				mobs.ally = AI.ALLY.MOBS.filter(function(allyMob){
					return unitDistance(allyMob, AI.HERO) < 4.5;
				});
				mobs.enemy = AI.ENEMY.MOBS.filter(function(enemyMob){
					return unitDistance(enemyMob, AI.HERO) < 4.5;
				});
				return mobs;
			}
			/************** ORIENT OTHER **************/
			function findClosestRunePosition(){
				if(!AI.HERO){
					return AI.MAP.RUNE.bot;
				}
				var sides = ['top','bot'];//,'mid'
				var minDistance = 100;
				var bestSide = 'top';
				for(var i = 0, max = sides.length; i < max; i++){
					var sideLocation = AI.MAP.RUNE[sides[i]];
					var heroDistance = positionDistance(AI.HERO, sideLocation);
					//var heroDistance = distance(AI.HERO.getX(), AI.HERO.getY(), sideLocation.x, sideLocation.y);
					if(heroDistance < minDistance){
						bestSide = 	sides[i];
						minDistance = heroDistance;
					}
				}
				return AI.MAP.RUNE[bestSide];
			}
			function runeCloseToHero(){
				if(!AI.HERO || !AI.RUNE.TOTEMS){
					return;
				}
				var closeRunes = AI.RUNE.TOTEMS.filter(function(oneRune){
					return unitDistance(AI.HERO, oneRune) < 12;
				});
				if(closeRunes && closeRunes.length){
					return closeRunes[0];
				}
			}
			function runeCloseToAllyHero(){
				if(!AI.ALLY.HEROES || AI.ALLY.HEROES.length || !AI.RUNE.TOTEMS){
					return;
				}
				var closeRunes = AI.RUNE.TOTEMS.filter(function(oneRune){
					var closestHeroToRune = findClosest(AI.ALLY.HEROES, oneRune, unitDistance)
					return closestHeroToRune.hisDistance < 5;
				});
				if(closeRunes && closeRunes.length){
					return closeRunes[0];
				}
			}
			function maybeAllyAttacksRune(){
				if(!AI.RUNE.AVAILABLE || !AI.ALLY_ATTACK_RUNE){
					return;
				}
				if(AI.RUNE.AVAILABLE && AI.ALLY_ATTACK_RUNE && !AI.CAN_ATTACK_RUNE){
					AI.RUNE_ATTACKED = true;
					return true;
				}
			}
			function switchingInProgress(){
				var switchEnd = AI.LAST_LANE_SWITCH + AI.LANE_SWITCH_DURATION;
				if(AI.TIME_NOW < switchEnd && AI.TIME_NOW + 1.5 > switchEnd){
					AI.ON_BOT = !AI.ON_BOT;
				}
				return (AI.TIME_NOW < switchEnd);
			}
			function shouldSwitchLane(){
				if(AI.NOW_SWITCHING_LANE){
					return false;
				}
				if(!AI.WHERE_TO_PUSH_TO_SWITCH_LANE.length){
					return false;
				}
				if(!AI.ALLY.MOBS.length){
					return false;
				}
				var relevantMobs = AI.ALLY.MOBS.filter(function(oneMob){
					return (AI.ON_BOT) ? oneMob.getX() < 50 : oneMob.getX() > 50 ;
				});
				if(!relevantMobs.length){
					return false;
				}
				relevantMobs = relevantMobs.sort(function(mobA, mobB){
					return (AI.ON_LEFT) ? mobB.getX() - mobA.getX() : mobA.getX() - mobB.getX();
				});
				var mobX = relevantMobs[0].getX();
				var goalX = AI.WHERE_TO_PUSH_TO_SWITCH_LANE[0];
				return (AI.ON_LEFT) ? mobX > goalX : mobX < goalX;
			}
			function whichHeroHasNotMoved(){
				if(!AI.HERO){
					return;
				}
				var barelyMovedOnes = [];
				for(var i = 0, max = AI.ENEMY.HERO_POSITIONS.now.length; i < max; i++){
					var prevPosition = AI.ENEMY.HERO_POSITIONS.prev[i];
					var nowPosition = AI.ENEMY.HERO_POSITIONS.now[i];
					if(!prevPosition || !nowPosition){
						continue;
					}
					var travelDistance = distance(nowPosition.x, nowPosition.y, prevPosition.x, prevPosition.y);
					if(travelDistance < 1){
						barelyMovedOnes.push(nowPosition);
					}
				}
				if(!barelyMovedOnes.length){
					return;
				}
				var closestDistance = 14;
				var closestEnemyPosition;
				for(var j = 0, maxJ = barelyMovedOnes.length; j < maxJ; j++){
					var oneEnemyPosition = barelyMovedOnes[j];
					var myDistance = positionDistance(AI.HERO, oneEnemyPosition);
					if(myDistance < closestDistance){
						closestEnemyPosition = oneEnemyPosition;
						closestDistance = myDistance;
					}
				}
				return closestEnemyPosition;
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
				if(AI.SHOULD_SWITCH_LANE){
					switchLane();
				}
				if(AI.STAGE == 'ALL LOADED'){
					rallyTownCenterToGoldMine();
				}
				recruit();
				mineGold();
				if(AI.LOW_ON_HP || AI.HERO_UNDER_ENEMY_TOWER){
					runToHealUp();
					return;
				}
				if(AI.ENEMY_CLOSE_TO_ME){
					teamFight(AI.POSITION_TO_ATTACK);
				}else{
					attack(AI.POSITION_TO_ATTACK);
				}
			}
			/************** ACTIONS BEFORE FIGHT ******/
			function chooseCharacter(){
				if(AI.HERO){
					return;//already chosen my hero
				}
				scope.order(AI.HERO_NAME.replace('...','zz').replace('.','zz'), AI.CHOOSE);
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
			/************** OTHER ACTIONS ************/
			function switchLane(){
				AI.WHERE_TO_PUSH_TO_SWITCH_LANE.splice(0,1);
				AI.LAST_LANE_SWITCH = AI.TIME_NOW;
			}
			function rallyTownCenterToGoldMine(){
				scope.order("Move", [AI.TOWN], {unit: AI.CLOSEST_GOLD_MINE});
			}
			/************** RECRUIT & MINE ***********/
			function recruit(){
				if(AI.MY_WORKERS.length < 7 && AI.ALLY.TOWERS.length > 6){
					if(AI.SUPPLY > 20 && AI.GOLD >= 50){
						AI.GOLD -= 50;
						AI.SUPPLY--;
						scope.order(".Recruit Gatherer", [AI.TOWN]);
					}
					return;
				}
				if(AI.HERO_INFO.ults.length){
					var nextUlt = AI.HERO_INFO.ults[0];
					if(AI.GOLD >= nextUlt.buy){
						AI.GOLD -= nextUlt.buy;
						scope.order(nextUlt.research, AI.CENTER);
						AI.HERO_INFO.ults.splice(0 , 1);
					}
					return;
				}
				if(AI.SUPPLY >= 5 && AI.GOLD >= 60){
					var choices = [".Arbalist", ".Berserker"];
					var rngChoice = choices[Math.floor(Math.random()*choices.length)];
					var t1Unit = AI.RECRUIT[rngChoice];
					AI.GOLD -= t1Unit.cost;
					AI.SUPPLY -= t1Unit.supply;
					scope.order(t1Unit.name, AI.CENTER);
					return;
				}
				if(AI.GOLD >= 300){
					scope.order(".Power the Nexus ", AI.CENTER);
					AI.GOLD -= 300;
					return;
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
			/************** HERO & ARMY ACTIONS *******/
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
						//console.log('Blinking away');
					}else if(canCastAbility(selfHeal)){
						scope.order(selfHeal.name, [AI.HERO], {unit: AI.HERO});
						scope.order("Move", [AI.HERO], AI.MAP.MY.HEAL, {shift:true});
						AI.HERO_INFO.abilities[3].lastTime = AI.TIME_NOW;
						//console.log('Healing up');
					}else{
						splitAndMoveArmy(AI.MAP.MY.HEAL, [AI.HERO]);
					}
				}else if(AI.HERO_NAME == "...Oathbroken Hero" ){
					if(!AI.HERO_INFO.ults.length && AI.CHANNELING && canCastAbility(AI.HERO_INFO.abilities[6])){
						scope.order(AI.HERO_INFO.abilities[6].name, [AI.HERO], {x: AI.HERO.getX(), y: AI.HERO.getY()});
						AI.HERO_INFO.abilities[6].lastTime = AI.TIME_NOW;
						scope.order("Move", [AI.HERO], AI.MAP.MY.HEAL, {shift:true});
						//console.log('Transforming into fast wold to run away - '+AI.HERO_INFO.abilities[6].name);
					}else{
						splitAndMoveArmy(AI.MAP.MY.HEAL, [AI.HERO]);
						//console.log('Oathbroken moving to heal up');
					}
				}else{
					splitAndMoveArmy(AI.MAP.MY.HEAL, [AI.HERO]);
				}
			}
			function teamFight(position){
				if(AI.MY.ARMY && AI.MY.ARMY.length){
					try{
						attackThroughCheckpoints(AI.MY.ARMY, AI.ENEMY_CLOSE_TO_ME.unit);
					}catch(Pokemon){
						console.log('attackThroughCheckpoints failed');
						console.log(Pokemon);
					}
				}
				if(AI.HERO_NAME == ".Herald Hero"){
					return heraldTeamFight(position);
				}
				if(AI.HERO && AI.ENEMY_CLOSE_TO_ME){
					var castedAbility = AI.HERO_INFO.act();
					var heroOrder = (AI.ENEMY_CLOSE_TO_ME.distance > 7) ? "Move" : "AMove";
					if(castedAbility){
						//scope.order(heroOrder, [AI.HERO], AI.ENEMY_CLOSE_TO_ME.unit, {shift:true});
					}else{
						scope.order(heroOrder, [AI.HERO], AI.ENEMY_CLOSE_TO_ME.unit);
					}
					return;
				}
				//console.log('nothing to do during teamfight');
			}
			function heraldTeamFight(position){
				if(AI.MY.LAPUTA && AI.MY.LAPUTA.length){
					controlLaputa();
				}
				if(!AI.HERO){
					return;
				}
				var castedAbility = AI.HERO_INFO.act();
				if(castedAbility){
					return;
				}
				if(AI.INJURED_ALLY_HERO){
					scope.order("Attack", [AI.HERO], {unit: AI.INJURED_ALLY_HERO});
					return;
				}
				if(AI.MY.LAPUTA && AI.MY.LAPUTA.length){
					scope.order("Attack", [AI.HERO], {unit: AI.MY.LAPUTA[0]});
					return;
				}
				if(!AI.ALLY.HEROES.length){
					scope.order("Move", [AI.HERO], AI.MAP.MY.NEXUS);
					return;
				}
				scope.order("Move", [AI.HERO], position);
			}
			function attack(position){
				if(AI.MY.LAPUTA && AI.MY.LAPUTA.length){
					controlLaputa(position);
				}
				if(AI.MY.ARMY && AI.MY.ARMY.length){
					splitAndMoveArmy(position, AI.MY.ARMY);
				}
				if(AI.HERO_NAME == ".Herald Hero"){
					return heraldAttack(position);
				}
				if(AI.HERO){
					var castedAbility = AI.HERO_INFO.act();
					if(castedAbility){
						return;
					}
					if(AI.CAN_ATTACK_RUNE){
						//console.log('Taking Rune for myself');
						scope.order("Attack", [AI.HERO], {unit: AI.CAN_ATTACK_RUNE});
						AI.RUNE_ATTACKED = true;
						return;
					}
					splitAndMoveArmy(position, [AI.HERO]);
					//console.log('Moving to better position');
				}
			}
			function heraldAttack(position){
				if(!AI.HERO){
					return;
				}
				var castedAbility = AI.HERO_INFO.act();
				if(castedAbility){
					return;
				}
				if(AI.INJURED_ALLY_HERO){
					scope.order("Attack", [AI.HERO], {unit: AI.INJURED_ALLY_HERO});
					return;
				}
				if(AI.CAN_ATTACK_RUNE){
					scope.order("Attack", [AI.HERO], {unit: AI.CAN_ATTACK_RUNE});
					return;
				}
				if(AI.MY.LAPUTA && AI.MY.LAPUTA.length){
					scope.order("Attack", [AI.HERO], {unit: AI.MY.LAPUTA[0]});
					return;
				}
				var heroDistance = positionDistance(AI.HERO, position);
				//var heroDistance = distance(AI.HERO.getX(), AI.HERO.getY(), position.x, position.y);
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
				var closeTowers = AI.ALLY.TOWERS.filter(function(oneTower){
					return unitDistance(oneTower, AI.HERO) < 4.5 && oneTower.getCurrentHP() < 700;
				});
				if(closeTowers.length){
					scope.order("Attack", [AI.HERO], {unit: closeTowers[0]});
					return;
				}*/
				scope.order("Move", [AI.HERO], position);
			}
			function controlLaputa(position){
				var laputa = AI.MY.LAPUTA[0];
				if(!laputa){
					return;
				}
				if(AI.LAPUTA_ENEMY.distance < 3 && canCastAbility(AI.LAPUTA.slow)){
					AI.LAPUTA.slow.lastTime = AI.TIME_NOW;
					scope.order(AI.LAPUTA.slow.name, AI.MY.LAPUTA, {unit: AI.LAPUTA_ENEMY.unit});
					return;
				}
				if(AI.LAPUTA_ENEMY.distance < 4 && canCastAbility(AI.LAPUTA.burst)){
					AI.LAPUTA.burst.lastTime = AI.TIME_NOW;
					scope.order(AI.LAPUTA.burst.name, AI.MY.LAPUTA, {unit: AI.LAPUTA_ENEMY.unit});
					return;
				}
				if(AI.LAPUTA_ENEMY.distance < 5 && canCastAbility(AI.LAPUTA.aoe)){
					AI.LAPUTA.aoe.lastTime = AI.TIME_NOW;
					scope.order(AI.LAPUTA.aoe.name, AI.MY.LAPUTA, {unit: AI.LAPUTA_ENEMY.unit});
					return;
				}
				position = position || AI.MAP.MY.NEXUS;
				if(AI.LAPUTA_ENEMY.distance < 3){
					position = AI.MAP.MY.NEXUS;
				}
				//is enemy mob nearby -> throw aoe on it
				splitAndMoveArmy(position, AI.MY.LAPUTA);
			}
			/************** ABILITIES *****************/
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
			/************** ARMY METHODS **************/
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
			function splitAndMoveArmy(position, army){
				var attackingUnits = [];
				var movingUnits = [];
				var checkpointingUnits = {};
				for(var i = 0, max = army.length; i < max; i++){
					var oneUnit = army[i];
					var hisDistance = positionDistance(oneUnit, position);
					//var hisDistance = distance(oneUnit.getX(), oneUnit.getY(), position.x, position.y);
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
			/**********************************************************/
			/******************* MATH / DISTANCE **********************/
			/**********************************************************/
			function findClosest(things, toTarget, distanceMethod){
				if(!things || !things.length || !toTarget || !distanceMethod){
					return;
				}
				var closestOne;
				var maxDistance = 200;
				for(var i = 0, max = things.length; i < max; i++){
					var oneThing = things[i];
					if(!oneThing){
						continue;
					}
					var hisDistance = distanceMethod(oneThing, toTarget);
					if(hisDistance < maxDistance){
						maxDistance = hisDistance;
						closestOne = oneThing;
						closestOne.hisDistance = hisDistance;
					}
				}
				return closestOne;
			}
			function positionDistance(a, b){
				return distance(a.getX(), a.getY(), b.x, b.y);
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
		scope.Eruner.init();
	}else{
		scope.Eruner.makeMove();
	}
}catch(Pokemon){
	console.log(Pokemon);
}
