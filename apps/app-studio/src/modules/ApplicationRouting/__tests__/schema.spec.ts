import {ApplicationSchema} from '../schema';

describe('ApplicationSchema — creationPanels group', () => {
    const baseApplication = {
        workspaces: [
            {
                id: '1',
                title: {fr: 'Test'},
                type: 'library',
                libraryId: 'home',
            },
        ],
        libraries: {
            home: {
                libraryPanels: [],
                recordPanels: [],
            },
        },
    };

    const makeApplication = (creationPanels: unknown, otherLibraryProps: object = {}) => ({
        ...baseApplication,
        libraries: {
            home: {
                libraryPanels: [],
                recordPanels: [],
                ...otherLibraryProps,
                ...(creationPanels === undefined ? {} : {creationPanels}),
            },
        },
    });

    it('parses a config without any creationPanels (current configs stay valid)', () => {
        const result = ApplicationSchema.safeParse(baseApplication);

        expect(result.success).toBe(true);
    });

    it('parses creationPanels entries and forces the creationForm panel shape through defaults', () => {
        const result = ApplicationSchema.safeParse(
            makeApplication([
                {id: 'create-simple', formId: 'creation', name: {fr: 'Créer une UB simple'}},
                {
                    id: 'create-from-model',
                    formId: 'creation_model',
                    name: {fr: 'À partir d’un modèle'},
                    icon: 'fa-copy',
                },
            ]),
        );

        expect(result.success).toBe(true);
        expect(result.data?.libraries.home.creationPanels).toEqual([
            {
                id: 'create-simple',
                formId: 'creation',
                name: {fr: 'Créer une UB simple'},
                icon: 'fa-plus',
                type: 'creationForm',
                isStandalone: true,
            },
            {
                id: 'create-from-model',
                formId: 'creation_model',
                name: {fr: 'À partir d’un modèle'},
                icon: 'fa-copy',
                type: 'creationForm',
                isStandalone: true,
            },
        ]);
    });

    it('rejects an entry without a name (it is the creation button label)', () => {
        const result = ApplicationSchema.safeParse(makeApplication([{id: 'create-simple', formId: 'creation'}]));

        expect(result.success).toBe(false);
    });

    it('rejects an entry whose name has no language', () => {
        const result = ApplicationSchema.safeParse(
            makeApplication([{id: 'create-simple', formId: 'creation', name: {}}]),
        );

        expect(result.success).toBe(false);
    });

    it('rejects an entry without a formId', () => {
        const result = ApplicationSchema.safeParse(makeApplication([{id: 'create-simple', name: {fr: 'Créer'}}]));

        expect(result.success).toBe(false);
    });

    it('reports a duplicate id between a creationPanel and a recordPanel', () => {
        const result = ApplicationSchema.safeParse(
            makeApplication([{id: 'clashing-id', formId: 'creation', name: {fr: 'Créer'}}], {
                recordPanels: [{id: 'clashing-id', type: 'editionForm', formId: 'edition'}],
            }),
        );

        expect(result.success).toBe(false);
        expect(result.error?.issues.map(issue => issue.message).join('\n')).toContain('clashing-id');
    });
});
