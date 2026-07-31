export const MAIL_ASSETS_ENDPOINT = 'mail-assets';

export interface IMailTemplateAssets {
    brandLogoUrl: string;
    productLogoUrl: string;
    illustrationUrl: string;
}

export const getMailTemplateAssets = ({
    publicUrl,
    hasGlobalIcon,
}: {
    publicUrl: string;
    hasGlobalIcon: boolean;
}): IMailTemplateAssets => {
    const assetsUrl = `${publicUrl}/${MAIL_ASSETS_ENDPOINT}`;

    return {
        brandLogoUrl: `${assetsUrl}/logo-aristid.png`,
        illustrationUrl: `${assetsUrl}/illustration-notification.png`,
        // The global icon route falls back to an SVG, which mail clients do not render: use a PNG
        // fallback instead when no icon is configured on the instance. Instances without a global icon
        // override that PNG in their own image (/app/assets/mail/), see docs/mail-templates.md.
        productLogoUrl: hasGlobalIcon ? `${publicUrl}/global-icon/medium` : `${assetsUrl}/logo-product-default.png`,
    };
};
