var scope = {

    this.player = {
        var name = Computer;
        var controller = 1;
        var gold = 300;
        var number = 2;
        var supply = 7;
        var lastAttackMessage = 0;
        var team = [object Object];
        var originalTeam = [object Object];
        var aiUpdate = true;
        var isRevealed = false;
        var noAI = undefined;
        var isAlive = true;
        var maxSupply = 10;
        var realMaxSupply = 10;
        var supplyCap = 100;
        var buildings = [object Object];
        var buildingsUC = [object Object];
        var pseudoBuildings = [object Object];
        var upgrades = [object Object];
        var upgradeMods = [object Object];
        var apm = 0;
        var minedGold = 0;
        var randomAI = 2;
        var aiObject = [object Object];
        var scope = [object Object];
        var dances = ;
        var unitCountToAttack = 8;
        var makeTowerAtStart = true;
        var raxAt1Base = 1;
        var raxAt2Base = 4;
        var expand = true;
        var AIName = safe expansion;
        var die = function() {
            this.isAlive = false;
            message += "plDie$" + this.number + "~";
            game.killAllUnitsOfPlayer(this)
        };
        var updateGlobalVariables = function() {
            this.buildings = {};
            this.buildingsUC = {};
            this.pseudoBuildings = {};
            for (var e = 0; e < game.buildings.length; e++) {
                var a = game.buildings[e];
                if (a.owner == this && !a.isUnderConstruction) {
                    this.buildings[a.type.id_string] = this.buildings[a.type.id_string] ? this.buildings[a.type.id_string] + 1 : 1
                } else {
                    if (a.owner == this && a.isUnderConstruction) {
                        this.buildingsUC[a.type.id_string] = this.buildingsUC[a.type.id_string] ? this.buildingsUC[a.type.id_string] + 1 : 1
                    }
                }
            }
            for (var e = 0; e < game.units.length; e++) {
                if (game.units[e].owner == this) {
                    var d = game.units[e];
                    for (var c = 0; c < d.pseudoBuildings.length; c++) {
                        this.pseudoBuildings[d.pseudoBuildings[c].type.id_string] = this.pseudoBuildings[d.pseudoBuildings[c].type.id_string] ? this.pseudoBuildings[d.pseudoBuildings[c].type.id_string] + 1 : 1
                    }
                }
            }
            if (this.number >= 1) {
                var f = true;
                _.each(this.buildingsUC, function(g, b) {
                    if (lists.types[b] && lists.types[b].preventsReveal) {
                        f = false
                    }
                });
                _.each(this.buildings, function(g, b) {
                    if (lists.types[b] && lists.types[b].preventsReveal) {
                        f = false
                    }
                });
                this.isRevealed = f
            }
            message += "techUpd$" + this.number + "$" + JSON.stringify(this.buildings) + "$" + JSON.stringify(this.buildingsUC) + "$" + JSON.stringify(this.pseudoBuildings) + "$" + (f ? "1" : "0") + "~"
        };
        var getCostOfNextInstanceForBuilding = function(b) {
            if (!b.costIncrease) {
                return b.cost
            }
            var c = b.cost;
            if (b.costIncreaseGroup) {
                for (var a = 0; a < b.costIncreaseGroup.length; a++) {
                    c += (this.buildings[b.costIncreaseGroup[a].id_string] ? this.buildings[b.costIncreaseGroup[a].id_string] : 0) * b.costIncrease;
                    c += (this.buildingsUC[b.costIncreaseGroup[a].id_string] ? this.buildingsUC[b.costIncreaseGroup[a].id_string] : 0) * b.costIncrease;
                    c += (this.pseudoBuildings[b.costIncreaseGroup[a].id_string] ? this.pseudoBuildings[b.costIncreaseGroup[a].id_string] : 0) * b.costIncrease
                }
            }
            return c
        };
        var getValueModifier = function(h, f, a) {
            var g = (this.upgradeMods[f.id_string] && this.upgradeMods[f.id_string][h]) ? this.upgradeMods[f.id_string][h] : 0;
            if (a) {
                for (var d = 0; d < game.upgrades.length; d++) {
                    var l = game.upgrades[d];
                    var e = this.upgradeCountInResearch(l);
                    for (var b = 0; b < l.effectsTypes.length; b++) {
                        if (l.effectsFields[b] == h && l.effectsTypes[b] == f) {
                            g += l.effectsModifications[b] * e
                        }
                        if (l.effectsModsMultiplier && b in l.effectsModsMultiplier) {
                            for (var c = 0; c < e; c++) {
                                g += f[h] * (l.effectsModsMultiplier[b] - 1)
                            }
                        }
                    }
                }
            }
            return g
        };
        var modifyUpgrade = function(b, f) {
            this.upgrades[b.id_string] = this.upgrades[b.id_string] ? (this.upgrades[b.id_string] + f) : f;
            for (var a = 0; a < b.effectsTypes.length; a++) {
                if (b.effectsTypes[a] && b.effectsFields[a]) {
                    var c = b.effectsTypes[a];
                    var e = b.effectsFields[a];
                    var d = b.effectsTypes[a].getDataFields()[e];
                    if (d && (d.type == "float" || d.type == "integer" || d.type == "bool")) {
                        if (b.effectsModifications && b.effectsModifications[a]) {
                            if (!this.upgradeMods[c.id_string]) {
                                this.upgradeMods[c.id_string] = {}
                            }
                            this.upgradeMods[c.id_string][e] = this.upgradeMods[c.id_string][e] ? (this.upgradeMods[c.id_string][e] + b.effectsModifications[a]) : b.effectsModifications[a]
                        }
                        if (b.effectsModsMultiplier && a in b.effectsModsMultiplier && (d.type == "float" || d.type == "integer")) {
                            if (!this.upgradeMods[c.id_string]) {
                                this.upgradeMods[c.id_string] = {}
                            }
                            this.upgradeMods[c.id_string][e] = this.upgradeMods[c.id_string][e] ? (this.upgradeMods[c.id_string][e] + (b.effectsModsMultiplier[a] - 1) * c[e]) : (b.effectsModsMultiplier[a] - 1) * c[e]
                        }
                    }
                }
            }
            message += "setUpg$" + this.number + "$" + JSON.stringify(this.upgrades) + "$" + JSON.stringify(this.upgradeMods) + "~"
        };
        var getUpgradeLevel = function(a) {
            return this.upgrades[a.id_string] ? this.upgrades[a.id_string] : 0
        };
        var modifyGold = function(a) {
            this.gold += Math.max(a, -this.gold);
            message += "modPlVal$" + this.number + "$gold$" + this.gold + "~"
        };
        var modifySupply = function(a) {
            this.realMaxSupply += a;
            this.maxSupply = Math.min(this.realMaxSupply, this.supplyCap);
            message += "modPlVal$" + this.number + "$maxSupply$" + this.maxSupply + "~"
        };
        var setValAndSync = function(b, a) {
            this[b] = a;
            message += "modPlVal$" + this.number + "$" + b + "$" + this[b] + "~"
        };
        var isEnemyOfPlayer = function(a) {
            return this.team.number != 0 && a.team.number != 0 && this.team != a.team
        };
        var youAreAttackedAtPosition = function(a) {};
        var upgradeCountInResearch = function(f) {
            var g = 0;
            for (var e = 0; e < game.buildings.length; e++) {
                var a = game.buildings[e];
                if (a.owner == this) {
                    for (var d = 0; d < BUILDING_QUEUE_LEN; d++) {
                        if (a.queue && a.queue[d] == f) {
                            g++
                        }
                    }
                }
            }
            return g
        };
        var AIUpdate = function() {
            if (this.noAI) {
                return
            }
            if (this.aiObject && this.aiObject.update) {
                this.aiObject.update(this.scope);
                return
            }
            var a = this.getUnitsOfTypeOfPlayer(lists.types.castle, this);
            var o = this.getUnitsOfTypeOfPlayer(lists.types.barracks, this).concat(this.getUnitsOfTypeOfPlayer(lists.types.wolvesden, this));
            var u = this.getUnitsOfTypeOfPlayer(lists.types.watchtower, this);
            var d = this.getUnitsOfTypeOfPlayer(lists.types.house, this);
            var C = this.getUnitsOfTypeOfPlayer(lists.types.worker, this);
            var b = this.getUnitsOfTypeOfPlayer(lists.types.soldier, this);
            var n = this.getUnitsOfTypeOfPlayer(lists.types.wolf, this);
            var q = this.getUnitsOfTypeOfPlayer(lists.types.archer, this);
            var p = this.getUnitsOfTypeOfPlayer(lists.types.mage, this);
            var r = b.concat(q, p, n);
            var s = this.getUnitsOfTypeOfPlayer(lists.types.goldmine);
            for (var A = 0; A < s.length; A++) {
                if (!s[A].gold) {
                    s.splice(A, 1);
                    A--
                }
            }
            var j = [];
            for (var A = 1; A <= MAX_PLAYERS; A++) {
                if (game.players[A] && game.players[A].isEnemyOfPlayer(this)) {
                    j = j.concat(this.getUnitsOfTypeOfPlayer(lists.types.castle, game.players[A]))
                }
            }
            var g = j.length > 0 ? j[0].pos : new Field(ticksCounter % 60 + 20, ticksCounter % 60 + 2, true);
            for (var A = 0; A < a.length; A++) {
                if (!a[A].queue[0] && C.length < 9 * a.length) {
                    a[A].orderMake(lists.types.trainworker);
                    this.setValAndSync("apm", this.apm + 1)
                }
            }
            for (var A = 0; A < o.length; A++) {
                if (!o[A].queue[0]) {
                    o[A].orderMake(ticksCounter % 13 > 6 ? lists.types.trainsoldier : lists.types.trainarcher);
                    this.setValAndSync("apm", this.apm + 1)
                }
            }
            if (s.length > 0) {
                for (var A = 0; A < C.length; A++) {
                    if (C[A].order.type == COMMAND.IDLE) {
                        C[A].issueOrder(lists.types.mine, this.getClosestUnit(C[A].pos, s));
                        this.setValAndSync("apm", this.apm + 1)
                    }
                }
            }
            if (((this.supply >= this.maxSupply - 4 && this.maxSupply < this.supplyCap) || d.length == 0) && a.length >= 1 && C.length > 0) {
                var l = a[0].pos.add3((ticksCounter / 21) % 16 - 8, (ticksCounter / 17) % 16 - 8);
                if (s.length > 0 && this.getClosestUnit(l, s).pos.distanceTo2(l) > 7) {
                    var f = this.getClosestUnit(l, C, true);
                    if (f) {
                        f.issueOrder(lists.types.buildhouse, l);
                        this.setValAndSync("apm", this.apm + 1)
                    }
                }
            }
            if (this.gold > 350 && C.length > 0 && a.length <= 1 && this.expand) {
                var e = null;
                var D = a.concat(j);
                var z = [];
                if (D.length > 0) {
                    for (var A = 0; A < s.length; A++) {
                        if (s[A].distanceTo(this.getClosestUnit(s[A].pos, D)) > 12) {
                            z.push(s[A])
                        }
                    }
                }
                var h = 99999;
                for (var A = 0; A < z.length; A++) {
                    var w = C[0].pos.distanceTo2(z[A].pos);
                    if (w < h) {
                        h = w;
                        e = z[A]
                    }
                }
                if (e) {
                    var B = this.getClosestUnit(e.pos, C, true);
                    if (B) {
                        var m = B.pos;
                        var c = e.pos;
                        var A = 0;
                        while (!lists.types.castle.couldBePlacedAt(c) && A < 5) {
                            c = e.pos.addNormalizedVector(m, 6);
                            var v = 0;
                            while (!lists.types.castle.couldBePlacedAt(c) && c.distanceTo(e.pos) < 11 && v < 10) {
                                c = c.addNormalizedVector(m, 1);
                                v++
                            }
                            m = e.pos.add3((ticksCounter / 33) % 38 - 19, (ticksCounter / 4) % 38 - 19);
                            A++
                        }
                        if (lists.types.castle.couldBePlacedAt(c)) {
                            B.issueOrder(lists.types.buildcastle, c);
                            this.setValAndSync("apm", this.apm + 1)
                        }
                    }
                }
            }
            if ((this.gold >= (!this.makeWolves ? lists.types.barracks.cost : lists.types.wolvesden.cost)) && this.buildings.house && C.length > 0 && a.length > 0 && (o.length < (a.length == 1 ? this.raxAt1Base : this.raxAt2Base))) {
                var l = a[0].pos.add3((ticksCounter / 21) % 19 - 9, (ticksCounter / 17) % 19 - 9);
                if (s.length > 0) {
                    if (this.getClosestUnit(l, s).pos.distanceTo2(l) > 7) {
                        var f = this.getClosestUnit(l, C, true);
                        if (f) {
                            f.issueOrder(lists.types.buildbarracks, l);
                            this.setValAndSync("apm", this.apm + 1)
                        }
                    }
                }
            }
            if ((this.gold >= 500 && a.length > 0 && C.length > 6 && u.length < 2) || (this.makeTowerAtStart && this.gold >= lists.types.watchtower.cost && a.length > 0 && C.length > 1 && u.length < 1)) {
                var l = a[0].pos.addNormalizedVector(g, 10);
                l = l.add3((ticksCounter / 21) % 12 - 6, (ticksCounter / 17) % 12 - 6);
                var f = this.getClosestUnit(l, C, true);
                if (f) {
                    f.issueOrder(lists.types.buildwatchtower, l);
                    this.setValAndSync("apm", this.apm + 1)
                }
            }
            var t = [];
            if (r.length > this.unitCountToAttack) {
                for (var A = 0; A < r.length; A++) {
                    if (r[A].order.type == COMMAND.IDLE) {
                        t.push(r[A])
                    }
                }
            }
            game.issueOrderToUnits2(t, lists.types.amove, g);
            if (t.length > 0) {
                game.issueOrderToUnits2(t, lists.types.amove, g);
                this.setValAndSync("apm", this.apm + 1)
            }
        };
        var getClosestUnit = function(f, c, b) {
            var e = null;
            var a = 999999;
            for (var d = 0; d < c.length; d++) {
                if ((!b || !c[d].order || c[d].order.type == COMMAND.IDLE || c[d].order.type == COMMAND.MINE) && c[d].pos.distanceTo2(f) < a) {
                    e = c[d];
                    a = c[d].pos.distanceTo2(f)
                }
            }
            return e
        };
        var getUnitsOfTypeOfPlayer = function(e, d) {
            var b = [];
            var a = game.units.concat(game.buildings);
            for (var c = 0; c < a.length; c++) {
                if ((!d || a[c].owner == d) && a[c].type == e) {
                    b.push(a[c])
                }
            }
            return b
        };
    };
    this.getTypeFieldValue = function(a, c) {
        var b = lists.types[a];
        return b ? b[c] : null;
    };
    this.getGroundDistance = function(f, b, e, a) {
        var d = new Field(f, b, true);
        var c = new Field(e, a, true);
        return getLenOfPath(d, game.astar.getPath(d, c, lists.types.soldier));
    };
    this.getCurrentGameTimeInSec = function() {
        return ticksCounter / 20;
    };
    this.getMyPlayerNumber = function() {
        return this.player.number;
    };
    this.getMyTeamNumber = function() {
        return this.player.team.number;
    };
    this.getTeamNumber = function(b) {
        var a = game.getPlayerWithIndex(b);
        return a ? a.team.number : -1;
    };
    this.positionIsPathable = function(a, b) {
        return !game.fieldIsBlocked(parseInt(a), parseInt(b));
    };
    this.getMapWidth = function() {
        return game.x;
    };
    this.getMapHeight = function() {
        return game.y;
    };
    this.getCurrentSupply = function() {
        return this.player.supply;
    };
    this.getMaxSupply = function() {
        return this.player.maxSupply;
    };
    this.getUpgradeLevel = function(a) {
        for (var b = 0; b < game.upgrades.length; b++) {
            if (game.upgrades[b].name == a) {
                return this.player.getUpgradeLevel(game.upgrades[b]);
            }
        }
        return null
    };
    this.getArrayOfPlayerNumbers = function() {
        var a = [];
        for (var b = 0; b < game.players.length; b++) {
            if (game.players[b] && game.players[b].controller != CONTROLLER.SPECTATOR && game.players[b].controller != CONTROLLER.NONE) {
                a.push(b);
            }
        }
        return a
    };
    this.getStartLocationForPlayerNumber = function(b) {
        for (var a = 0; a < game.startLocations.length; a++) {
            if (game.startLocations[a].player == b) {
                return {
                    x: game.startLocations[a].x,
                    y: game.startLocations[a].y
                };
            }
        }
    };
    this.getUnits = function(c) {
        var a = [];
        if (!c) {
            c = {};
        }
        for (var b = 0; b < game.units.length; b++) {
            if (this.player.team.canSeeUnit(game.units[b]) && (!c.type || c.type == game.units[b].type.name) && (!c.notOfType || c.notOfType != game.units[b].type.name) && (!c.player || c.player == game.units[b].owner.number) && (!c.team || c.team == game.units[b].owner.team.number) && (!c.order || c.order == game.units[b].order.name) && (!c.enemyOf || !game.players[c.enemyOf] || (game.players[c.enemyOf].team.number != game.units[b].owner.team.number && game.players[c.enemyOf].team.number != 0))) {
                a.push(new UnitWrapper(game.units[b]));
            }
        }
        return a;
    };
    this.getBuildings = function(c) {
        var b = [];
        if (!c) {
            c = {}
        }
        for (var a = 0; a < game.buildings.length; a++) {
            if (game.buildings[a].seenBy[this.player.team.number] && (!c.type || c.type == game.buildings[a].type.name) && (!c.notOftype || c.notOftype != game.buildings[a].type.name) && (!c.player || c.player == game.buildings[a].owner.number) && (!c.team || c.team == game.buildings[a].owner.team.number) && (!c.order || c.order == game.buildings[a].order.name) && (!c.onlyFinshed || !game.buildings[a].isUnderConstruction) && (!c.enemyOf || !game.players[c.enemyOf] || (game.players[c.enemyOf].team.number != game.buildings[a].owner.team.number && game.players[c.enemyOf].team.number != 0))) {
                b.push(new UnitWrapper(game.buildings[a]));
            }
        }
        return b;
    };
    this.order = function(b, d, h, c) {
        var a = [];
        for (var e = 0; e < d.length; e++) {
            if (d[e].unit.isActive && d[e].unit.owner == this.player) {
                a.push(d[e].unit);
            }
        }
        var f = this.getCommandFromCommandName(b);
        if (!f || a.length == 0) {
            return;
        }
        var g = null;
        if (h && h.unit && h.unit.unit) {
            g = h.unit.unit
        } else {
            if (h && h.x && h.y) {
                g = new Field(h.x, h.y, true);
            }
        }
        if (f.targetIsUnit && (!h || !g || !g.type)) {
            return;
        }
        if (f.targetIsPoint && (!h || !g || !g.isField)) {
            return;
        }
        game.issueOrderToUnits2(a, f, g, c)
    };
    this.getCenterOfUnits = function(b) {
        var d = 0;
        var a = 0;
        var e = 0;
        for (; d < b.length; d++) {
            var c = b[d].unit;
            a += c.pos.px;
            e += c.pos.py
        }
        return {
            x: a / d,
            y: e / d
        };
    };
    this.getGold = function() {
        return this.player.gold;
    };
    this.chatMsg = function(a) {
        message += '"addMsg$\"' + a.replace(/$/g, "").replace(/~/g, "") + '"$#00FFFF~"';
    };
    this.playerIsAlive = function(b) {
        if (!game.players[b]) {
            return false;
        }
        for (var a = 0; a < game.buildings.length; a++) {
            if (game.buildings[a].owner == game.players[b]) {
                return true;
            }
        }
        return false;
    };
    this.getCommandFromCommandName = function(a) {
        if (game && game.commands) {
            for (var b = 0; b < game.commands.length; b++) {
                if (game.commands[b].name == a) {
                    return game.commands[b];
                }
            }
        }
        return null;
    };
    this.getHeightLevel = function(a, b) {
        return game.getHMValue(Math.floor(a), Math.floor(b));
    };
    this.getRandomNumber = function(b, a) {
        return (((ticksCounter * 179 + (game.units.length > 0 ? game.units[0].pos.px * 173 : 0) + game.aiRandomizer) % 1382) / 1382) * (a - b) + b;
    };
    this.fieldIsRamp = function(a, c) {
        var b = this.getHeightLevel(a, c);
        return b != parseInt(b);
    };

};