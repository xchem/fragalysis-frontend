export const createRepresentationStructure = (type, params, lastKnownID = undefined) => ({
  type,
  params,
  lastKnownID
});

export const defaultFocus = 0;

export const createRepresentationsArray = representations =>
  representations && representations.map(r => createRepresentationStructure(r.type, r.params, r.lastKnownID));

export const assignRepresentationToComp = (type, params, component, lastKnownID = undefined) => {
  const createdRepresentation = component.addRepresentation(type, params || {});
  return {
    lastKnownID: lastKnownID || createdRepresentation.uuid,
    uuid: createdRepresentation.uuid,
    type,
    params: createdRepresentation.getParameters(),
    templateParams: createdRepresentation.repr.parameters
  };
};

export const assignRepresentationArrayToComp = (representations, component) =>
  representations.map(rep => assignRepresentationToComp(rep.type, rep.params, component, rep.lastKnownID));
