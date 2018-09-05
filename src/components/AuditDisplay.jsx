

import React from 'react';
import {Link} from 'react-router-dom';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';



export default class AuditDisplay extends React.Component {

    constructor(props) {

        super(props);

    }
    
    renderShowsTotal(start, to, total) {
        return (
          <p style={ { color: 'blue' } }>
            From { start } to { to }, totals is { total }
          </p>
        );
      }
     
     
      colBlockFormatter (cell, row, enumObject, index) {
        let link = `${cell}`
        return (
          <Link to={'/block/' + link}>
            {cell}
          </Link>
        )
      }
      colAccountFormatter (cell, row, enumObject, index) {
        let link = `${cell}`
        return (
          <Link to={'/account/' + link}>
            {cell}
          </Link>
        )
      }
     
    render() {
        const options = {
            page: 2,  // which page you want to show as default
            sizePerPageList: [ {
              text: '5', value: 5
            }, {
              text: '10', value: 10
            }, {
              text: 'All', value: this.props.blocks.length
            } ], // you can change the dropdown list for size per page
            sizePerPage: 5,  // which size per page you want to locate as default
            pageStartIndex: 0, // where to start counting the pages
            paginationSize: 3,  // the pagination bar size.
            prePage: 'Prev', // Previous page button text
            nextPage: 'Next', // Next page button text
            firstPage: 'First', // First page button text
            lastPage: 'Last', // Last page button text
            prePageTitle: 'Go to previous', // Previous page button title
            nextPageTitle: 'Go to next', // Next page button title
            firstPageTitle: 'Go to first', // First page button title
            lastPageTitle: 'Go to Last', // Last page button title
            paginationShowsTotal: this.renderShowsTotal,  // Accept bool or function
            paginationPosition: 'top'  // default is bottom, top and both is all available
          };

        return (

            <div className="multi-block-display">
                    <div className="col-md-8 col-md-offset-2" style={this.props.blocks ? {} : { display: 'none' }}>
                    <h4 className="content-heading">Block Data ({this.props.startblock} to {this.props.endblock})</h4>
                        <BootstrapTable data={ this.props.blocks } pagination={ true } options={ options }>
                            <TableHeaderColumn dataField='number' dataFormat={this.colBlockFormatter} isKey={ true }>Block #</TableHeaderColumn>
                            <TableHeaderColumn dataField='difficulty'>Difficulty</TableHeaderColumn>
                            <TableHeaderColumn dataField='gasLimit'>Gas Limit</TableHeaderColumn>
                            <TableHeaderColumn dataField='gasUsed'>Gas Used</TableHeaderColumn>
                            <TableHeaderColumn dataField='uncles' dataFormat={this.colAccountFormatter}  >Uncles</TableHeaderColumn>
                            <TableHeaderColumn dataField='transactioncount'>Transactions</TableHeaderColumn>
                        </BootstrapTable>
                    </div>
                
                <div className="col-md-8 col-md-offset-2" style={this.props.receivers ? {} : { display: 'none' }}>
                <h4 className="content-heading">Receiver Transactions</h4>
                    <BootstrapTable data={ this.props.receivers } pagination={ true } options={ options }>
                        <TableHeaderColumn dataField='to' dataFormat={this.colAccountFormatter} isKey={ true }>Receiver Address</TableHeaderColumn>
                        <TableHeaderColumn dataField='value'>Ether</TableHeaderColumn>
                        <TableHeaderColumn dataField='iscontract'>Contract</TableHeaderColumn>
                    </BootstrapTable>
                </div>
                
                <div className="col-md-8 col-md-offset-2" style={this.props.senders ? {} : { display: 'none' }}>
                <h4 className="content-heading">Sender Transactions</h4>
                    <BootstrapTable data={ this.props.senders} pagination={ true } options={ options }>
                        <TableHeaderColumn dataField='from' dataFormat={this.colAccountFormatter}  isKey={ true }>Sender Address</TableHeaderColumn>
                        <TableHeaderColumn dataField='value'>Ether</TableHeaderColumn>
                        <TableHeaderColumn dataField='iscontract'>Contract</TableHeaderColumn>
                    </BootstrapTable>
                </div>

                <div className="col-md-8 col-md-offset-2">
                    <h3>Total Transacted Ether: {this.props.totalether} </h3> 
                </div>


            </div>

        )
    }

}