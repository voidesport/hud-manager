import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import express from 'express';

import HUDWindow from './../../init/huds';

export const listHUDs = () => {
    const dir = path.join(app.getPath('home'), 'HUDs');
    const dirs = fs.readdirSync(dir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => getHUDData(dirent.name))
        .filter(hud => hud !== null);
    return dirs;
}

export const getHUDs: express.RequestHandler = (req, res) => {
    return res.json(listHUDs());
}

export const getHUDData = (dirName: string) => {
    const dir = path.join(app.getPath('home'), 'HUDs', dirName);
    const configFileDir = path.join(dir, 'hud.json');
    if(!fs.existsSync(configFileDir)){
        return null;
    }
    try {
        const configFile = fs.readFileSync(configFileDir, {encoding:'utf8'});
        const config = JSON.parse(configFile);
        config.dir = dirName;
        const panel = getHUDPanelSetting(dirName);
        if(panel){
            config.panel = panel;
        }
        return config;

    } catch(e){
        return null;
    }
}

export const getHUDPanelSetting = (dirName: string) => { 
    const dir = path.join(app.getPath('home'), 'HUDs', dirName);
    const panelFileDir = path.join(dir, 'panel.json');
    if(!fs.existsSync(panelFileDir)){
        return null;
    }
    try {
        const panelFile = fs.readFileSync(panelFileDir, {encoding:'utf8'});
        const panel = JSON.parse(panelFile);
        panel.dir = dirName;
        return panel;

    } catch(e){
        return null;
    }
}
export const renderHUD: express.RequestHandler = (req, res) => {
    if(!req.params.dir){
        return res.sendStatus(404);
    }
    const data = getHUDData(req.params.dir);
    if(!data){
        return res.sendStatus(404);
    }
    if(data.legacy){
        return renderLegacy(req, res, null);
    }
    return render(req, res, null);
}

export const render: express.RequestHandler = (req, res) => {
    const dir = path.join(app.getPath('home'), 'HUDs', req.params.dir);
    return res.sendFile(path.join(dir, 'index.html'))
}

export const renderThumbnail: express.RequestHandler = (req, res) => {
    const thumbPath = path.join(app.getPath('home'), 'HUDs', req.params.dir, "thumb.png");
    if(fs.existsSync(thumbPath)){
        return res.sendFile(thumbPath);
    }
    return res.sendFile(path.join(__dirname, '../../assets/icon.png'));
    
}

export const renderAssets: express.RequestHandler = (req, res, next) => {
    if(!req.params.dir){
        return res.sendStatus(404);
    }
    const data = getHUDData(req.params.dir);
    if(!data){
        return res.sendStatus(404);
    }
    return express.static(path.join(app.getPath('home'), 'HUDs', req.params.dir))(req, res,next);
}










export const renderLegacy: express.RequestHandler = (req, res) => {
    const dir = path.join(app.getPath('home'), 'HUDs', req.params.dir);
    return res.render(path.join(dir, 'template.pug'), {
        ip:'localhost',
        port:1337,
        avatars: false,
        hud: path.join('/legacy', req.params.dir, 'index.js'),
        css: path.join('/legacy', req.params.dir, 'style.css'),
        delay: 0
    });
}

export const legacyJS: express.RequestHandler = (req, res) => {
    const dir = path.join(app.getPath('home'), 'HUDs', req.params.hudName, 'index.js');
    if(!fs.existsSync(dir)){
        return res.sendStatus(404);
    }
    try {
        const file = fs.readFileSync(dir, {encoding:'utf8'});
        res.setHeader('Content-Type', 'application/javascript');
        return res.end(file);

    } catch(e){
        return res.sendStatus(404);
    }

}
export const legacyCSS: express.RequestHandler = (req, res) => {
    const dir = path.join(app.getPath('home'), 'HUDs', req.params.hudName, 'style.css');
    if(!fs.existsSync(dir)){
        return res.sendStatus(404);
    }
    try {
        const file = fs.readFileSync(dir, {encoding:'utf8'});
        res.setHeader('Content-Type', 'text/css');
        return res.end(file);

    } catch(e){
        return res.sendStatus(404);
    }

}

export const showHUD: express.RequestHandler = async (req, res) => {
    const response = await HUDWindow.open(req.params.hudDir);
    if(response){
        return res.sendStatus(200);
    }
    return res.sendStatus(404);
}

export const closeHUD: express.RequestHandler = (req, res) => {
    const response = HUDWindow.close();
    if(response){
        return res.sendStatus(200);
    }
    return res.sendStatus(404);
}