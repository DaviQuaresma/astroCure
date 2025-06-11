const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

export async function simulateUserActions(page) {
    console.log('[SIMULATION] Iniciando ações simuladas...');

    try {
        await page.goto('https://www.tiktok.com', { waitUntil: 'load', timeout: 30000 });
        await delay(randomBetween(3000, 5000));
        
        // Scroll vertical com pausas aleatórias
        for (let i = 0; i < randomBetween(3, 6); i++) {
            await page.mouse.wheel(0, randomBetween(200, 600));
            await delay(randomBetween(1000, 2500));
        }

        // Navegação leve
        const links = await page.$$('a');
        if (links.length > 0) {
            const randomLink = links[randomBetween(0, links.length - 1)];
            const href = await randomLink.getAttribute('href');
            if (href && href.startsWith('http')) {
                console.log(`[SIMULATION] Navegando para: ${href}`);
                await page.goto(href, { waitUntil: 'load', timeout: 10000 }).catch(() => { });
                await delay(randomBetween(3000, 6000));
            }
        }

        // Interação opcional: clicar em botão visível
        const buttons = await page.$$('button');
        if (buttons.length > 0) {
            const randomButton = buttons[randomBetween(0, buttons.length - 1)];
            try {
                await randomButton.click({ delay: randomBetween(100, 300) });
                await delay(randomBetween(2000, 4000));
            } catch { }
        }

        console.log('[SIMULATION] Ações simuladas concluídas.');
    } catch (err) {
        console.error('[SIMULATION] Erro na simulação:', err.message);
    }
}
