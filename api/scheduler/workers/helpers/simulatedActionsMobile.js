import { remote } from 'webdriverio'

const delay = (ms) => new Promise((res) => setTimeout(res, ms))
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

const frasesGenericas = [
    'Legal!', 'Nada haver kkk', 'Gostei 😄', '😂😂😂', 'Muito bom!',
    'Vídeo top!', 'Interessante...', '👀', 'hahaha', 'Kkkkk', '👏👏👏'
]

const DEBUG = true // ⬅️ Habilita logs detalhados

export async function simulateUserActions(driver) {
    console.log('[SIMULATION] Iniciando simulação no TikTok mobile...')

    for (let i = 0; i < randomBetween(20, 30); i++) {
        console.log(`[SIMULATION] Post ${i + 1}`)
        await delay(randomBetween(8000, 12000))

        // Scroll para baixo com coordenadas e logs debug
        const startX = 500
        const startY = 1600
        const endX = 500
        const endY = 400

        if (DEBUG) {
            console.log(`[DEBUG] Realizando swipe de (${startX}, ${startY}) até (${endX}, ${endY})`)
        }

        await driver.performActions([
            {
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: startX, y: startY },
                    { type: 'pointerDown', button: 0 },
                    { type: 'pause', duration: 200 },
                    { type: 'pointerMove', duration: 300, x: endX, y: endY },
                    { type: 'pointerUp', button: 0 }
                ]
            }
        ])
        await driver.releaseActions()

        // Curtir
        if (Math.random() < 0.4) {
            try {
                const likeBtn = await driver.$('//android.widget.Button[contains(@content-desc, "curtir")]')
                if (await likeBtn.isDisplayed()) {
                    await likeBtn.click()
                    console.log('→ Curtido.')
                }
            } catch (_) { }
        }

        // Seguir
        if (Math.random() < 0.2) {
            try {
                const followBtn = await driver.$('//android.widget.Button[contains(@text, "Seguir")]')
                if (await followBtn.isDisplayed()) {
                    await followBtn.click()
                    console.log('→ Seguiu o perfil.')
                }
            } catch (_) { }
        }

        // Salvar
        if (Math.random() < 0.15) {
            try {
                const saveBtn = await driver.$('//android.widget.Button[contains(@content-desc, "favorito")]')
                if (await saveBtn.isDisplayed()) {
                    await saveBtn.click()
                    console.log('→ Salvo nos favoritos.')
                }
            } catch (_) { }
        }

        // Comentar
        if (Math.random() < 0.1) {
            try {
                const commentBtn = await driver.$('//android.widget.Button[contains(@content-desc, "comentar")]')
                await commentBtn.click()
                await delay(3000)

                const input = await driver.$('//android.widget.EditText')
                const msg = frasesGenericas[randomBetween(0, frasesGenericas.length - 1)]
                await input.setValue(msg)
                await delay(1000)

                const sendBtn = await driver.$('//android.widget.Button[contains(@text, "Publicar")]')
                await sendBtn.click()

                console.log(`→ Comentado: "${msg}"`)
                await delay(2000)
            } catch (err) {
                console.warn('→ Erro ao comentar:', err.message)
            }
        }
    }

    console.log('[SIMULATION] Simulação finalizada.')
}
