export const config = {
    runner: 'local',
    path: '/',
    specs: ['./tests/**/*.js'],
    maxInstances: 1,
    capabilities: [
        {
            platformName: 'Android',
            'appium:deviceName': 'emulator-5554',
            'appium:platformVersion': '11.0',
            'appium:automationName': 'UiAutomator2',
            'appium:appPackage': 'com.zhiliaoapp.musically',
            'appium:appActivity': 'com.ss.android.ugc.aweme.splash.SplashActivity',
            'appium:noReset': true,
            'appium:newCommandTimeout': 300,
        },
    ],
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost', // ou http://host.docker.internal se estiver no container
    waitforTimeout: 10000,
    connectionRetryTimeout: 180000, // 3 minutos
    connectionRetryCount: 3,
    services: ['appium'],
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
};
