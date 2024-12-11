export const getMoleculeList = state => state.apiReducers.molecule_list;
export const getAllMoleculeList = state => state.apiReducers.all_mol_lists;
export const getCombinedTargetList = state => {
  let result = [];

  const target_id_list = state.apiReducers.target_id_list;
  const legacy_target_id_list = [...state.apiReducers.legacy_target_id_list];
  if (target_id_list?.length > 0) {
    let max_id = Math.max(...target_id_list.map(target => target.id));
    legacy_target_id_list.forEach(target => {
      target.id = ++max_id;
    });
  }

  result = [...target_id_list, ...legacy_target_id_list];

  return result;
};
export const getCurrentTarget = state => {
  const target_on = state.apiReducers.target_on;
  const targets = state.apiReducers.target_id_list;

  return targets?.find(target => target.id === target_on);
};
