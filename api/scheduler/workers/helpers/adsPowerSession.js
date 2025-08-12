import axios from 'axios'
import { chromium } from 'playwright'
import { getActiveAdsPowerEndpoint } from '../../workers/helpers/adsPowerService.js'

const endpoint = await getActiveAdsPowerEndpoint();  
const PORT = new URL(endpoint).port;
const ADSPOWER_URL = `http://host.docker.internal:${PORT}`;

export async function getProfileInfo(user_id) {
    try {
        const res = await axios.get(`${ADSPOWER_URL}/api/v1/user/list?user_id=${user_id}`);
        const { code, data } = res.data;

        if (code !== 0 || !data.list || data.list.length === 0) {
            throw new Error(`Perfil '${user_id}' não encontrado`);
        }

        return data.list[0];
    } catch (err) {
        throw new Error(`Erro ao buscar dados do perfil: ${err.message}`);
    }
}

export async function startSession(user_id) {
    try {
        const res = await axios.get(`${ADSPOWER_URL}/api/v1/browser/start?user_id=${user_id}`);
        const { code, data } = res.data;

        if (code !== 0 || !data.ws?.puppeteer) {
            throw new Error(`Falha ao iniciar perfil no AdsPower: ${res.data.message || 'desconhecido'}`);
        }

        return data.ws.puppeteer;
    } catch (err) {
        throw new Error(`Erro ao abrir perfil ${user_id}: ${err.message}`);
    }
}

export async function stopSession(user_id) {
    try {
        await axios.get(`${ADSPOWER_URL}/api/v1/browser/stop?user_id=${user_id}`);
    } catch (err) {
        console.warn(`[ADSP] Falha ao encerrar perfil ${user_id}: ${err.message}`);
    }
}

export async function connectToBrowser(wsEndpoint) {
    try {
        const browser = await chromium.connectOverCDP(wsEndpoint);
        const [page] = await browser.contexts()[0].pages();
        return { browser, page };
    } catch (err) {
        throw new Error(`Erro ao conectar via CDP: ${err.message}`);
    }
}
