import React from "react";
import AuditDisplay from "../components/AuditDisplay.jsx";

export default class Audit extends React.Component {
  constructor(props) {
    super(props);
    this._web3util = require("web3-utils");
    this._link = this.props.mixClient;

    this.state = {
      loading: false,
      startblock: null,
      display: false,
      currentblock: 0,
      resultblocks: [],
      resulttransactions: [],
      totalether: 0,
      addressessent: [],
      addressesreceived: [],
      contractaddresses: [],
      errors: "",
      searchQuery: "",
      processedSx: 0,
      processingBlock: 0
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.doSearch = this.doSearch.bind(this);

    this._totalReceivedEther = 0;
    this._totalSentEther = 0;
    //this._resultblocks = [];
    this._currentblocknumber = 0;
    this._transactions = [];
    this._contract_txns = [];
    this._totalEther = 0;
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    if (!isNaN(value)) {
      this.setState({
        [name]: value,
        startBlock: Number(value)
      });
    } else {
      this.setState({
        [name]: value,
        startBlock: this.state.curblock - 1000
      });
    }
  }
  getSum(total, num) {
    return total + num;
  }
  doSearch(ev) {
    ev.preventDefault();
    if (this.state.searchQuery <= this.state.currentblock) {
      this.setState({
        loading: true,
        display: false
      });
      this.props.history.push("/audit/" + this.state.searchQuery);
    } else {
      this.setState({
        alertMessage: "Max block count is : " + this.state.currentblock
      });
    }
  }

  getTransactions(startBlockNumber, endBlockNumber) {
    console.log(
      "Searching for non-zero transaction counts between blocks " +
        startBlockNumber +
        " and " +
        endBlockNumber
    );
    let _trans = [];
    let _blkcnt = endBlockNumber - startBlockNumber;
    this.setState({
      loading: true
    });
    for (var i = startBlockNumber; i < endBlockNumber; i++) {
      this._link.web3.eth.getBlock(i, true, (error, block) => {
        if (error) {
          console.error("Error:", error);
        } else {
          if (block != null) {
            //console.log("Block #" + block.number + " has " + block.transactions.length + " transactions")
            if (block.transactions != null && block.transactions.length != 0) {
              //this._resultblocks.push(block);
              _trans = _trans.concat(block.transactions);
            }

            this.setState({
              resultblocks: this.state.resultblocks.concat(block),
              resulttransactions: _trans,
              processingBlock: i
            });

            _blkcnt = _blkcnt - 1;

            if (_blkcnt == 0) {
              let _resultblocks = this.state.resultblocks;
              _resultblocks.map(blk => {
                return (blk.transactioncount = blk.transactions.length);
              });

              this.setState({
                resultblocks: _resultblocks,
                loading: true,
                display: false
              });

              this.processTransactions(_trans);
            }
          }
        }
      });
    }
  }

  processTransactions(transactions) {
    this._transactions = transactions;
    this.transcnt = 0;
    let receivedAddrs = _(transactions)
      .groupBy("to")
      .map((objs, key) => ({
        to: key,
        iscontract: false,
        value: _.sumBy(objs, function(o) {
          return o.value.toNumber() / 1000000000000000000;
        })
      }))
      .value();

    this.setState({
      addressesreceived: receivedAddrs
    });

    let sentAddrs = _(transactions)
      .groupBy("from")
      .map((objs, key) => ({
        from: key,
        iscontract: false,
        value: _.sumBy(objs, function(o) {
          return o.value.toNumber() / 1000000000000000000;
        })
      }))
      .value();

    this.setState({
      addressessent: sentAddrs
    });

    receivedAddrs.forEach(function(_receivedAddresss) {
      let _isContract = false;
      if (this._web3util.isAddress(_receivedAddresss.to) == true) {
        this._link.web3.eth.getCode(_receivedAddresss.to, (error, _code) => {
          if (error) {
            console.error("Error:", error);
          } else {
            if (_code != null && _code.length > 2) {
              //console.log("Code: " + _code );
              _receivedAddresss.iscontract = true;
              let rObj = _.find(receivedAddrs, function(o) {
                return o.to == _receivedAddresss.to;
              });
              rObj.iscontract = true;
            }
            this.transcnt++;
            if (this.transcnt >= sentAddrs.length + receivedAddrs.length - 2) {
              this.setState({ display: true, loading: false });
            }
          }
        });
      }
    }, this);

    sentAddrs.forEach(function(_sentAddresss) {
      let _isContract = false;

      if (this._web3util.isAddress(_sentAddresss.from) == true) {
        this._link.web3.eth.getCode(_sentAddresss.from, (error, _code) => {
          if (error) {
            console.error("Error:", error);
          } else {
            if (_code != null && _code.length > 2) {
              //console.log("Code: " + _code );
              _sentAddresss.iscontract = true;
              let sObj = _.find(sentAddrs, function(o) {
                return o.to == _sentAddresss.to;
              });
              sObj.iscontract = true;
            }

            this.setState({
              processedSx: this.state.processedSx + 1
            });
            this.transcnt++;
            if (this.transcnt >= sentAddrs.length + receivedAddrs.length - 2) {
              this.setState({ display: true, loading: false });
            }
          }
        });
      }
    }, this);

    this._totalSentEther = _.sumBy(sentAddrs, function(o) {
      return o.value;
    });

    this._totalReceivedEther = _.sumBy(sentAddrs, function(o) {
      return o.value;
    });

    this.setState({
      addressesreceived: receivedAddrs,
      addressessent: sentAddrs,
      startblock: this.props.match.params.startblock,
      currentblock: this._currentblocknumber,
      resulttransactions: this._transactions,
      totalether: this._totalReceivedEther + this._totalSentEther,
      display:
        this.transcnt >= sentAddrs.length + receivedAddrs.length ? true : false
    });
  }

  componentDidMount() {
    this._link.web3.eth.getBlockNumber(
      function(error, curblock) {
        if (this.props.match.params.startblock) {
          if (!error) {
            this._currentblocknumber = curblock;
            this.setState({
              startblock: this.props.match.params.startblock,
              currentblock: this._currentblocknumber,
              loading: false,
              display: false,
              searchQuery: this.props.match.params.startblock
            });

            this.getTransactions(this.props.match.params.startblock, curblock);
          } else console.error(error);
        } else {
          if (!error) {
            this._currentblocknumber = curblock;
            this.setState({
              currentblock: this._currentblocknumber
            });
          } else console.error(error);
        }
      }.bind(this)
    );
  }

  render() {
    if (this.state.loading && !this.state.diplay) {
      return (
        <div>
          <div className="block-display">
            <div className="transaction-search">
              <h3 className="content-heading">EtherLens Block(s) Summary</h3>

              <div className="transaction-search-container col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                <form onSubmit={this.doSearch}>
                  <div className="form-group">
                    <input
                      onChange={this.handleInputChange}
                      value={this.state.searchQuery}
                      name="searchQuery"
                      type="text"
                      className="form-control"
                      placeholder="Starting Block #"
                    />
                  </div>

                  <div className="form-group">
                    <button
                      type="submit"
                      className="btn btn-primary pull-right"
                    >
                      Submit
                    </button>
                  </div>
                </form>
                <div className="clearfix margin-bottom" />

                <p
                  className={
                    this.state.alertMessage
                      ? "alert alert-danger"
                      : "no-display"
                  }
                >
                  Sorry but there was an error with this request:{" "}
                  {this.state.alertMessage}
                </p>

                <div style={{ height: 70 + "px" }} />
                <div className="alert alert-info">Please wait...</div>

                <div>
                  <p style={{ color: "blue" }}>
                    Processed {this.state.processingBlock} Block of{" "}
                    {this.state.currentblock}
                  </p>
                </div>
                <div>
                  <p style={{ color: "blue" }}>
                    Processed {this.state.processedSx} Transactions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (!this.state.display && !this.state.loading) {
      return (
        <div className="block-display">
          <div className="transaction-search">
            <h3 className="content-heading">EtherLens Block(s) Summary</h3>

            <div className="transaction-search-container col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
              <form onSubmit={this.doSearch}>
                <div className="form-group">
                  <input
                    onChange={this.handleInputChange}
                    value={this.state.searchQuery}
                    name="searchQuery"
                    type="text"
                    className="form-control"
                    placeholder="Starting Block #"
                  />
                </div>

                <div className="form-group">
                  <button type="submit" className="btn btn-primary pull-right">
                    Submit
                  </button>
                </div>
              </form>
              <div className="clearfix margin-bottom" />

              <p
                className={
                  this.state.alertMessage ? "alert alert-danger" : "no-display"
                }
              >
                Sorry but there was an error with this request:{" "}
                {this.state.alertMessage}
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="block-display">
          <div className="transaction-search">
            <h3 className="content-heading">EtherLens Block(s) Summary</h3>

            <div className="transaction-search-container col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
              <form onSubmit={this.doSearch}>
                <div className="form-group">
                  <input
                    onChange={this.handleInputChange}
                    value={this.state.searchQuery}
                    name="searchQuery"
                    type="text"
                    className="form-control"
                    placeholder="Starting Block #"
                  />
                </div>

                <div className="form-group">
                  <button type="submit" className="btn btn-primary pull-right">
                    Submit
                  </button>
                </div>
              </form>

              <div className="clearfix margin-bottom" />

              <p
                className={
                  this.state.alertMessage ? "alert alert-danger" : "no-display"
                }
              >
                Sorry but there was an error with this request:{" "}
                {this.state.alertMessage}
              </p>
            </div>
          </div>
          <AuditDisplay
            startblock={this.state.startblock}
            endblock={this.state.currentblock}
            blocks={this.state.resultblocks}
            receivers={this.state.addressesreceived}
            senders={this.state.addressessent}
            totalether={this.state.totalether}
          />
        </div>
      );
    }
  }
}
