import path from "path";

export async function postVideoInstagram(page, credentials = {}, videoPath, descricao = '') {
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    const context = page.context();
    const newPage = await context.newPage();
    let ultimaCoordenadaClick = null;

    for (const pg of context.pages()) {
        if (pg !== newPage && pg.url().includes('instagram.com')) {
            console.log(`[CLEANUP] Fechando aba extra do Instagram: ${pg.url()}`);
            try {
                await pg.close();
            } catch (err) {
                console.warn(`[CLEANUP] Falha ao fechar aba: ${err.message}`);
            }
        }
    }

    console.log('[IG_UPLOAD] Iniciando fluxo de postagem no Instagram...');

    try {
        const absoluteVideoPath = path.resolve('/videos', path.basename(videoPath));
        console.log(`[IG_UPLOAD] Caminho do vídeo: ${absoluteVideoPath}`);

        await newPage.goto('https://www.instagram.com/', {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
        });

        // Aguardar o botão "Nova publicação" (ícone de +)
        console.log('[IG_UPLOAD] Aguardando botão "Nova publicação"...');
        const novoPostAnchor = await newPage.$('a[role="link"]:has(svg[aria-label="Novo post"])');
        if (!novoPostAnchor) throw new Error("Botão de novo post não encontrado.");
        await novoPostAnchor.click();
        await delay(1500);

        // Força o envio direto para o input, ignorando o botão
        const inputFileHandle = await newPage.$('input[type="file"]');
        if (!inputFileHandle) throw new Error('Input de upload não encontrado (invisível)');
        await inputFileHandle.setInputFiles(absoluteVideoPath, { force: true });
        console.log('[IG_UPLOAD] Vídeo enviado com sucesso (forçado mesmo com input oculto).');

        // Clicando duas vezes no botão "Avançar"
        for (let i = 0; i < 2; i++) {
            try {
                const avancarBtn = await newPage.waitForSelector('div[role="button"]:has-text("Avançar")', { timeout: 8000 });
                const box = await avancarBtn.boundingBox();

                if (!box) throw new Error(`Não foi possível obter boundingBox do botão Avançar ${i + 1}`);

                // Salva as coordenadas na segunda vez
                if (i === 1) {
                    ultimaCoordenadaClick = {
                        x: box.x + box.width / 2,
                        y: box.y + box.height / 2,
                    };
                }

                await newPage.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
                console.log(`[IG_UPLOAD] Botão 'Avançar' (${i + 1}) clicado.`);
                await delay(3000);
            } catch {
                throw new Error(`[IG_UPLOAD] Botão 'Avançar' (${i + 1}) não encontrado.`);
            }
        }

        // Preenchendo o campo de descrição
        try {
            console.log('[IG_UPLOAD] Preenchendo descrição...');
            const descricaoField = await newPage.$('div[aria-label="Escreva uma legenda..."][role="textbox"]');
            if (!descricaoField) throw new Error('Campo de descrição não encontrado');

            await descricaoField.click();
            await newPage.keyboard.down('Control');
            await newPage.keyboard.press('A');
            await newPage.keyboard.up('Control');
            await newPage.keyboard.press('Backspace');
            await delay(300);
            await newPage.keyboard.type(descricao, { delay: 120 });
            console.log('[IG_UPLOAD] Descrição preenchida com sucesso.');
        } catch (err) {
            console.error('[IG_UPLOAD] Erro ao preencher descrição:', err.message);
        }

        // Clicar no botão "Compartilhar" reutilizando as coordenadas
        if (ultimaCoordenadaClick) {
            await newPage.mouse.click(ultimaCoordenadaClick.x, ultimaCoordenadaClick.y);
            console.log('[IG_UPLOAD] Botão "Compartilhar" clicado via coordenadas reaproveitadas.');
        } else {
            throw new Error('Coordenadas do botão "Compartilhar" não disponíveis.');
        }

        // Aguardar confirmação de que foi postado
        try {
            await newPage.waitForSelector('h3:has-text("Seu reel foi compartilhado")', { timeout: 60000 });
            console.log('[IG_UPLOAD] Postagem confirmada com sucesso!');
        } catch {
            console.warn('[IG_UPLOAD] Confirmação de postagem não detectada. Verifique manualmente.');
        }

        // Tenta clicar no botão OK se aparecer (etapa intermediária do Instagram)
        try {
            const okBtn = await newPage.waitForSelector('button:has-text("OK")', { timeout: 10000 });
            await okBtn.click();
            console.log('[IG_UPLOAD] Botão OK clicado.');
        } catch {
            console.warn('[IG_UPLOAD] Botão OK não encontrado ou desnecessário.');
        }

        console.log('[IG_UPLOAD] Etapas iniciais de upload concluídas. Fluxo interrompido conforme escopo atual.');
        return true;
    } catch (err) {
        console.error(`[IG_UPLOAD] Erro no processo de postagem: ${err.message}`);
        return false;
    }
}
