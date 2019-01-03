import React, {Component} from "react";
import {Table, Select, Form, Input, Button, Icon, Divider, Card} from "antd";

import PropTypes from "prop-types";
import _ from "lodash";

import "antd/dist/antd.css";
import "../css/css.css";
import {Layout} from "antd";

import AuthService from "../AuthService";
import HeaderApp from "../components/header";
import Top from "../components/top";

import {api, formItemLayout} from "./constants";
import {Link} from "react-router";

import {DatePicker} from "antd";

import {Spin} from "antd";
import locale from "antd/lib/date-picker/locale/vi_VN";
import moment from "moment";
import Highlighter from "react-highlight-words";

const Auth = new AuthService(null);
const Option = Select.Option;
const FormItem = Form.Item;

const {Content} = Layout;

const {RangePicker} = DatePicker;

class Report extends Component {
  constructor(props) {
    super(props);
    this.handleLanguage = this.handleLanguage.bind(this);
    this.getWord = this.getWord.bind(this);
    this.getLanguage = this.getLanguage.bind(this);
    this.types = this.types.bind(this);
    this.locationlist = this.locationlist.bind(this);
    this.suppliers = this.suppliers.bind(this);

    this.state = {
      loading: true,
      isLoading: true,
      language: "vietnamese",
      selectedReport: 1,
      data: [],
      columns: [],
      summary: []
    };
  }
  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({searchText: selectedKeys[0]});
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({searchText: ""});
  };
  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
      <div className="custom-filter-dropdown">
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{width: 188, marginBottom: 8, display: "block"}}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{width: 90, marginRight: 8}}
        >
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{width: 90}}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{color: filtered ? "#1890ff" : undefined}} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text => (
      <Highlighter
        highlightStyle={{backgroundColor: "#ffc069", padding: 0}}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text.toString()}
      />
    )
  });
  getStockColumns = () => {
    return [
      {
        title: this.getWord("fabric-code"),
        dataIndex: "unique_code",
        key: "unique_code",
        render: id => <Link to={`/f/${id}`}>{id}</Link>,
        sorter: (a, b) => {
          return a.unique_code.localeCompare(b.unique_code);
        }
      },
      {
        title: this.getWord("location"),
        dataIndex: "location",
        key: "location",
        sorter: (a, b) => {
          return a.location.localeCompare(b.location);
        }
      },
      {
        title: this.getWord("quantity") + " [m]",
        dataIndex: "quantity",
        key: "quantity",
        render: (quantity, record) => (
          <span style={{color: record.operation === "add" ? "green" : "red"}}>
            {quantity}
          </span>
        ),
        sorter: (a, b) => {
          return a.quantity - b.quantity;
        }
      },
      {
        title: this.getWord("action"),
        dataIndex: "action",
        key: "action",
        sorter: (a, b) => {
          return a.action.localeCompare(b.action);
        }
      },
      {
        title: this.getWord("user"),
        dataIndex: "user",
        key: "user",
        sorter: (a, b) => {
          return a.user.localeCompare(b.user);
        }
      },
      {
        title: this.getWord("date"),
        dataIndex: "date",
        key: "date",
        render: date => (
          <div>{new Date(date).toLocaleString("ES").slice(0, 10)}</div>
        ),
        sorter: (a, b) => {
          return a.date.localeCompare(b.date);
        }
      }
    ];
  };
  getOrderColumns = () => {
    return [
      {
        title: this.getWord("order"),
        dataIndex: "order_id",
        key: "order_id",
        render: id => <Link to={`/o/${id}`}>{id}</Link>,
        sorter: (a, b) => {
          return a.order_id - b.order_id;
        }
      },
      {
        title: this.getWord("date"),
        dataIndex: "order_date",
        key: "order_date",
        render: date => (
          <div>{new Date(date).toLocaleString("ES").slice(0, 10)}</div>
        ),
        sorter: (a, b) => {
          return a.order_date.localeCompare(b.order_date);
        }
      },
      {
        title: this.getWord("customer-name"),
        dataIndex: "customer_name",
        key: "customer_name",
        sorter: (a, b) => {
          return a.customer_name.localeCompare(b.customer_name);
        },
        ...this.getColumnSearchProps("customer_name")
      },
      {
        title: this.getWord("hotel"),
        dataIndex: "hotel_name",
        key: "hotel_name",
        sorter: (a, b) => {
          return a.hotel_name.localeCompare(b.hotel_nam);
        }
      },
      {
        title: this.getWord("room"),
        dataIndex: "hotel_room",
        key: "hotel_room",
        sorter: (a, b) => {
          return a.hotel_room.localeCompare(b.hotel_room);
        }
      },
      {
        title: this.getWord("origin"),
        dataIndex: "order_origin",
        key: "order_origin",
        sorter: (a, b) => {
          return a.order_origin.localeCompare(b.order_origin);
        }
      },
      {
        title: this.getWord("price-usd") + " [USD]",
        dataIndex: "total",
        key: "total",
        sorter: (a, b) => {
          return a.total - b.total;
        }
      },
      {
        title: this.getWord("staff"),
        dataIndex: "staff_name",
        key: "staff_name",
        sorter: (a, b) => {
          return a.staff_name.localeCompare(b.staff_name);
        }
      },
      {
        title: this.getWord("total-items"),
        dataIndex: "num_items",
        key: "num_items",
        sorter: (a, b) => {
          return a.num_items - b.num_items;
        }
      }
    ];
  };

  getFabricColumns = () => {
    return [
      {
        title: this.getWord("fabric-code"),
        dataIndex: "unique_code",
        key: "unique_code",
        render: id => <Link to={`/f/${id}`}>{id}</Link>,
        sorter: (a, b) => {
          return a.unique_code.localeCompare(b.unique_code);
        }
      },
      {
        title: this.getWord("swatchbook"),
        dataIndex: "swatchbook",
        key: "swatchbook",
        render: id => <Link to={`/s/${id}`}>{id}</Link>,
        sorter: (a, b) => {
          return a.swatchbook.localeCompare(b.swatchbook);
        }
      },
      {
        title: this.getWord("date"),
        dataIndex: "date",
        key: "date",
        render: date => (
          <div>{new Date(date).toLocaleString("ES").slice(0, 10)}</div>
        ),
        sorter: (a, b) => {
          return a.date.localeCompare(b.date);
        }
      },
      {
        title: this.getWord("user"),
        dataIndex: "user",
        key: "user",
        sorter: (a, b) => {
          return a.user.localeCompare(b.user);
        }
      }
    ];
  };

  locationlist = () => {
    return this.state.locations;
  };
  getSuppliers = () => {
    fetch(api + "suppliers")
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then(suppliers => {
        this.setState({
          suppliers: _.sortBy(suppliers, [
            function(o) {
              return o.name;
            }
          ])
        });
      })
      .catch(error => {});
  };
  suppliers = () => {
    return this.state.suppliers;
  };
  getSwatchbookList = () => {
    fetch(api + "swatchbooks")
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then(swatchbooklist => {
        this.setState({
          swatchbooklist: _.sortBy(swatchbooklist, [
            function(o) {
              return o.unique_code;
            }
          ])
        });
      })
      .catch(error => {});
  };
  types = () => {
    return this.state.types;
  };
  swatchbooklist = () => {
    return this.state.swatchbooklist;
  };
  colors = () => {
    return this.state.colors;
  };
  suppliers = () => {
    return this.state.suppliers;
  };
  getLanguage = () => {
    return this.state.language;
  };
  getTypes = () => {
    fetch(api + "types")
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then(types => {
        this.setState({
          types: _.sortBy(types, [
            function(o) {
              return o.description;
            }
          ])
        });
        this.setState({loading: false});
      })
      .catch(error => {});
  };
  getLocations = () => {
    this.setState({loading: true});
    fetch(api + "locations")
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then(locations => {
        //onsole.log(locations);
        this.setState({
          locations: _.sortBy(locations, [
            function(o) {
              return o.description;
            }
          ])
        });
        this.setState({loading: false});
      })
      .catch(error => {});
  };
  getColors = () => {
    fetch(api + "colors")
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then(colors => {
        this.setState({
          colors: _.sortBy(colors, [
            function(o) {
              return o.description;
            }
          ])
        });

        this.setState({loading: false});
      })
      .catch(error => {});
  };
  componentWillMount = () => {
    if (!Auth.loggedIn()) {
      this.context.router.replace("/");
    } else {
      try {
        const profile = Auth.getProfile();
        this.setState({
          user: profile
        });

        this.getDictionary();
        this.getTypes();
        this.getSwatchbookList();
        this.getLocations();
        this.getSuppliers();
        this.getColors();

        this.setState({language: localStorage.getItem("language")});

        let today = new Date().toISOString().slice(0, 10);
        this.setState({from: today, to: today});
        this.getOrderReport(today, today);
      } catch (err) {
        Auth.logout();
        this.context.router.replace("/");
      }
    }
  };
  getDictionary = () => {
    this.getStockColumns();
    this.getOrderColumns();
    fetch(api + "/dictionaries")
      .then(res => res.json())
      .then(dictionary => {
        this.setState({dictionary});
        this.setState({isLoading: false});
      });
  };
  getWord = key => {
    return this.state && this.state.dictionary
      ? this.state.language === "vietnamese"
        ? this.state.dictionary.find(i => i.key === key)
          ? this.state.dictionary.find(i => i.key === key).vietnamese
          : ""
        : this.state.dictionary.find(i => i.key === key)
          ? this.state.dictionary.find(i => i.key === key).english
          : ""
      : "";
  };

  getOrderReport = (from, to) => {
    fetch(
      api +
        "report_orders?filter[where][order_date][gt]=" +
        from +
        "&[where][order_date][lt]=" +
        to
    )
      .then(res => {
        return res.json();
      })
      .then(orders => {
        orders = _.sortBy(orders, [
          function(o) {
            return o.date;
          }
        ]);
        this.setState({
          data: orders.reverse(),
          columns: this.getOrderColumns(),
          loading: false
        });
      });
  };
  getFabricReport = (from, to) => {
    fetch(
      api +
        "report_fabrics?filter[where][date][gt]=" +
        from +
        "&[where][date][lt]=" +
        to
    )
      .then(res => {
        return res.json();
      })
      .then(fabrics => {
        fabrics = _.sortBy(fabrics, [
          function(o) {
            return o.date;
          }
        ]);
        this.setState({
          data: fabrics.reverse(),
          columns: this.getFabricColumns(),
          loading: false
        });
      });
  };

  getStockReport = (from, to) => {
    fetch(
      api +
        "report_stocks?filter[where][date][gt]=" +
        from +
        "&[where][date][lt]=" +
        to
    )
      .then(res => {
        return res.json();
      })
      .then(stocks => {
        stocks = _.sortBy(stocks, [
          function(o) {
            return o.date;
          }
        ]);
        this.setState({
          data: stocks.reverse(),
          columns: this.getStockColumns(),
          loading: false
        });
      });
  };

  getPaymentReport = (from, to) => {
    fetch(
      api +
        "report_payments?filter[where][date][gt]=" +
        from +
        "&[where][date][lt]=" +
        to
    )
      .then(res => {
        return res.json();
      })
      .then(payments => {
        payments = _.sortBy(payments, o => {
          return o.date;
        });

        var summary = _(payments)
          .groupBy(x => x.currency)
          .map((value, key) => ({
            total: this.getTotal(value),
            currency: key
          }))
          .value();

        console.log(summary);

        this.setState({
          summary,
          data: payments.reverse(),
          columns: [
            {
              title: this.getWord("order"),
              dataIndex: "order_id",
              key: "order_id",
              sorter: (a, b) => {
                return a.order_id - b.order_id;
              },
              render: id => <Link to={`/o/${id}`}>{id}</Link>
            },
            {
              title: this.getWord("date"),
              dataIndex: "date",
              key: "date",
              sorter: (a, b) => {
                return a.date.localeCompare(b.date);
              },
              render: date => (
                <div>
                  {new moment(new Date(date))
                    .utcOffset("+00:00")
                    .format("DD/MM, HH:mm")}
                </div>
              )
            },
            {
              title: this.getWord("type"),
              dataIndex: "type",
              key: "type",
              sorter: (a, b) => {
                return a.type.localeCompare(b.type);
              }
            },
            {
              title: this.getWord("method"),
              dataIndex: "is_cc",
              key: "is_cc",
              sorter: (a, b) => {
                return a.is_cc - b.is_cc;
              },
              render: is_cc => (
                <div>
                  {is_cc === 1 ? (
                    <Icon type="credit-card" title="Credit Card" />
                  ) : (
                    <Icon type="dollar" title="Cash" style={{color: "green"}} />
                  )}
                </div>
              )
            },
            {
              title: this.getWord("amount"),
              dataIndex: "alt_amount",
              key: "alt_amount",
              render: (alt_amount, record) => (
                <span>
                  <b>{alt_amount + " " + record.currency}</b>
                </span>
              )
            },
            {
              title: this.getWord("usd"),
              dataIndex: "usd",
              key: "usd",
              sorter: (a, b) => {
                return a.usd - b.usd;
              }
            },
            {
              title: this.getWord("fee"),
              dataIndex: "fee",
              key: "fee",
              sorter: (a, b) => {
                return a.fee - b.fee;
              },
              render: fee => <span>{fee > 0 ? fee : "-"}</span>
            },
            {
              title: this.getWord("balance"),
              dataIndex: "balance",
              key: "balance",
              sorter: (a, b) => {
                return a.balance - b.balance;
              }
            },
            {
              title: this.getWord("total-price") + "[USD]",
              dataIndex: "total",
              key: "total",
              render: (total, record) =>
                record.balance === 0 ? (
                  <span>
                    {total}
                    <Icon
                      type="check"
                      style={{color: "green", marginLeft: 10}}
                    />
                  </span>
                ) : (
                  <span>{total}</span>
                ),
              sorter: (a, b) => {
                return a.total - b.total;
              }
            },
            {
              title: this.getWord("staff"),
              dataIndex: "staff",
              key: "staff",
              filters: _.sortBy(
                _.map(_.uniqBy(payments, "staff"), i => {
                  return {
                    text: i.staff,
                    value: i.staff
                  };
                })
              ),
              onFilter: (staff, record) => {
                return record.staff.indexOf(staff) === 0;
              },
              sorter: (a, b) => {
                return a.staff.localeCompare(b.staff);
              }
            }
          ],
          loading: false
        });
      });
  };

  getTotal = value => {
    let total = 0;
    value.forEach(
      v =>
        v.is_cc === 0
          ? v.currency.toUpperCase() === "USD"
            ? (total = total + v.amount)
            : (total = total + v.alt_amount)
          : (total = total)
    );
    return total;
  };

  handleChangeReport = (selectedReport, from, to) => {
    switch (selectedReport) {
      case 1:
        this.getOrderReport(from, to);
        break;
      case 2:
        this.getStockReport(from, to);
        break;
      case 3:
        this.getFabricReport(from, to);
        break;
      case 4:
        this.getPaymentReport(from, to);
        break;
      default:
    }
    this.setState({selectedReport});
  };

  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.shape({
        push: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired
      }),
      staticContext: PropTypes.object
    }).isRequired
  };

  onDateChange = date => {
    if (date.length) {
      let from = new Date(date[0]).toISOString().slice(0, 10);
      let to = new Date(date[1]).toISOString().slice(0, 10);
      this.setState({
        from,
        to
      });
      switch (this.state.selectedReport) {
        case 1:
          date.length && this.getOrderReport(from, to);
          break;
        case 2:
          date.length && this.getStockReport(from, to);
          break;
        case 3:
          date.length && this.getFabricReport(from, to);
          break;
        case 4:
          date.length && this.getPaymentReport(from, to);
          break;
        default:
      }
    }
  };
  handleLanguage = () => {
    this.state.language === "vietnamese"
      ? this.setState({language: "english"})
      : this.setState({language: "vietnamese"});

    this.state.language === "vietnamese"
      ? localStorage.setItem("language", "english")
      : localStorage.setItem("language", "vietnamese");
  };

  render() {
    const {
      loading,
      isLoading,
      selectedReport,
      data,
      columns,
      summary
    } = this.state;
    const dateFormat = "YYYY/MM/DD";

    return !isLoading ? (
      <Layout className="wrapper">
        {Auth.loggedIn() && (
          <Top
            username={this.state.user.username}
            handleLanguage={this.handleLanguage}
            getWord={this.getWord}
            getLanguage={this.getLanguage}
          />
        )}
        <HeaderApp
          index="2"
          getWord={this.getWord}
          types={this.types}
          suppliers={this.suppliers}
          colors={this.colors}
          swatchbooklist={this.swatchbooklist}
          locationlist={this.locationlist}
        />

        <Content className="container">
          <div>
            <FormItem
              label={this.getWord("select-a-report")}
              {...formItemLayout}
            >
              <Select
                defaultValue={selectedReport}
                style={{width: 200}}
                onChange={value =>
                  this.handleChangeReport(value, this.state.from, this.state.to)
                }
              >
                <Option value={1}>{this.getWord("orders")}</Option>
                <Option value={2}>{this.getWord("stock-movements")}</Option>
                <Option value={3}>{this.getWord("fabric-creation")}</Option>
                <Option value={4}>{this.getWord("order-payments")}</Option>
              </Select>
            </FormItem>

            <FormItem
              label={this.getWord("select-a-date-range")}
              {...formItemLayout}
            >
              <RangePicker
                locale={this.state.language === "vietnamese" && locale}
                format="DD/MM/YYYY"
                onChange={date => this.onDateChange(date)}
                ranges={{
                  Today: [moment(), moment()],
                  Month: [moment().startOf("month"), moment().endOf("month")]
                }}
                defaultValue={[
                  moment(this.state.from, dateFormat),
                  moment(this.state.to, dateFormat)
                ]}
              />
            </FormItem>
          </div>

          {!loading ? (
            data.length > 0 ? (
              <Table
                style={{paddingTop: 30}}
                dataSource={data}
                columns={columns}
                rowKey="id"
                size="small"
              />
            ) : (
              <div style={{display: "flex", justifyContent: "center"}}>
                <Divider style={{marginTop: 0}} />
              </div>
            )
          ) : (
            <div style={{display: "flex", justifyContent: "center"}}>
              <Spin size="large" />
            </div>
          )}
          {selectedReport === 4 && summary.length ? (
            <div style={{display: "flex", justifyContent: "center"}}>
              <Card
                title="Cash Summary"
                style={{width: "100%", marginBottom: 20}}
              >
                {summary.map(s => (
                  <p key={s.currency}>
                    <b>{s.currency + ": " + s.total}</b>
                  </p>
                ))}
              </Card>
            </div>
          ) : (
            ""
          )}
        </Content>
      </Layout>
    ) : (
      <Content className="containerHome">
        <Spin size="large" />
      </Content>
    );
  }
}

export default Report;
