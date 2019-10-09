/**
 * Created by abradley on 08/03/2018.
 */
import BootstrapTable from 'react-bootstrap-table-next';
import React from 'react';

const products = [];
const columns = [
  {
    dataField: 'id',
    text: 'Product ID'
  },
  {
    dataField: 'name',
    text: 'Product Name'
  },
  {
    dataField: 'price',
    text: 'Product Price'
  }
];

export default () => <BootstrapTable keyField="id" data={products} columns={columns} />;
