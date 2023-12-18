export const getMoleculeList = state => state.apiReducers.molecule_list;
export const getAllMoleculeList = state => state.apiReducers.all_mol_lists;
export const getCombinedTargetList = state => {
  let result = [];

  const target_id_list = state.apiReducers.target_id_list;
  const legacy_target_id_list = [...state.apiReducers.legacy_target_id_list];
  let max_id = Math.max(...target_id_list.map(target => target.id));
  legacy_target_id_list.forEach(target => {
    target.id = ++max_id;
  });

  result = [...target_id_list, ...legacy_target_id_list];

  return result;
};
