export const handleForward = ({ currentlySelected, object_list, handleOnChange }) => {
  var selected = currentlySelected;
  if (selected < object_list.length - 1) {
    selected += 1;
    handleOnChange(selected);
  } else {
    selected = 0;
    handleOnChange(selected);
  }
};

export const handleBackward = ({ currentlySelected, object_list, handleOnChange }) => {
  var selected = currentlySelected;
  if (selected > 0) {
    selected -= 1;
    handleOnChange(selected);
  } else {
    selected = object_list.length - 1;
    handleOnChange(selected);
  }
};

export const handleChange = ({
  selected,
  object_list,
  setCurrentlySelected,
  setProgress,
  setProgress_string,
  setObjectOn,
  newOption
}) => {
  var progress = (100 * selected) / (object_list.length - 1);
  var prog_string = 'On ' + (selected + 1).toString() + ' of a total of ' + object_list.length.toString();
  setCurrentlySelected(selected);
  setProgress(progress);
  setProgress_string(prog_string);

  setObjectOn(object_list[selected].id);
  newOption(object_list[selected].id);
};
