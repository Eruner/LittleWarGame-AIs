try{void 0===scope.BOT?(scope.BOT=function(){function e(){try{r={UNITS:{},BUILDINGS:{},SUPPLY:{}},n=function(e){function o(){try{c||r(),t.myWorkers=scope.getUnits({player:c.me,type:"Worker"}),t.myArmy=scope.getUnits({player:c.me,notOfType:"Worker"})}catch(e){console.log("Error in observe:\n"+e)}}function r(){try{c={},c.myNumber=scope.getMyPlayerNumber(),c.myTeam=scope.getMyTeamNumber(),c.myBase=scope.getStartLocationForPlayerNumber(c.myNumber),c.allies={},c.enemies={};for(var e,o,r,t=scope.getArrayOfPlayerNumbers(),a=0,s=t.length;s>a;a++)e=t[a],e!=c.myNumber&&(o=scope.getTeamNumber(e),o==c.myTeam?(c.allies[e]={},r=c.allies[e]):(c.enemies[e]={},r=c.enemies[e]),r.base=scope.getStartLocationForPlayerNumber(e));n.DIPLOMACY=c}catch(m){console.log("Error in analyzeDiplomacy() :\n"+m)}}var n=e,t=n.UNITS,c=(n.BUILDINGS,n.SUPPLY,n.DIPLOMACY);return{observe:o}}(r),t=function(e){function o(){try{if(n=c.DIPLOMACY,!t)for(var e in n.enemies)n.enemies.hasOwnProperty(e)&&(t=n.enemies[e].base);r=c.UNITS,scope.order("AMove",r.myWorkers,t),scope.order("AMove",r.myArmy,t)}catch(o){console.log("Error in act:\n"+o)}}var r,n,t,c=e;return{act:o}}(r)}catch(e){console.log("Error in initApp:\n"+e)}}function o(){n.observe(),t.act()}var r,n,t;return{init:e,makeMove:o}}(),scope.BOT.init()):scope.BOT.makeMove()}catch(Pokemon){console.log(Pokemon)}