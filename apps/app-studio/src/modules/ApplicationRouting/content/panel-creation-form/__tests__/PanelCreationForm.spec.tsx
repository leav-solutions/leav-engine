import {render, screen, waitFor} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import {type Application} from '../../../types';
import {PanelCreationForm} from '../PanelCreationForm';

const {mockNavigate, mockSaveValues} = vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    mockSaveValues: vi.fn(),
}));

vi.mock('@leav/ui', async () => ({
    ...(await vi.importActual('@leav/ui')),
    EditRecordPage: ({onCreate}: {onCreate: (record: {id: string}) => Promise<void>}) => (
        <button onClick={() => onCreate({id: 'created-42'})}>submit-create</button>
    ),
    useExecuteSaveValueBatchMutation: () => ({saveValues: mockSaveValues}),
}));

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useNavigate: () => mockNavigate,
    useParams: () => ({
        workspaceId: '42',
        panelId: 'home-list',
        recordId: 'newRecord',
        where: 'popup',
        recordPanelId: 'create-simple',
    }),
}));

vi.mock('../../../utils/retrievePanelDetails', () => ({
    retrievePanelDetails: vi.fn(),
}));

vi.mock('../useGetPreviousPanelParams', () => ({
    useGetPreviousPanelParams: vi.fn(),
}));

vi.mock('../../../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: vi.fn(),
}));

import {retrievePanelDetails} from '../../../utils/retrievePanelDetails';
import {useGetPreviousPanelParams} from '../useGetPreviousPanelParams';
import {useApplicationSettingsContext} from '../../../../../config/application-instance/application-settings/useApplicationSettingsContext';

describe('PanelCreationForm', () => {
    const application: Application = {
        workspaces: [
            {
                id: '42',
                title: {fr: 'Test'},
                type: 'library',
                libraryId: 'home',
            },
        ],
        libraries: {
            home: {
                libraryPanels: [],
                recordPanels: [],
                creationPanels: [
                    {
                        id: 'create-simple',
                        type: 'creationForm',
                        formId: 'creation',
                        name: {fr: 'Créer'},
                        icon: 'fa-plus',
                        isStandalone: true,
                    },
                ],
            },
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useApplicationSettingsContext).mockReturnValue([application] as any);
    });

    it('closes the panel after a top-level creation, without linking to any parent', async () => {
        // top-level creation: no parent, no attributeSource on the panel — the underlying explorer
        // detects the new record by itself (library-wide record-updates subscription)
        vi.mocked(retrievePanelDetails).mockReturnValue({
            currentPanel: {id: 'create-simple', type: 'creationForm', formId: 'creation', isStandalone: true},
            libraryId: 'home',
            displayedLibraryId: 'home',
            panelType: 'creationPanels',
        } as any);
        vi.mocked(useGetPreviousPanelParams).mockReturnValue({previousRecordId: undefined} as any);
        render(<PanelCreationForm libraryId="home" formId="creation" />);

        // the form submits and reports the created record
        await userEvent.click(screen.getByText('submit-create'));

        // the popup closes without any parent-link save
        await waitFor(() => {
            expect(mockSaveValues).not.toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('../../..', {relative: 'path'});
        });
    });

    it('links the created record to its parent before closing (linked creation)', async () => {
        // linked creation: the panel carries an attributeSource and a parent record is in the URL
        vi.mocked(retrievePanelDetails).mockReturnValue({
            currentPanel: {
                id: 'create-simple',
                type: 'creationForm',
                formId: 'creation',
                isStandalone: true,
                attributeSource: 'home_linked_records',
            },
            libraryId: 'home',
            displayedLibraryId: 'home',
            panelType: 'recordPanels',
        } as any);
        vi.mocked(useGetPreviousPanelParams).mockReturnValue({previousRecordId: 'parent-7'} as any);
        render(<PanelCreationForm libraryId="home" formId="creation" />);

        // the form submits and reports the created record
        await userEvent.click(screen.getByText('submit-create'));

        // the created record is linked to its parent, then the popup closes
        await waitFor(() => {
            expect(mockSaveValues).toHaveBeenCalledWith({id: 'created-42', library: {id: 'home'}}, [
                {attribute: 'home_linked_records', idValue: null, value: 'parent-7'},
            ]);
            expect(mockNavigate).toHaveBeenCalledWith('../../..', {relative: 'path'});
        });
    });
});
