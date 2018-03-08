import 'babel-polyfill'
 import React from 'react'
import { render } from 'react-dom'
import Root from './containers/Root'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

 
render(
  <Root />,
  document.getElementById('app')
) 