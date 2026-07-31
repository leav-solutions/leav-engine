import {getMailTemplateAssets} from './getMailTemplateAssets';

describe('getMailTemplateAssets', () => {
    test('returns the brand logo and illustration URLs', () => {
        const assets = getMailTemplateAssets({publicUrl: 'https://core.leav.localhost', hasGlobalIcon: false});

        expect(assets.brandLogoUrl).toBe('https://core.leav.localhost/mail-assets/logo-aristid.png');
        expect(assets.illustrationUrl).toBe('https://core.leav.localhost/mail-assets/illustration-notification.png');
    });

    test('points productLogoUrl to the global icon route when a global icon is configured', () => {
        const assets = getMailTemplateAssets({publicUrl: 'https://core.leav.localhost', hasGlobalIcon: true});

        expect(assets.productLogoUrl).toBe('https://core.leav.localhost/global-icon/medium');
    });

    test('falls back productLogoUrl to the default PNG when no global icon is configured', () => {
        const assets = getMailTemplateAssets({publicUrl: 'https://core.leav.localhost', hasGlobalIcon: false});

        expect(assets.productLogoUrl).toBe('https://core.leav.localhost/mail-assets/logo-product-default.png');
    });
});
