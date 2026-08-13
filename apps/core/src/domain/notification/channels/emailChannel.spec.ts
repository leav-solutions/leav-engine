import {type IConfig} from '../../../_types/config';
import {type INotification} from '../../../_types/notification';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IGlobalSettingsDomain} from '../../globalSettings/globalSettingsDomain';
import {type IMailerService} from '../../../infra/mailer/mailerService';
import {type IUserDomain} from '../../user/userDomain';
import {mockCtx} from '../../../__tests__/mocks/shared';
import emailChannel, {type INotificationByEmailChannelDeps} from './emailChannel';

describe('emailChannel', () => {
    const mockConfig = {
        lang: {default: 'en'},
        server: {publicUrl: 'http://core.leav.localhost'},
    } as IConfig;

    const mockGlobalSettingsDomain: Mockify<IGlobalSettingsDomain> = {
        getSettings: global.__mockPromise({name: 'My app', icon: null}),
    };

    const mockUserDomain: Mockify<IUserDomain> = {
        getUserIdentity: global.__mockPromise({
            id: '1',
            getEmail: () => Promise.resolve('user@domain.com'),
            getLabel: () => Promise.resolve('User'),
        }),
    };

    const baseNotification: INotification = {
        id: 'notif1',
        date: 0,
        userId: '1',
        level: 'success',
        title: 'You were mentioned',
        message: 'A message with <b>injected</b> content',
        relatedEntities: [{url: 'http://core.leav.localhost/record', label: 'See the record'}],
        attachments: [{url: 'http://core.leav.localhost/export', label: 'See the export'}],
    };

    const setup = (mailerService: Mockify<IMailerService>) =>
        emailChannel({
            config: mockConfig,
            'core.infra.mailer.mailerService': mailerService as IMailerService,
            'core.domain.globalSettings': mockGlobalSettingsDomain as IGlobalSettingsDomain,
            'core.domain.user': mockUserDomain as IUserDomain,
        } as INotificationByEmailChannelDeps);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('sends the rendered template with the expected assets, heading, message and links', async () => {
        const mockMailerService: Mockify<IMailerService> = {
            sendEmail: global.__mockPromise(true),
        };

        const channel = setup(mockMailerService);
        await channel.sendNotifications([baseNotification], mockCtx);

        expect(mockMailerService.sendEmail.mock.calls.length).toBe(1);
        const sentHtml = mockMailerService.sendEmail.mock.calls[0][0].html;

        expect(sentHtml).toContain('http://core.leav.localhost/mail-assets/logo-aristid.png');
        expect(sentHtml).toContain('http://core.leav.localhost/mail-assets/illustration-notification.png');
        expect(sentHtml).toContain('http://core.leav.localhost/mail-assets/logo-product-default.png');
        expect(sentHtml).toContain('You were mentioned');
        expect(sentHtml).toContain('#0141ec');
        expect(sentHtml).toContain('href="http://core.leav.localhost/record"');
        expect(sentHtml).toContain('href="http://core.leav.localhost/export"');
        expect(sentHtml).not.toContain('Bonne journée');
        expect(sentHtml).not.toContain('Merci');
        expect(sentHtml).not.toContain('#22BC66');
    });

    test('escapes the message so record labels cannot inject HTML', async () => {
        const mockMailerService: Mockify<IMailerService> = {
            sendEmail: global.__mockPromise(true),
        };

        const channel = setup(mockMailerService);
        await channel.sendNotifications([{...baseNotification, message: 'Mentioned on <b>Record</b>'}], mockCtx);

        const sentHtml = mockMailerService.sendEmail.mock.calls[0][0].html;
        expect(sentHtml).not.toContain('<b>Record</b>');
        expect(sentHtml).toContain('&lt;b&gt;Record&lt;/b&gt;');
    });

    test('falls back to the default language template when the context language is not supported', async () => {
        const mockMailerService: Mockify<IMailerService> = {
            sendEmail: global.__mockPromise(true),
        };

        const channel = setup(mockMailerService);
        await channel.sendNotifications([baseNotification], {...mockCtx, lang: 'de'} as IQueryInfos);

        expect(mockMailerService.sendEmail.mock.calls.length).toBe(1);
        expect(mockMailerService.sendEmail.mock.calls[0][0].html).toContain('You were mentioned');
    });
});
