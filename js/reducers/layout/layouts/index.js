import createDefaultLayout from './default';
import createNglLeftLayout from './nglLeft';
import createLHSBottomLayout from './lhsBottom';
import createResizableLayout from './resizable';

export const layouts = {
  Default: createDefaultLayout,
  'NGL left': createNglLeftLayout,
  'LHS bottom': createLHSBottomLayout,
  Resizable: createResizableLayout
};
