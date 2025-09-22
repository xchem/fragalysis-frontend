import React, { useCallback, useMemo, useState } from "react";
import { COLUMN_TYPES, ORDER } from "../table";
import { TextFilter } from "../table/filters/textFilter";
import { NumericFilter } from "../table/filters/numericFilter";
import { PeerReviewFilter } from "../table/filters/peerReviewFilter";
import { ObservationFilter } from "../table/filters/observationFilter";
import { MoleculeFilter } from "../table/filters/moleculeFilter";
import { useSelector } from "react-redux";
import { QUALITY_STATUSES } from "../../moleculeView/qualityStatus/constants";
import { getAllDisplayedLHSCompounds } from "../../redux/selectors";

export const useFilters = (initialItems, columns) => {
    const [filters, setFilters] = useState({});
    const [sortings, setSortings] = useState({});
    const allStatuses = useSelector(state => state.apiReducers.quality_statuses);
    const displayedLHSMoleculeList = useSelector(state => getAllDisplayedLHSCompounds(state));
    const showDisplayedMolecules = useSelector(state => state.selectionReducers.showDisplayedMolecules);

    const getActivityDataNumericValue = useCallback((item, name) => {
        const activityDataSet = item?.activityData?.filter(activity => activity.property_name === name).map(activity => activity.raw_value) || [];
        return activityDataSet.length > 0 ?
            activityDataSet.length > 1 ?
                (activityDataSet.reduce((acc, curr) => acc + curr, 0) / activityDataSet.length)
                : activityDataSet[0]
            : null;
    }, []);

    const getQualityStatuses = useCallback((data) => {
        // filter out default statuses created on load
        return allStatuses.filter(status => status.site_observation === data.main_site_observation && status.comment !== 'Created on load');
    }, [allStatuses]);

    const getMainQualityStatusObject = useCallback((data) => {
        return getQualityStatuses(data)?.find(status => status.main_status === true);
    }, [getQualityStatuses]);

    const getPeerReviews = useCallback((data) => {
        const userMap = {};
        getQualityStatuses(data).forEach(status => {
            if (!(status.user in userMap) && status.main_status === false) {
                userMap[status.user] = status;
            }
        });
        return Object.values(userMap);
    }, [getQualityStatuses]);

    const filterByText = (item, name, filterSettings) => {
        // do not filter by default if no value is set
        if (filterSettings.value === '') return true;

        const activityDataValue = item.activityData?.find(activityData => activityData.property_name === name)?.text_value || '';
        // get values from filter and remove empty ones
        const valuesToFilter = filterSettings.value.split('\n').filter(value => value);

        const filterAsExact = (dataValue, filterValue) => {
            return dataValue.toLowerCase() === filterValue.toLowerCase();
        };
        const filterAsContains = (dataValue, filterValue) => {
            return dataValue.toLowerCase().includes(filterValue.toLowerCase());
        };
        const filterAsStarts = (dataValue, filterValue) => {
            return dataValue.toLowerCase().startsWith(filterValue.toLowerCase());
        };
        const filterAsEnds = (dataValue, filterValue) => {
            return dataValue.toLowerCase().endsWith(filterValue.toLowerCase());
        };
        // all, any, none
        if (filterSettings.condition === 'all') {
            return valuesToFilter.every(value => {
                if (filterSettings.type === 'exact') {
                    return filterAsExact(activityDataValue, value);
                } else if (filterSettings.type === 'contains') {
                    return filterAsContains(activityDataValue, value);
                } else if (filterSettings.type === 'starts') {
                    return filterAsStarts(activityDataValue, value);
                } else if (filterSettings.type === 'ends') {
                    return filterAsEnds(activityDataValue, value);
                }
                return true;
            });
        } else if (filterSettings.condition === 'any') {
            return valuesToFilter.some(value => {
                if (filterSettings.type === 'exact') {
                    return filterAsExact(activityDataValue, value);
                } else if (filterSettings.type === 'contains') {
                    return filterAsContains(activityDataValue, value);
                } else if (filterSettings.type === 'starts') {
                    return filterAsStarts(activityDataValue, value);
                } else if (filterSettings.type === 'ends') {
                    return filterAsEnds(activityDataValue, value);
                }
                return true;
            });
        } else if (filterSettings.condition === 'none') {
            return !valuesToFilter.some(value => {
                if (filterSettings.type === 'exact') {
                    return filterAsExact(activityDataValue, value);
                } else if (filterSettings.type === 'contains') {
                    return filterAsContains(activityDataValue, value);
                } else if (filterSettings.type === 'starts') {
                    return filterAsStarts(activityDataValue, value);
                } else if (filterSettings.type === 'ends') {
                    return filterAsEnds(activityDataValue, value);
                }
                return true;
            });
        }
    };

    const filterByNumber = (item, name, filterSettings) => {
        const activityDataValue = getActivityDataNumericValue(item, name);
        switch (filterSettings.type) {
            case 'value':
                // do not filter by default if no value is set
                if (filterSettings.value === '') return true;
                if (filterSettings.condition === 0) { // ==
                    return Number(activityDataValue) === Number(filterSettings.value);
                } else if (filterSettings.condition === 1) { // <=
                    return Number(activityDataValue) <= Number(filterSettings.value);
                } else if (filterSettings.condition === 2) { // >=
                    return Number(activityDataValue) >= Number(filterSettings.value);
                }
                return true;
            case 'null':
                return activityDataValue === null;
            case 'not_null':
                return activityDataValue !== null;
            default:
                return true;
        }
    };

    const filterByPeerReview = (item, name, filterSettings) => {
        const mainStatusFilter = filterSettings.mainStatus;
        const isMainStatusFilterActive = Object.values(mainStatusFilter).some(statusState => statusState === true);
        if (isMainStatusFilterActive) {
            const mainQualityStatus = getMainQualityStatusObject(item);
            const mainStatus = mainQualityStatus ? mainQualityStatus.status : null;
            if (mainStatusFilter.good && mainStatus === QUALITY_STATUSES.GOOD) return true;
            if (mainStatusFilter.mediocre && mainStatus === QUALITY_STATUSES.MEDIOCRE) return true;
            if (mainStatusFilter.bad && mainStatus === QUALITY_STATUSES.BAD) return true;
            if (mainStatusFilter.none && (mainStatus === QUALITY_STATUSES.NONE || mainStatus === null)) return true;
        }

        const peerReviewFilter = filterSettings.peerReview;
        const isPeerReviewFilterActive = Object.values(peerReviewFilter).some(statusState => statusState.checked === true);
        if (isPeerReviewFilterActive) {
            const peerReviews = getPeerReviews(item);
            const goodPeerReviews = peerReviews.filter(review => review.status === QUALITY_STATUSES.GOOD);
            const mediocrePeerReviews = peerReviews.filter(review => review.status === QUALITY_STATUSES.MEDIOCRE);
            const badPeerReviews = peerReviews.filter(review => review.status === QUALITY_STATUSES.BAD);
            const nonePeerReviews = peerReviews.filter(review => review.status === QUALITY_STATUSES.NONE);

            // filter peer reviews without values
            if (peerReviewFilter.good.checked && peerReviewFilter.good.value === '' && goodPeerReviews.length > 0) return true;
            if (peerReviewFilter.mediocre.checked && peerReviewFilter.mediocre.value === '' && mediocrePeerReviews.length > 0) return true;
            if (peerReviewFilter.bad.checked && peerReviewFilter.bad.value === '' && badPeerReviews.length > 0) return true;
            if (peerReviewFilter.none.checked && peerReviewFilter.none.value === '' && nonePeerReviews.length > 0) return true;

            const comparePeerReviewValue = (peerReviewsLength, value, option) => {
                value = Number(value);
                if (option === 0) { // ==
                    return peerReviewsLength === value;
                } else if (option === 1) { // <=
                    return peerReviewsLength <= value;
                } else if (option === 2) { // >=
                    return peerReviewsLength >= value;
                }
                return false;
            };

            // filter peer reviews with values
            if (peerReviewFilter.good.checked && peerReviewFilter.good.value !== '' && comparePeerReviewValue(goodPeerReviews.length, peerReviewFilter.good.value, peerReviewFilter.good.option)) return true;
            if (peerReviewFilter.mediocre.checked && peerReviewFilter.mediocre.value !== '' && comparePeerReviewValue(mediocrePeerReviews.length, peerReviewFilter.mediocre.value, peerReviewFilter.mediocre.option)) return true;
            if (peerReviewFilter.bad.checked && peerReviewFilter.bad.value !== '' && comparePeerReviewValue(badPeerReviews.length, peerReviewFilter.bad.value, peerReviewFilter.bad.option)) return true;
            if (peerReviewFilter.none.checked && peerReviewFilter.none.value !== '' && comparePeerReviewValue(nonePeerReviews.length, peerReviewFilter.none.value, peerReviewFilter.none.option)) return true;
        }

        return isMainStatusFilterActive || isPeerReviewFilterActive ? false : true;
    };

    const filterByObservation = (item, name, filterSettings) => {
        // get values from filter and remove empty ones
        const valuesToFilter = filterSettings.value.split('\n').filter(value => value);

        const filterAsExact = (dataValue, filterValue) => {
            return dataValue.toLowerCase() === filterValue.toLowerCase();
        };
        const filterAsContains = (dataValue, filterValue) => {
            return dataValue.toLowerCase().includes(filterValue.toLowerCase());
        };

        const filterSet = dataValue => {
            return valuesToFilter.some(value => {
                if (filterSettings.exactMatch) {
                    return filterAsExact(dataValue, value);
                } else {
                    return filterAsContains(dataValue, value);
                }
            })
        };

        if (filterSettings.observationCode) {
            const observationCode = item.display_name || '';
            if (filterSet(observationCode)) return true;
        }

        if (filterSettings.compoundCode) {
            const compoundCode = item.main_site_observation_cmpd_code || '';
            if (filterSet(compoundCode)) return true;
        }

        if (filterSettings.compoundAliases) {
            const mainObservation = item.associatedObs.find(o => o.id === item.main_site_observation);
            const compoundAliases = [item.main_site_observation_cmpd_code].concat(mainObservation?.identifiers?.map(o => o.name) || []);
            if (compoundAliases.some(compoundAlias => filterSet(compoundAlias))) return true;
        }

        return filterSettings.observationCode || filterSettings.compoundCode || filterSettings.compoundAliases ? false : true;
    };

    const filterByMolecule = (item, name, filterSettings) => {
        if (filterSettings.filteredCompounds === null) {
            return true;
        }
        return filterSettings.filteredCompounds.length === 0 ? false
            : filterSettings.filteredCompounds.includes(filterSettings.structureType === 'compound' ? item.compound : item.main_site_observation);
    };

    // filter logic for each column type
    const filterFunctions = {
        [COLUMN_TYPES.TEXT]: (item, name, value) =>
            filterByText(item, name, value),
        [COLUMN_TYPES.NUMBER]: (item, name, value) =>
            filterByNumber(item, name, value),
        [COLUMN_TYPES.PEER_REVIEW]: (item, name, value) =>
            filterByPeerReview(item, name, value),
        [COLUMN_TYPES.OBSERVATION]: (item, name, value) =>
            filterByObservation(item, name, value),
        [COLUMN_TYPES.MOLECULE]: (item, name, value) =>
            filterByMolecule(item, name, value)
    };

    const sortByText = (a, b, name, sortValue) => {
        const activityDataValueA = a.activityData?.find(activityData => activityData.property_name === name)?.text_value || '';
        const activityDataValueB = b.activityData?.find(activityData => activityData.property_name === name)?.text_value || '';
        return sortValue.order === ORDER.ASC ? activityDataValueA.localeCompare(activityDataValueB, undefined, { numeric: true, sensitivity: 'base' })
            : activityDataValueB.localeCompare(activityDataValueA, undefined, { numeric: true, sensitivity: 'base' });
    };

    const sortByNumber = (a, b, name, sortValue) => {
        const activityDataValueA = getActivityDataNumericValue(a, name);
        const activityDataValueB = getActivityDataNumericValue(b, name);
        return sortValue.order === ORDER.ASC ? activityDataValueA - activityDataValueB
            : activityDataValueB - activityDataValueA;
    };

    const sortByPeerReview = (a, b, name, sortValue) => {
        const type = sortValue.enabled;
        if (type === 'mainStatus') {
            const statusMap = {
                [QUALITY_STATUSES.GOOD]: 0,
                [QUALITY_STATUSES.MEDIOCRE]: 1,
                [QUALITY_STATUSES.BAD]: 2,
                [QUALITY_STATUSES.NONE]: 3
            }
            const mainStatusA = getMainQualityStatusObject(a)?.status || QUALITY_STATUSES.NONE;
            const mainStatusB = getMainQualityStatusObject(b)?.status || QUALITY_STATUSES.NONE;
            return sortValue.order === ORDER.ASC ? statusMap[mainStatusA] - statusMap[mainStatusB]
                : statusMap[mainStatusB] - statusMap[mainStatusA];
        } else if (type === 'peerReview') {
            const getPeerReviewsWeight = (item) => {
                const peerReviews = getPeerReviews(item);
                return peerReviews.reduce((acc, curr) => {
                    if (curr.status === QUALITY_STATUSES.GOOD) return acc - 100;
                    if (curr.status === QUALITY_STATUSES.MEDIOCRE) return acc - 10;
                    if (curr.status === QUALITY_STATUSES.BAD) return acc - 1;
                    return acc; // for NONE or null
                }, 0);
            };
            const weightA = getPeerReviewsWeight(a);
            const weightB = getPeerReviewsWeight(b);
            return sortValue.order === ORDER.ASC ? weightA - weightB
                : weightB - weightA;
        }
        return 0;
    };

    const sortByObservation = (a, b, name, sortValue) => {
        const type = sortValue.enabled;
        // 0: None, 1: Observation / pose shortcode, 2: Compound aliases, 3: Compound ID
        const valueA = a[type === 1 ? 'main_site_observation_cmpd_code' : type === 2 ? 'display_name' : 'id'];
        const valueB = b[type === 1 ? 'main_site_observation_cmpd_code' : type === 2 ? 'display_name' : 'id'];
        return sortValue.order === ORDER.ASC ? valueA.localeCompare(valueB, undefined, { numeric: true, sensitivity: 'base' })
            : valueB.localeCompare(valueA, undefined, { numeric: true, sensitivity: 'base' });
    };

    // sort logic for each column type
    const sortFunctions = {
        [COLUMN_TYPES.TEXT]: (a, b, name, value) =>
            sortByText(a, b, name, value),
        [COLUMN_TYPES.NUMBER]: (a, b, name, value) =>
            sortByNumber(a, b, name, value),
        [COLUMN_TYPES.PEER_REVIEW]: (a, b, name, value) =>
            sortByPeerReview(a, b, name, value),
        [COLUMN_TYPES.OBSERVATION]: (a, b, name, value) =>
            sortByObservation(a, b, name, value),
        [COLUMN_TYPES.MOLECULE]: (a, b, name, value) =>
            true
    };

    const handleColumnFilter = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleColumnSorting = (name, value) => {
        setSortings(prev => ({ ...prev, [name]: value }));
    };

    // apply all filters and sortings to items
    const filteredItems = useMemo(() => {
        // filter first
        let items = initialItems.filter(item =>
            columns.every(col => {
                // always show displayed hits
                if (showDisplayedMolecules && displayedLHSMoleculeList.includes(item.main_site_observation)) return true;
                const value = filters[col.name];
                if (value === undefined) return true;
                const fn = filterFunctions[col.type];
                return fn ? fn(item, col.name, value) : true;
            })
        );
        // sort items based on sortings
        items = items.sort((a, b) =>
            columns.map(col => {
                const sortSettings = sortings[col.name];
                if (sortSettings === undefined || !!sortSettings.enabled === false) return 0;
                const fn = sortFunctions[col.type];
                return fn ? fn(a, b, col.name, sortSettings) : 0;
            }).reduce((acc, curr) => acc + curr, 0)
        );
        return items;
    }, [initialItems, columns, filterFunctions, sortFunctions, filters, sortings, showDisplayedMolecules, displayedLHSMoleculeList]);

    const getColumnFilter = (type, name) => {
        switch (type) {
            case COLUMN_TYPES.TEXT:
                return <TextFilter name={name} onFilterChange={v => handleColumnFilter(name, v)} onSortingChange={v => handleColumnSorting(name, v)} />;
            case COLUMN_TYPES.NUMBER:
            case 'int':
            case 'float':
                return <NumericFilter name={name} onFilterChange={v => handleColumnFilter(name, v)} onSortingChange={v => handleColumnSorting(name, v)} />;
            case COLUMN_TYPES.PEER_REVIEW:
                return <PeerReviewFilter onFilterChange={v => handleColumnFilter(name, v)} onSortingChange={v => handleColumnSorting(name, v)} />;
            case COLUMN_TYPES.OBSERVATION:
                return <ObservationFilter onFilterChange={v => handleColumnFilter(name, v)} onSortingChange={v => handleColumnSorting(name, v)} />;
            case COLUMN_TYPES.MOLECULE:
                return <MoleculeFilter onFilterChange={v => handleColumnFilter(name, v)} onSortingChange={v => handleColumnSorting(name, v)} />;
            default:
                return null;
            // return <DefaultFilter />;
        }
    };

    return { filteredItems, getColumnFilter };
};
