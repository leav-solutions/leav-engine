export const MASS_SELECTION_ALL = 'all';

export const LINK_RECORDS_MODAL_CLASSNAME = 'link-modal';

export const CREATE_RECORD_MODAL_CLASSNAME = 'create-record-modal';

export const EDIT_RECORD_MODAL_CLASSNAME = 'edit-record-modal';

export const WHO_AM_I_COLUMN = 'whoAmI';

export const SNACKBAR_MASS_ID = 'SNACKBAR_MASS_ID';

/**
 * Pixels the pointer must travel before a kanban card drag activates. Keeps plain clicks (opening
 * the record) working: below this distance the PointerSensor never starts a drag.
 */
export const CARD_DRAG_ACTIVATION_DISTANCE = 4;

/** Cards loaded per kanban column, per page ("Voir plus" loads the next page). */
export const KANBAN_COLUMN_PAGE_SIZE = 10;

/**
 * How long a drag & drop write keeps swallowing its own `recordUpdate` echoes before the board treats
 * further updates to that record as external again. A single write can emit zero, one, or several echoes
 * (value delete+create, re-indexation…), so the window is matched to that whole burst rather than to a
 * single event. Long enough to cover a write's echo burst, short enough that a genuine external update
 * to the same record right after is not swallowed for long.
 */
export const KANBAN_SELF_WRITE_ECHO_WINDOW_MS = 5000;
