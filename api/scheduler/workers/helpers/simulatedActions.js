const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

export async function simulateUserActions(page, credentials = {}) {
    console.log('[SIMULATION] Verificando se já está logado no feed do TikTok...');

    try {
        await page.goto('https://www.tiktok.com/foryou', { waitUntil: 'load' });
        const isAlreadyLogged = await page.waitForURL('**/foryou?lang=pt-BR', { timeout: 10000 }).catch(() => false);

        if (isAlreadyLogged || page.url().includes('/foryou')) {
            console.log('[TIKTOK] Já está logado, iniciando simulação...');
            return await executarSimulacoes(page);
        }

        console.log('[SIMULATION] Não está logado, iniciando login...');

        const email = credentials.login || 'Jedjdjdi123@outlook.com';
        const password = credentials.password || 'jddjdj233@';

        await page.goto('https://www.tiktok.com/login', { waitUntil: 'load' });
        await delay(2000);
        await page.goto('https://www.tiktok.com/login/phone-or-email', { waitUntil: 'load' });
        await delay(2000);
        await page.goto('https://www.tiktok.com/login/phone-or-email/email', { waitUntil: 'load' });
        await delay(2000);

        await page.fill('input[name="username"]', email);
        await page.fill('input[type="password"]', password);
        await delay(1000);

        const loginBtn = await page.$('button[data-e2e="login-button"]');
        if (loginBtn) {
            await loginBtn.click();
        } else {
            throw new Error('Botão de login não encontrado.');
        }

        await delay(8000);
        await page.goto('https://www.tiktok.com/foryou', { waitUntil: 'load' }).catch(() => { });
        await page.waitForSelector('div[data-e2e="recommend-list-item-container"]', { timeout: 15000 });

        console.log('[TIKTOK] Login bem-sucedido. Iniciando simulação...');
        await executarSimulacoes(page);
    } catch (err) {
        throw new Error(`[TIKTOK] Erro ao logar ou simular: ${err.message}`);
    }
}

async function executarSimulacoes(page) {
    console.log('[SIMULATION] Rodando simulação orgânica no feed...');

    const totalPosts = randomBetween(30, 50);
    const frasesGenericas = [
        'Legal!',
        'Nada haver kkk',
        'Gostei 😄',
        '😂😂😂',
        'Muito bom!',
        'Vídeo top!',
        'Interessante...',
        '👀',
        'hahaha',
        'Kkkkk',
        '👏👏👏'
    ];

    let currentUrl = page.url();

    for (let i = 0; i < totalPosts; i++) {
        console.log(`[SIMULATION] Interagindo com post ${i + 1}/${totalPosts}`);
        await delay(randomBetween(10000, 15000));

        if (Math.random() < 0.4) {
            const likeBtn = await page.$('span[data-e2e="like-icon"]');
            if (likeBtn) await likeBtn.click().catch(() => { });
            console.log('→ Curtido.');
        }

        if (Math.random() < 0.2) {
            const followBtn = await page.$('button:has-text("Follow")');
            if (followBtn) await followBtn.click().catch(() => { });
            console.log('→ Seguiu o perfil.');
        }

        if (Math.random() < 0.15) {
            const saveBtn = await page.$('span[data-e2e="collect-icon"]');
            if (saveBtn) await saveBtn.click().catch(() => { });
            console.log('→ Salvo nos favoritos.');
        }

        if (Math.random() < 0.1) {
            try {
                const commentBtn = await page.$('button[data-e2e="comment-button"]');
                if (commentBtn) {
                    await commentBtn.click();
                    await delay(3000);

                    const textarea = await page.$('div[data-e2e="comment-editor"] textarea');
                    if (textarea) {
                        const msg = frasesGenericas[randomBetween(0, frasesGenericas.length - 1)];
                        await textarea.fill(msg);
                        await delay(1000);

                        const sendBtn = await page.$('button[data-e2e="comment-post-button"]');
                        if (sendBtn) {
                            await sendBtn.click();
                            console.log(`→ Comentado: "${msg}"`);
                        }
                    }
                }
            } catch (err) {
                console.warn('→ Falha ao comentar:', err.message);
            }
        }

        currentUrl = await scrollParaProximoVideo(page, currentUrl);
    }

    console.log('[SIMULATION] Simulação completa.');
}

async function scrollParaProximoVideo(page, ultimaUrl) {
    try {
        await page.keyboard.press('ArrowDown');
        await delay(randomBetween(1500, 3000));

        const novaUrl = page.url();
        if (novaUrl === ultimaUrl) {
            console.log('[SIMULATION] Vídeo não mudou, tentando novamente com PageDown...');
            await page.keyboard.press('PageDown');
            await delay(2000);
        }

        return page.url();
    } catch (err) {
        console.warn('[SIMULATION] Erro ao tentar avançar vídeo:', err.message);
        return ultimaUrl;
    }
}
