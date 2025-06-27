const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

export async function simulateUserActions(page, credentials = {}) {
    console.log('[SIMULATION] Verificando se já está logado no feed do TikTok...');
    console.log("teste 1")

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

    const frasesGenericas = [
        'Legal!', 'Nada haver kkk', 'Gostei 😄', '😂😂😂',
        'Muito bom!', 'Vídeo top!', 'Interessante...', '👀',
        'hahaha', 'Kkkkk', '👏👏👏'
    ];

    const processados = new Set(); // evita duplicar post
    let scrollIndexAtual = 0;

    while (processados.size < 50) {
        const article = await page.$(`article[data-scroll-index="${scrollIndexAtual}"]`);
        if (!article) {
            // Scroll até carregar próximo post
            await page.keyboard.press('ArrowDown');
            await delay(randomBetween(1000, 2000));
            continue;
        }

        // Ignorar se já processado
        if (processados.has(scrollIndexAtual)) {
            scrollIndexAtual++;
            continue;
        }

        console.log(`[SIMULATION] Interagindo com post #${scrollIndexAtual}`);
        processados.add(scrollIndexAtual);
        await delay(randomBetween(3000, 6000));

        // CURTIR
        if (Math.random() < 0.5) {
            const likeBtn = await article.$('button[aria-label="Curtir vídeo"][aria-pressed="false"]');
            if (likeBtn) {
                await likeBtn.click().catch(() => { });
                console.log('→ Curtido.');
            }
        }

        // SEGUIR
        if (Math.random() < 0.3) {
            const followBtn = await article.$('button[data-e2e="feed-follow"]');
            if (followBtn) {
                await followBtn.click().catch(() => { });
                console.log('→ Seguiu o perfil.');
            }
        }

        // SALVAR
        if (Math.random() < 0.2) {
            const saveBtn = await article.$('button[aria-label^="Adicionar aos favoritos"]');
            if (saveBtn) {
                await saveBtn.click().catch(() => { });
                console.log('→ Salvo nos favoritos.');
            }
        }

        // Scroll suave para o próximo post
        await scrollParaProximoPost(page, scrollIndexAtual);
        scrollIndexAtual++;
    }

    console.log('[SIMULATION] Simulação completa.');
}

async function scrollParaProximoPost(page, scrollIndexAtual) {
    let tentativas = 0;
    let novoArticle = null;

    while (!novoArticle && tentativas < 5) {
        await page.keyboard.press('ArrowDown');
        await delay(randomBetween(1000, 2000));
        novoArticle = await page.$(`article[data-scroll-index="${scrollIndexAtual + 1}"]`);
        tentativas++;
    }

    if (!novoArticle) {
        console.warn(`[SIMULATION] Não conseguiu carregar o post ${scrollIndexAtual + 1}`);
    }
}
