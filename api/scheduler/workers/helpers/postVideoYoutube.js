import path from "path";

export async function postVideoYouTube(page, credentials = {}, videoPath, descricao = '') {
    const delay = (ms) => new Promise(res => setTimeout(res, ms));
    const context = page.context();
    const newPage = await context.newPage();

    for (const pg of context.pages()) {
        if (pg !== newPage && pg.url().includes('youtube.com')) {
            console.log(`[CLEANUP] Fechando aba extra do YouTube: ${pg.url()}`);
            try {
                await pg.close();
            } catch (err) {
                console.warn(`[CLEANUP] Falha ao fechar aba: ${err.message}`);
            }
        }
    }

    console.log('[YT_UPLOAD] Iniciando fluxo de postagem no YouTube Shorts...');

    try {
        const absoluteVideoPath = path.resolve('/videos', path.basename(videoPath));
        console.log(`[YT_UPLOAD] Caminho do vídeo: ${absoluteVideoPath}`);

        // 1. Acessar estúdio do canal
        await newPage.goto('https://studio.youtube.com', {
            waitUntil: 'load',
            timeout: 60000,
        });

        // 2. Tenta clicar no botão de upload do dashboard
        console.log('[YT_UPLOAD] Procurando botão direto do dashboard...');
        let uploadBtnClicked = false;

        try {
            const uploadDashboardBtn = await newPage.waitForSelector('ytcp-button#upload-button button', { timeout: 5000 });
            await uploadDashboardBtn.click();
            console.log('[YT_UPLOAD] Botão do dashboard clicado com sucesso.');
            uploadBtnClicked = true;
            await delay(4000);
        } catch (err) {
            console.warn('[YT_UPLOAD] Botão do dashboard não encontrado. Tentando via botão CREATE...');
        }

        if (!uploadBtnClicked) {
            // 3. Clicar no botão "Create"
            console.log('[YT_UPLOAD] Clicando em CREATE...');
            const createBtn = await newPage.waitForSelector('ytd-masthead button[aria-label="Create"]', { timeout: 10000 });
            await createBtn.click();
            await delay(1500);

            // 4. Clicar em "Upload Video"
            console.log('[YT_UPLOAD] Clicando em Upload Video via menu...');
            const uploadBtn = await newPage.waitForSelector('tp-yt-paper-item.style-scope.ytd-topbar-menu-button-renderer', { timeout: 10000 });
            await uploadBtn.click();
            await delay(4000);
        }

        // 4. Upload do vídeo
        console.log('[YT_UPLOAD] Aguardando botão "Select files"...');
        let selectBtn = null;

        for (let tentativa = 1; tentativa <= 5; tentativa++) {
            try {
                selectBtn = await newPage.waitForSelector('button[aria-label="Select files"]', { timeout: 8000 });
                await selectBtn.click();
                console.log(`[YT_UPLOAD] Botão "Select files" clicado. (tentativa ${tentativa})`);
                await delay(1000);

                const inputFile = await newPage.$('input[type="file"]');
                if (!inputFile) throw new Error('Campo de upload não encontrado');

                await newPage.evaluate(el => {
                    el.style.display = 'block';
                    el.style.opacity = '1';
                    el.style.position = 'fixed';
                    el.removeAttribute('aria-hidden');
                    el.removeAttribute('tabindex');
                }, inputFile);

                await delay(1000);
                await inputFile.setInputFiles(absoluteVideoPath);

                console.log('[YT_UPLOAD] Vídeo enviado com sucesso!');
                break;
            } catch (err) {
                console.warn(`[YT_UPLOAD] Tentativa ${tentativa} falhou: ${err.message}`);
                await newPage.waitForTimeout(3000);
            }
        }

        // Aguarda carregamento da tela de detalhes
        await newPage.waitForSelector('div[aria-label*="Add a title"]', { timeout: 30000 });
        const titleBox = await newPage.$('div[aria-label*="Add a title"]');
        const descBox = await newPage.$('div[aria-label*="Tell viewers about your video"]');

        if (!titleBox || !descBox) throw new Error('Campos de título ou descrição não encontrados');

        console.log('[YT_UPLOAD] Preenchendo título e descrição...');
        await titleBox.click();
        await newPage.keyboard.down('Control');
        await newPage.keyboard.press('A');
        await newPage.keyboard.up('Control');
        await newPage.keyboard.press('Backspace');
        await delay(200);
        await newPage.keyboard.type(descricao, { delay: 100 });

        await descBox.click();
        await newPage.keyboard.type(descricao, { delay: 100 });
        await delay(500);

        // Selecionar "Yes, it's made for kids"
        console.log('[YT_UPLOAD] Selecionando "Yes, it\'s made for kids"...');
        const madeForKidsRadio = await newPage.waitForSelector('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_MFK"]', { timeout: 10000 });
        await madeForKidsRadio.click();
        await delay(800);

        // Avançar nos passos
        console.log('[YT_UPLOAD] Avançando etapas...');
        for (let i = 1; i <= 3; i++) {
            const nextBtn = await newPage.waitForSelector('button[aria-label="Next"]:not([aria-disabled="true"])', { timeout: 10000 });
            await nextBtn.click();
            console.log(`[YT_UPLOAD] NEXT (${i}/3) clicado.`);
            await delay(1500);
        }

        // Visibilidade: Public
        const publicOption = await newPage.waitForSelector('tp-yt-paper-radio-button[name="PUBLIC"]', { timeout: 10000 });
        await publicOption.click();
        await delay(1000);

        // Publicar
        const publishBtn = await newPage.waitForSelector('button[aria-label="Publish"]:not([aria-disabled="true"])', { timeout: 10000 });
        await publishBtn.click();
        console.log('[YT_UPLOAD] Vídeo publicado com sucesso!');

        return true;
    } catch (err) {
        console.error(`[YT_UPLOAD] Erro no processo de postagem: ${err.message}`);
        return false;
    }
}
