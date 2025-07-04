import Chance from "chance";
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export function getMessage(name) {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const messages = config.whatsapp.messages;
    const chance = new Chance();
    const randomIndex = chance.integer({ min: 0, max: messages.length - 1 });
    return messages[randomIndex].replace(/\$\{name\}/g, name);
}
