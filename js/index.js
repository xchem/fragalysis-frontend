import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import PickerRoot from './containers/pickerRoot'
import '../css/index.css';

render(
  <PickerRoot />,
  document.getElementById('app')
) 