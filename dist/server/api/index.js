"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var electron_1 = require("electron");
var players = __importStar(require("./players"));
var teams = __importStar(require("./teams"));
var match = __importStar(require("./match"));
var config = __importStar(require("./config"));
var huds = __importStar(require("./huds"));
var path = __importStar(require("path"));
var gsi = __importStar(require("./gamestate"));
var game = __importStar(require("./game"));
var sync = __importStar(require("./sync"));
function default_1(router, io) {
    router.route('/api/players')
        .get(players.getPlayers)
        .post(players.addPlayer);
    router.route('/api/players/:id')
        .get(players.getPlayers)
        .patch(players.updatePlayer)["delete"](players.deletePlayer);
    router.route('/api/players/avatar/:id')
        .get(players.getAvatarFile);
    router.route('/api/players/avatar/steamid/:steamid')
        .get(players.getAvatarURLBySteamID);
    router.route('/api/teams')
        .get(teams.getTeams)
        .post(teams.addTeam);
    router.route('/api/teams/:id')
        .get(teams.getTeam)
        .patch(teams.updateTeam)["delete"](teams.deleteTeam);
    router.route('/api/teams/logo/:id')
        .get(teams.getLogoFile);
    router.route('/api/config')
        .get(config.getConfig)
        .patch(config.updateConfig);
    router.route('/api/match')
        .get(match.getMatchesRoute)
        .patch(match.setMatch(io));
    router.route('/api/huds')
        .get(huds.getHUDs)
        .post(huds.openHUDsDirectory)["delete"](huds.deleteHUD(io));
    router.route('/api/huds/add')
        .post(huds.uploadHUD);
    router.route('/api/huds/close')
        .post(huds.closeHUD);
    router.route('/api/huds/:hudDir/start')
        .post(huds.showHUD(io));
    router.route('/api/maps')
        .get(match.getMaps);
    router.route('/api/gsi')
        .get(gsi.checkGSIFile)
        .put(gsi.createGSIFile);
    router.route('/api/import')
        .post(sync.importDb);
    router.route('/api/gsi/download')
        .get(gsi.saveFile('gamestate_integration_hudmanager.cfg', gsi.generateGSIFile()));
    router.route('/api/db/download')
        .get(gsi.saveFile('hudmanagerdb.json', sync.exportDatabase()));
    //router.route('/api/events')
    //    .get(game.getEvents);
    router.route('/api/game')
        .get(game.getLatestData);
    router.route('/api/game/run')
        .get(game.run);
    router.route('/api/game/experimental')
        .get(game.runExperimental);
    router.route('/api/cfg')
        .get(game.checkCFGs)
        .put(game.createCFGs);
    router.route('/api/cfgs/download')
        .get(gsi.saveFile('configs.zip', gsi.cfgsZIPBase64, true));
    router.route('/huds/:dir/')
        .get(huds.renderHUD);
    router.route('/hud/:dir/')
        .get(huds.renderOverlay);
    router.use('/huds/:dir/', huds.renderAssets);
    router.route('/huds/:dir/thumbnail')
        .get(huds.renderThumbnail);
    /**
     * LEGACY ROUTING
     */
    router.route('/legacy/:hudName/index.js')
        .get(huds.legacyJS);
    router.route('/legacy/:hudName/style.css')
        .get(huds.legacyCSS);
    router.use('/', express_1["default"].static(path.join(__dirname, '../static/legacy')));
    electron_1.globalShortcut.register("Alt+r", function () {
        match.reverseSide(io);
    });
    /**
     * END OF LEGACY ROUTING
     */
}
exports["default"] = default_1;
