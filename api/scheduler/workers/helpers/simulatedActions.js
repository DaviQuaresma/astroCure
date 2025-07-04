const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// Função para fechar outras abas do TikTok
const fecharOutrasPaginasTikTok = async (context, pageAtual) => {
    const pages = context.pages();
    for (const pg of pages) {
        if (pg !== pageAtual && pg.url().includes('tiktok.com')) {
            console.log(`[CLEANUP] Fechando aba extra do TikTok: ${pg.url()}`);
            try {
                await pg.close();
            } catch (err) {
                console.warn(`[CLEANUP] Falha ao fechar aba: ${err.message}`);
            }
        }
    }
};

export async function simulateUserActions(page, credentials = {}) {
    console.log('[SIMULATION] Verificando se já está logado no feed do TikTok...');

    try {
        try {
            await page.goto('https://www.tiktok.com/foryou', { waitUntil: 'domcontentloaded', timeout: 30000 })
        } catch (e) {
            console.warn('[TIKTOK] Timeout no goto, tentando forçar reload...')
            await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 })
        }

        await fecharOutrasPaginasTikTok(page.context(), page);

        const isAlreadyLogged = await page.waitForURL('**/foryou?lang=pt-BR', { timeout: 10000 }).catch(() => false);

        if (isAlreadyLogged || page.url().includes('/foryou')) {
            console.log('[TIKTOK] Já está logado, iniciando simulação...');
            return await executarSimulacoes(page);
        }

        console.log('[SIMULATION] Não está logado, iniciando login...');

        const email = credentials.email;
        const password = credentials.password;

        if (!email || !password) {
            throw new Error('Credenciais ausentes: email ou senha não definidos.')
        }

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
        try {
            await page.goto('https://www.tiktok.com/foryou', { waitUntil: 'domcontentloaded', timeout: 30000 })
        } catch (e) {
            console.warn('[TIKTOK] Timeout no goto, tentando forçar reload...')
            await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 })
        }
        await page.waitForSelector('div[data-e2e="recommend-list-item-container"]', { timeout: 60000 });

        console.log('[TIKTOK] Login bem-sucedido. Iniciando simulação...');
        await executarSimulacoes(page);
    } catch (err) {
        throw new Error(`[TIKTOK] Erro ao logar ou simular: ${err.message}`);
    }
}

async function executarSimulacoes(page) {
    console.log('[SIMULATION] Rodando simulação orgânica no feed...');

    // Verifica e fecha popup de recarga de coins se existir
    const botaoAgoraNao = await page.$('button:has-text("Agora não")');
    if (botaoAgoraNao) {
        console.log('[SIMULATION] Popup de recarga detectado. Fechando...');
        await botaoAgoraNao.click().catch(() => { });
        await delay(1000);
    }

    const frasesGenericas = [
        'Legal!', 'Nada haver kkk', 'Gostei 😄', '😂😂😂',
        'Muito bom!', 'Vídeo top!', 'Interessante...', '👀',
        'hahaha', 'Kkkkk', '👏👏👏'
    ];

    const processados = new Set();
    let scrollIndexAtual = 0;
    let consecutiveFailures = 0;
    const maxFailuresBeforeRestart = 3;

    while (processados.size < 2) {
        const timeoutMs = 15000;
        const startTime = Date.now();
        let article = null;

        while (!article && (Date.now() - startTime) < timeoutMs) {
            article = await page.$(`article[data-scroll-index="${scrollIndexAtual}"]`);
            if (!article) {
                await page.keyboard.press('ArrowDown');
                await delay(1500);
            }
        }

        if (!article) {
            console.warn(`[SIMULATION] Post #${scrollIndexAtual} travou. Fazendo refresh...`);
            consecutiveFailures++;

            if (consecutiveFailures >= maxFailuresBeforeRestart) {
                console.error(`[SIMULATION] ${consecutiveFailures} falhas consecutivas. Abortando simulação.`);
                throw new Error('restart-session');
            }

            scrollIndexAtual++;

            // Faz reload e espera carregar ao menos 1 post
            await page.reload({ waitUntil: 'domcontentloaded' });
            await delay(3000);
            continue;
        }

        // Reset de falhas após sucesso
        consecutiveFailures = 0;

        if (processados.has(scrollIndexAtual)) {
            scrollIndexAtual++;
            continue;
        }

        const isPublicidade = await article.$('div:has-text("Pub")');
        if (isPublicidade) {
            console.log(`[SIMULATION] Post #${scrollIndexAtual} é publicidade. Pulando...`);
            scrollIndexAtual++;
            continue;
        }

        console.log(`[SIMULATION] Interagindo com post #${scrollIndexAtual}`);
        processados.add(scrollIndexAtual);
        await delay(randomBetween(4000, 8000));

        // Ações sorteadas
        const sorteios = [
            {
                nome: 'Curtir', chance: 85, acao: async () => {
                    const likeButton = await article.$('span[data-e2e="like-icon"]');
                    if (likeButton) {
                        const btn = await likeButton.evaluateHandle(el => el.closest('button[aria-pressed="false"]'));
                        if (btn) {
                            await btn.click().catch(() => { });
                            console.log('→ Curtido.');
                        }
                    }
                }
            },
            {
                nome: 'Seguir', chance: 5, acao: async () => {
                    const btn = await article.$('button[data-e2e="feed-follow"]');
                    if (btn) {
                        await btn.click().catch(() => { });
                        console.log('→ Seguiu o perfil.');
                    }
                }
            },
            {
                nome: 'Salvar', chance: 10, acao: async () => {
                    const btn = await article.$('button[aria-label^="Adicionar aos favoritos"]');
                    if (btn) {
                        await btn.click().catch(() => { });
                        console.log('→ Salvo nos favoritos.');
                    }
                }
            },
        ];

        const escolherAcoesComChance = (lista, quantidade) => {
            const escolhidas = [];

            for (let i = 0; i < quantidade; i++) {
                const total = lista.reduce((acc, a) => acc + a.chance, 0);
                let rand = Math.random() * total;
                for (const item of lista) {
                    if (rand < item.chance) {
                        escolhidas.push(item);
                        break;
                    }
                    rand -= item.chance;
                }
            }

            return [...new Set(escolhidas)];
        };

        const acoesAleatorias = escolherAcoesComChance(sorteios, randomBetween(1, 2));
        for (const acao of acoesAleatorias) {
            console.log(`[DEBUG] Executando ação: ${acao.nome}`);
            await acao.acao();
            await delay(randomBetween(1000, 3000));
        }

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
