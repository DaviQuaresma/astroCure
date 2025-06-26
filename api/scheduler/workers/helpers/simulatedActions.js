const delay = (ms) => new Promise((res) => setTimeout(res, ms))
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

export async function simulateUserActions(page, credentials = {}) {
    console.log('[SIMULATION] Iniciando verificação de login no TikTok...')

    const email = credentials.login || 'Jedjdjdi123@outlook.com'
    const password = credentials.password || 'jddjdj233@'

    try {
        await page.goto('https://www.tiktok.com/login', { waitUntil: 'load' })
        await delay(2000)

        await page.goto('https://www.tiktok.com/login/phone-or-email', { waitUntil: 'load' })
        await delay(2000)

        await page.goto('https://www.tiktok.com/login/phone-or-email/email', { waitUntil: 'load' })
        await delay(2000)

        // Preencher os campos de login
        await page.fill('input[name="username"]', email)
        await page.fill('input[type="password"]', password)
        await delay(1000)

        // Clicar em "Log in"
        const loginBtn = await page.$('button[data-e2e="login-button"]')
        if (loginBtn) {
            await loginBtn.click()
        } else {
            throw new Error('Botão de login não encontrado.')
        }

        // Esperar resposta do login
        await delay(5000)
        if (page.url().includes('/login')) {
            throw new Error('Login falhou. Ainda na tela de login.')
        }

        await page.goto('https://www.tiktok.com/foryou', { waitUntil: 'load' }).catch(() => { })
        await page.waitForSelector('div[data-e2e="recommend-list-item-container"]', { timeout: 15000 })

        console.log('[TIKTOK] Login bem-sucedido.')
        await executarSimulacoes(page)

    } catch (err) {
        throw new Error(`[TIKTOK] Erro ao logar: ${err.message}`)
    }
}

async function executarSimulacoes(page) {
    console.log('[SIMULATION] Iniciando ações simuladas...')

    try {
        await delay(randomBetween(3000, 5000))

        for (let i = 0; i < randomBetween(3, 6); i++) {
            await page.mouse.wheel(0, randomBetween(200, 600))
            await delay(randomBetween(1000, 2500))
        }

        const links = await page.$$('a')
        if (links.length > 0) {
            const randomLink = links[randomBetween(0, links.length - 1)]
            const href = await randomLink.getAttribute('href')
            if (href && href.startsWith('http')) {
                console.log(`[SIMULATION] Navegando para: ${href}`)
                await page.goto(href, { waitUntil: 'load', timeout: 10000 }).catch(() => { })
                await delay(randomBetween(3000, 6000))
            }
        }

        const buttons = await page.$$('button')
        if (buttons.length > 0) {
            const randomButton = buttons[randomBetween(0, buttons.length - 1)]
            try {
                await randomButton.click({ delay: randomBetween(100, 300) })
                await delay(randomBetween(2000, 4000))
            } catch { }
        }

        console.log('[SIMULATION] Ações simuladas concluídas.')
    } catch (err) {
        console.error('[SIMULATION] Erro na simulação:', err.message)
    }
}
