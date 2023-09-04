import { useDrag, useDrop } from 'react-dnd';
import { useDispatch } from 'react-redux';
import { dragDropMoleculeFinished, dragDropMoleculeStarted } from './redux/dispatchActions';

const DND_TYPE = 'DATASET_MOLECULE_VIEW';

// Taken and adjusted from https://react-dnd.github.io/react-dnd/examples/sortable/simple
export const useDragDropMoleculeView = (ref, datasetID, molecule, index, moveMolecule) => {
  const dispatch = useDispatch();

  const [{ handlerId }, drop] = useDrop({
    accept: DND_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId()
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      dispatch(dragDropMoleculeStarted(datasetID, dragIndex));

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveMolecule(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
    drop(item, monitor) {
      dispatch(dragDropMoleculeFinished(datasetID, molecule, index));
    }
  });

  const [{ isDragging }, drag] = useDrag({
    type: DND_TYPE,
    item: () => {
      return { id: molecule.id, index };
    },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });
  drag(drop(ref));

  return { handlerId, isDragging };
};
