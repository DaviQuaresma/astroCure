import { ensureLoggedIn } from '../../utils/loginUtils.js';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function postVideo(page, credentials = {}, videoPath, descricao = '') {
    console.log('[UPLOAD] Iniciando fluxo de postagem...');

    try {
        await ensureLoggedIn(page, credentials);

        console.log('[UPLOAD] Acessando página de upload...');
        await page.goto('https://www.tiktok.com/tiktokstudio/upload?from=webapp', {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        });

        console.log(`[UPLOAD] Enviando vídeo: ${videoPath}`);

        // Clica no botão estilizado
        const selectButton = await page.waitForSelector('button[data-e2e="select_video_button"]', { timeout: 10000 });
        if (!selectButton) throw new Error('Botão "Selecionar vídeos" não encontrado');
        await selectButton.click();
        await delay(1000);

        // Força o input a ficar visível e envia o arquivo
        const fileInput = await page.$('input[type="file"]');
        if (!fileInput) throw new Error('Campo de upload não encontrado');

        await page.evaluate(el => el.style.display = 'block', fileInput); // força visibilidade
        await fileInput.setInputFiles(videoPath);

        await page.waitForSelector('[data-e2e="caption_container"]', { timeout: 15000 });

        console.log('[UPLOAD] Preenchendo descrição...');
        const descricaoField = await page.$('div.DraftEditor-root');
        if (!descricaoField) throw new Error('Campo de descrição não encontrado');

        await descricaoField.click();
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        await delay(300);
        await page.keyboard.type(descricao, { delay: 30 });

        await delay(1000);

        console.log('[UPLOAD] Clicando para publicar...');
        const botaoPublicar = await page.$('button[data-e2e="post_video_button"]');
        if (!botaoPublicar) throw new Error('Botão de publicar não encontrado');

        await botaoPublicar.click();

        // Espera algum indicativo visual ou timeout de fallback
        try {
            await Promise.race([
                page.waitForNavigation({ timeout: 10000 }),
                page.waitForSelector('[data-e2e="upload_success_toast"]', { timeout: 10000 }),
                delay(10000), // fallback: não achou nada, mas esperou o suficiente
            ]);
        } catch (err) {
            console.warn('[UPLOAD] Timeout aguardando confirmação visual, prosseguindo mesmo assim.');
        }

        // Verifica visualmente se houve falha
        const erroUpload = await page.$('div[class*="upload-error"], [data-e2e*="error"]');
        if (erroUpload) {
            console.warn('[UPLOAD] Detectado possível erro visual durante upload.');
        }

        console.log('[UPLOAD] Postagem finalizada (com ou sem confirmação).');
        return true;
    } catch (err) {
        console.error(`[UPLOAD] Erro no processo de postagem: ${err.message}`);
        return false;
    }
}
