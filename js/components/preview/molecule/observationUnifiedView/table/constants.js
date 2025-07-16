export const COLUMN_TYPES = {
    TEXT: 'text',
    NUMBER: 'number',
    MOLECULE: 'molecule',
    OBSERVATION: 'observation',
    PEER_REVIEW: 'peerReview',
    CANON_SITE: 'canonSite',
    CONFORMER_SITE: 'conformerSite',
    OBSERVATIONS: 'observations',
    CUSTOM: 'custom'
};

export const ORDER = {
    ASC: true,
    DESC: false
}

export const COLUMNS = [
    {
        name: 'peerReview',
        displayName: '',
        type: COLUMN_TYPES.PEER_REVIEW,
        minWidth: 22,
        width: 22,
        resizable: false
    },
    {
        name: 'detail',
        displayName: 'Observation',
        type: COLUMN_TYPES.OBSERVATION,
        minWidth: 172,
        width: 182,
        resizable: true
    },
    {
        name: 'molecule',
        displayName: 'Molecule',
        type: COLUMN_TYPES.MOLECULE,
        minWidth: 150,
        width: 150,
        resizable: false
    },
    {
        name: 'canonSite',
        displayName: '',
        type: COLUMN_TYPES.CANON_SITE,
        minWidth: 22,
        width: 22,
        resizable: false
    },
    {
        name: 'conformerSite',
        displayName: '',
        type: COLUMN_TYPES.CONFORMER_SITE,
        minWidth: 22,
        width: 22,
        resizable: false
    },
    {
        name: 'observations',
        displayName: '',
        type: COLUMN_TYPES.OBSERVATIONS,
        minWidth: 22,
        width: 22,
        resizable: false
    }
];
