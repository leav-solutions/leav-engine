// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type LibraryId, type Panel} from '_ui/hooks/useIFrameMessenger/types';
import {type Application} from '../types';

/**
 * Add a record panel to an application. Panel will be replaced or created if it does not exist.
 *
 * @param panel - description of a panel
 * @param prevApplication - current application configuration
 * @param destination - destination of the panel
 */
export const addRecordPanelToApplication = (
    panel: Panel,
    prevApplication: Application,
    destination: {libraryId: LibraryId},
): Application => {
    /**
     * Cannot use destructuring due to a deep object.
     * Cannot change the initial object due to `useState` reactivity (got this error https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_define_property_object_not_extensible).
     */
    const newApplication = JSON.parse(JSON.stringify(prevApplication)) as Application;

    const library = newApplication.libraries[destination.libraryId];

    if (!library) {
        newApplication.libraries[destination.libraryId] = {
            recordPanels: [panel],
            libraryPanels: [],
        };
        return newApplication;
    }

    if (library.recordPanels.find(({id}) => id === panel.id)) {
        library.recordPanels = library.recordPanels.map(p => (p.id === panel.id ? panel : p));
        return newApplication;
    }

    library.recordPanels.push(panel);

    return newApplication;
};
