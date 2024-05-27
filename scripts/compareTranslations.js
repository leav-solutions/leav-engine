// Function that compares translations files from admin, core, data-studio, login, portal and libs/ui projects.
// The function outputs the missing translations. It fails if there are any ; Succeed otherwise.
const fs = require('fs');

const moduleLocalesPaths = [
    'apps/admin/public/locales/',
    'apps/core/src/locales/',
    'apps/data-studio/src/locales/',
    'apps/login/src/locales/',
    'apps/portal/src/locales/',
    'libs/ui/src/locales/'
];

const translationsPathsByModule = moduleLocalesPaths.map(moduleLocalePath =>
    fs
        .readdirSync(moduleLocalePath)
        .flatMap(moduleLocale =>
            fs.readdirSync(moduleLocalePath + moduleLocale).map(file => moduleLocalePath + moduleLocale + '/' + file)
        )
);

const translationsDesync = [];

for (const translationFiles of translationsPathsByModule) {
    const [firstLocalePath, ...restLocalesPaths] = translationFiles;
    const firstLocaleTranslation = require(__dirname + '/../' + firstLocalePath);
    for (const localePath of restLocalesPaths) {
        const nextTranslationFile = require(__dirname + '/../' + localePath);
        compareFilesBothWay(
            {
                translations: firstLocaleTranslation,
                errorDisplayName: firstLocalePath
            },
            {
                translations: nextTranslationFile,
                errorDisplayName: localePath
            }
        );
    }
}

if (translationsDesync.length > 0) {
    console.error('There is a desynchronization between translations files: ', translationsDesync);
    process.exit(1);
}

process.exit(0);

function compareFilesBothWay(source, toCheck) {
    verifyTranslationKeys(source, toCheck);
    verifyTranslationKeys(toCheck, source);
}

function verifyTranslationKeys(source, toCheck, path = []) {
    Object.keys(source.translations).forEach(translationKey => {
        if (typeof source.translations[translationKey] === 'object') {
            if (toCheck.translations[translationKey]) {
                verifyTranslationKeys(
                    {translations: source.translations[translationKey], errorDisplayName: source.errorDisplayName},
                    {translations: toCheck.translations[translationKey], errorDisplayName: toCheck.errorDisplayName},
                    [...path, translationKey]
                );
            } else {
                translationsDesync.push(
                    `Missing ${path.join('/')}/${translationKey} in ${toCheck.errorDisplayName} from ${
                        source.errorDisplayName
                    }`
                );
            }
        } else if (!toCheck.translations[translationKey]) {
            translationsDesync.push(
                `Missing ${path.join('/')}/${translationKey} in ${toCheck.errorDisplayName} from ${
                    source.errorDisplayName
                }`
            );
        }
    });
}
