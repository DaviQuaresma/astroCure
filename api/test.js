import { remote } from 'webdriverio';

const run = async () => {
    const driver = await remote({
        hostname: 'localhost',
        port: 4723,
        path: '/',
        capabilities: {
            platformName: 'Android',
            'appium:deviceName': 'emulator-5554',
            'appium:automationName': 'UiAutomator2',
            'appium:appPackage': 'com.android.settings',
            'appium:appActivity': '.Settings',
            'appium:noReset': true,
            'appium:newCommandTimeout': 300,
        }
    });

    console.log('✅ Sessão iniciada com sucesso!');
    await driver.deleteSession();
};

run().catch(err => {
    console.error('❌ Erro ao iniciar sessão:', err);
});
