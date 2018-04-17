import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import Root from './containers/root'
import '../css/index.css';

render(
  <Root />,
  document.getElementById('app')
) 