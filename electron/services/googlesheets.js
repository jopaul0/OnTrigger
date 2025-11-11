import { google } from 'googleapis';
import { isBirthday, BirthdayNear } from '../utils/date.js';
import { sendLog } from '../utils/sendLog.js';
import { readJsonFile } from '../utils/data.js';
import { uniqueArray, firstName, uniqueObjArray, clearPhone } from '../utils/format.js';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

/* Utils locais */
const parseBRDate = (str) => {
  if (!str || typeof str !== 'string') return null;
  const [d, m, y] = str.split('/').map(Number);
  if (!d || !m || !y) return null;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const normalizeRow = (row) => {
  if (!Array.isArray(row)) return null;
  const [company, name, dateStr, phoneRaw] = row;
  if (!name || !dateStr) return null;

  const birthday = parseBRDate(String(dateStr).trim());
  if (!birthday) return null;

  const phone = clearPhone(phoneRaw) || '';
  return { company, name: String(name).trim(), birthday, phone };
};

async function getRows(mainWindow) {
  let config;

  try {
    config = await readJsonFile(mainWindow);
  } catch (_err) {
    sendLog(mainWindow, '❌ Erro ao ler config.json.');
    return [];
  }

  if (!config || !config.googleSheets) {
    sendLog(mainWindow, '❌ Configuração do Google Sheets ausente ou inválida.');
    return [];
  }

  const credentialsFullPath = path.join(app.getPath('userData'), config.googleSheets.credentialsPath);

  if (!fs.existsSync(credentialsFullPath)) {
    sendLog(mainWindow, `❌ Arquivo de credenciais não encontrado: ${credentialsFullPath}`);
    return [];
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsFullPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.googleSheets.spreadsheetId,
      range: config.googleSheets.range,
    });

    // Remove linhas vazias e uma possível linha de cabeçalho
    const values = Array.isArray(res?.data?.values) ? res.data.values : [];
    if (!values.length) return [];

    const maybeHeader = values[0];
    const hasHeader =
      maybeHeader &&
      (String(maybeHeader[1] || '').toLowerCase().includes('nome') ||
       String(maybeHeader[2] || '').toLowerCase().includes('data'));

    return hasHeader ? values.slice(1) : values;
  } catch (err) {
    if (err?.response?.status === 403) {
      sendLog(mainWindow, '❌ Permissão negada para acessar a planilha. Verifique o compartilhamento.');
    } else {
      sendLog(mainWindow, `❌ Erro ao acessar Google Sheets: ${err.message}`);
    }
    return [];
  }
}

/* ====== EXPORTS ====== */

export async function findBirthdays(mainWindow) {
  sendLog(mainWindow, '🔍 Verificando aniversários...');
  const rows = await getRows(mainWindow);

  const birthdays = rows
    .map(normalizeRow)
    .filter(Boolean)
    .filter(({ birthday }) => BirthdayNear(birthday));

  const unique = uniqueArray(birthdays);

  sendLog(mainWindow, `🎉 Encontrados ${unique.length} aniversários próximos`);
  unique.forEach((b) => {
    sendLog(
      mainWindow,
      `🎂 ${firstName(b.name)} - ${b.birthday.toLocaleDateString()} - Telefone: ${b.phone}`
    );
  });
}

export async function findBirthdaysToday(mainWindow) {
  const rows = await getRows(mainWindow);

  const birthdays = rows
    .map(normalizeRow)
    .filter(Boolean)
    .filter(({ birthday }) => isBirthday(birthday));

  return uniqueArray(birthdays);
}

const parseDate = (d) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

export async function getBirthdays(range, mainWindow) {
  const rows = await getRows(mainWindow);

  const start = range?.startDate ? parseDate(range.startDate) : null;
  const end = range?.endDate ? parseDate(range.endDate) : null;

  const birthdays = rows
    .map(normalizeRow)
    .filter(Boolean)
    .filter(({ birthday }) => {
      const b = new Date(birthday);
      b.setHours(0, 0, 0, 0);
      const okStart = !start || b >= start;
      const okEnd = !end || b <= end;
      return okStart && okEnd;
    })
    .map(({ name, birthday, phone }) => ({ name, date: birthday, phone }));

  return uniqueObjArray(birthdays) || [];
}

export async function getBirthdayToday(mainWindow) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const range = {
    startDate: today.toISOString(),
    endDate: today.toISOString(),
  };

  const birthdays = await getBirthdays(range, mainWindow);
  return birthdays || [];
}
