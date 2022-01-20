import { createContext } from 'react';

/**
 * Used as a performance optimization, avoids passing the state of the group LPC buttons to datasetMoleculeView
 */
const GroupDatasetNglControlButtonsContext = createContext({});

export default GroupDatasetNglControlButtonsContext;
