const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const fecharOutrasPaginasTikTok = async (context, pageAtual) => {
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

export const ensureLoggedIn = async (page, credentials = {}) => {
  try {
    await page.goto('https://www.tiktok.com/foryou', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
  } catch {
    console.warn('[LOGIN] Timeout no goto, tentando forçar reload...');
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  }

  await fecharOutrasPaginasTikTok(page.context(), page);

  const isLogged = await page.waitForURL('**/foryou?lang=pt-BR', {
    timeout: 10000,
  }).catch(() => false);

  if (isLogged || page.url().includes('/foryou')) {
    console.log('[LOGIN] Já está logado no TikTok.');
    return;
  }

  console.log('[LOGIN] Não está logado. Iniciando login...');

  const { email, password } = credentials;
  if (!email || !password) throw new Error('Credenciais ausentes');

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
    await page.goto('https://www.tiktok.com/foryou', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
  } catch {
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  }

  await page.waitForSelector('div[data-e2e="recommend-list-item-container"]', { timeout: 60000 });
  console.log('[LOGIN] Login bem-sucedido.');
};
