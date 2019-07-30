import React, {Component} from "react";
import {Table, Select, Form, Input, Button, Icon, Divider,Row} from "antd";

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
import Logo from "../assets/logo_small.png";


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

    this.state = {
      loading: true,
      isLoading: true,
      language: "vietnamese",
      selectedReport: 1,
      stores: [],
      data: [],
      columns: [],
      summary: [],
      filter: ""
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

  locationlist = () => {
    return this.state.locations;
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
        //console.log(locations);
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

  getStores = () => {
    fetch(api + "stores")
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then(val => {
        let stores = [...val, {description: "All", id: -1}];

        this.setState({
          stores: _.sortBy(stores, [
            function(o) {
              return o.description;
            }
          ]),
          selectedStore:
            this.state.user.role === "admin"
              ? stores.find(i => i.id === -1).id
              : stores.find(i => i.id === Number(localStorage.getItem("store")))
                  .id
        });
      })
      .catch(error => {});

    //  let role = this.state.prodf
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
        let store = localStorage.getItem("store");
        this.setState({language: localStorage.getItem("language")});
        this.setState({store});
        this.getDictionary();
        this.getTypes();
        this.getSwatchbookList();
        this.getLocations();
        this.getColors();
        this.getStores();

        let from = new moment(new Date())
          .subtract(1, "days")
          .format("YYYY-MM-DD");
        let to = new moment(new Date()).add(1, "days").format("YYYY-MM-DD");

        localStorage.getItem("role") === "admin"
          ? this.getOrderReport(from, to, "")
          : this.getOrderReport(from, to, "&filter[where][store_id]=" + store);

        this.setState({from, to});
      } catch (err) {
        Auth.logout();
        this.context.router.replace("/");
      }
    }
  };

  getDictionary = () => {
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

  getStatusesReport = (from, to, filter) => {
    this.setState({filter});
    let url =
      api +
      "report_statuses?filter[where][and][0][creation_date][gt]=" +
      from +
      "&filter[where][and][1][creation_date][lt]=" +
      to +
      filter;

    fetch(url)
      .then(response => {
        return response.json();
      })
      .then(statuses => {
        statuses = _.sortBy(statuses, [
          function(o) {
            return o.creation_date;
          }
        ]);
        this.setState({
          data: statuses.reverse(),
          columns: [
            {
              title: "Order ID",
              dataIndex: "order_id",
              key: "order_id",

              render: id => <Link to={`/i/${id}`}>{id}</Link>,
              sorter: (a, b) => {
                return a.order_id - b.order_id;
              }
            },
            {
              title: "Item ID",
              dataIndex: "item_id",
              key: "item_id",
              ...this.getColumnSearchProps("item-id"),

              render: item_id => <div>{item_id}</div>,
              sorter: (a, b) => {
                return a.item_id - b.item_id;
              }
            },
            {
              title: "Entity",
              dataIndex: "entity",
              key: "entity",
              sorter: (a, b) => {
                return a.entity && b.entity
                  ? a.entity.localeCompare(b.entity)
                  : null;
              }
            },
            {
              title: "From",
              dataIndex: "from",
              key: "from",
              sorter: (a, b) => {
                return a.from && b.from ? a.from.localeCompare(b.from) : null;
              }
            },
            {
              title: "To",
              dataIndex: "to",
              key: "to",
              sorter: (a, b) => {
                return a.to && b.to ? a.to.localeCompare(b.to) : null;
              }
            },
            {
              title: "Creation Date",
              dataIndex: "creation_date",
              key: "creation_date",
              render: date => (
                <div>
                  {new moment(new Date(date))
                    .utcOffset("+00:00")
                    .format("DD/MM/YY HH:mm")}
                </div>
              ),
              sorter: (a, b) => {
                return a.creation_date && b.creation_date
                  ? a.creation_date.localeCompare(b.creation_date)
                  : null;
              }
            },
            {
              title: "Staff",
              dataIndex: "staff",
              key: "staff",
              sorter: (a, b) => {
                return a.staff && b.staff
                  ? a.staff.localeCompare(b.staff)
                  : null;
              },
              ...this.getColumnSearchProps("staff")
            }
          ],
          loading: false
        });
      });
  };

  getOrderReport = (from, to, filter) => {
    this.setState({filter});
    let url =
      api +
      "report_orders?filter[where][and][0][order_date][gt]=" +
      from +
      "&filter[where][and][1][order_date][lt]=" +
      to +
      filter;

    fetch(url)
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
          columns: [
            {
              title: this.getWord("order"),
              dataIndex: "order_id",
              key: "order_id",
              ...this.getColumnSearchProps("order_id"),

              render: id => <Link to={`/o/${id}`}>{id}</Link>,
              sorter: (a, b) => {
                return a.order_id - b.order_id;
              }
            },
            {
              title: this.getWord("store"),
              dataIndex: "store",
              key: "store",
              ...this.getColumnSearchProps("store"),
              sorter: (a, b) => {
                return a.store && b.store
                  ? a.store.localeCompare(b.store)
                  : null;
              }
            },
            {
              title: this.getWord("date"),
              dataIndex: "order_date",
              key: "order_date",
              render: date => (
                <div>
                  {new moment(new Date(date))
                    .utcOffset("+00:00")
                    .format("DD/MM/YY HH:mm")}
                </div>
              ),
              sorter: (a, b) => {
                return a.order_date && b.order_date
                  ? a.order_date.localeCompare(b.order_date)
                  : null;
              }
            },
            {
              title: this.getWord("customer-name"),
              dataIndex: "customer_name",
              key: "customer_name",
              sorter: (a, b) => {
                return a.customer_name && b.customer_name
                  ? a.customer_name.localeCompare(b.customer_name)
                  : null;
              },
              ...this.getColumnSearchProps("customer_name")
            },
            {
              title: this.getWord("hotel"),
              dataIndex: "hotel_name",
              key: "hotel_name",
              ...this.getColumnSearchProps("hotel_name"),

              sorter: (a, b) => {
                return a.hotel_name && b.hotel_name
                  ? a.hotel_name.localeCompare(b.hotel_name)
                  : null;
              }
            },
            {
              title: this.getWord("room"),
              dataIndex: "hotel_room",
              key: "hotel_room",
              sorter: (a, b) => {
                return a.hotel_room && b.hotel_room
                  ? a.hotel_room.localeCompare(b.hotel_room)
                  : null;
              }
            },
            {
              title: this.getWord("origin"),
              dataIndex: "order_origin",
              key: "order_origin",
              filters: _.sortBy(
                _.map(_.uniqBy(orders, "order_origin"), i => {
                  return {
                    text: i.order_origin,
                    value: i.order_origin
                  };
                })
              ),
              onFilter: (order_origin, record) => {
                return record.order_origin.indexOf(order_origin) === 0;
              },
              sorter: (a, b) => {
                return a.order_origin && b.order_origin
                  ? a.order_origin.localeCompare(b.order_origin)
                  : null;
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
              title: this.getWord("discount") + " [USD]",
              dataIndex: "discount",
              key: "discount"
            },
            {
              title: this.getWord("to-pay") + " [USD]",
              dataIndex: "topay",
              key: "topay",
              sorter: (a, b) => {
                return a.topay - b.topay;
              },
              render: (topay, row) => <b>{row.total - row.discount}</b>
            },
            {
              title: this.getWord("staff"),
              dataIndex: "staff_name",
              key: "staff_name",
              filters: _.sortBy(
                _.map(_.uniqBy(orders, "staff_name"), i => {
                  return {
                    text: i.staff_name,
                    value: i.staff_name
                  };
                })
              ),
              onFilter: (staff_name, record) => {
                return record.staff_name.indexOf(staff_name) === 0;
              },
              sorter: (a, b) => {
                return a.staff_name && b.staff_name
                  ? a.staff_name.localeCompare(b.staff_name)
                  : null;
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
          ],
          loading: false
        });
      });
  };

  getFabricReport = (from, to) => {
    fetch(
      api +
        "report_fabrics?filter[where][and][0][date][gt]=" +
        from +
        "&filter[where][and][1][date][lt]=" +
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
          columns: [
            {
              title: this.getWord("fabric-code"),
              dataIndex: "unique_code",
              key: "unique_code",
              ...this.getColumnSearchProps("unique_code"),

              sorter: (a, b) => {
                return a.unique_code && b.unique_code
                  ? a.unique_code.localeCompare(b.unique_code)
                  : null;
              },
              render: id => <Link to={`/f/${id}`}>{id}</Link>
            },
            {
              title: this.getWord("swatchbook"),
              dataIndex: "swatchbook",
              key: "swatchbook",
              ...this.getColumnSearchProps("swatchbook"),

              sorter: (a, b) => {
                return a.swatchbook && b.swatchbook
                  ? a.swatchbook.localeCompare(b.swatchbook)
                  : null;
              },
              render: id => <Link to={`/s/${id}`}>{id}</Link>
            },
            {
              title: this.getWord("date"),
              dataIndex: "date",
              key: "date",
              render: date => (
                <div>
                  {new moment(new Date(date))
                    .utcOffset("+00:00")
                    .format("DD/MM/YY HH:mm")}
                </div>
              ),
              sorter: (a, b) => {
                return a.date && b.date ? a.date.localeCompare(b.date) : null;
              }
            },
            {
              title: this.getWord("user"),
              dataIndex: "user",
              key: "user",
              filters: _.sortBy(
                _.map(_.uniqBy(fabrics, "user"), i => {
                  return {
                    text: i.user,
                    value: i.user
                  };
                })
              ),
              onFilter: (user, record) => {
                return record.user.indexOf(user) === 0;
              },
              sorter: (a, b) => {
                return a.user && b.user ? a.user.localeCompare(b.user) : null;
              }
            }
          ],
          loading: false
        });
      });
  };

  getStockReport = (from, to) => {
    fetch(
      api +
        "report_stocks?filter[where][and][0][date][gt]=" +
        from +
        "&filter[where][and][1][date][lt]=" +
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
          columns: [
            {
              title: this.getWord("fabric-code"),
              dataIndex: "unique_code",
              key: "unique_code",
              ...this.getColumnSearchProps("unique_code"),

              sorter: (a, b) => {
                return a.unique_code && b.unique_code
                  ? a.unique_code.localeCompare(b.unique_code)
                  : null;
              },
              render: id => <Link to={`/f/${id}`}>{id}</Link>
            },
            {
              title: this.getWord("location"),
              dataIndex: "location",
              key: "location",
              filters: _.sortBy(
                _.map(_.uniqBy(stocks, "location"), i => {
                  return {
                    text: i.location,
                    value: i.location
                  };
                })
              ),
              onFilter: (location, record) => {
                return record.location.indexOf(location) === 0;
              },
              sorter: (a, b) => {
                return a.location && b.location
                  ? a.location.localeCompare(b.location)
                  : null;
              }
            },
            {
              title: this.getWord("quantity") + " [m]",
              dataIndex: "quantity",
              key: "quantity",
              render: (quantity, record) => (
                <span
                  style={{color: record.operation === "add" ? "green" : "red"}}
                >
                  {quantity}
                </span>
              ),
              sorter: (a, b) => {
                return a.quantity - b.quantity;
              }
            },
            {
              title: this.getWord("total-stock")+ " [m]",
              dataIndex: "total_stock",
              key: "total_stock",
              sorter: (a, b) => {
                return a.total_stock - b.total_stock;
              }
            },
            {
              title: this.getWord("action"),
              dataIndex: "action",
              key: "action",
              filters: _.sortBy(
                _.map(_.uniqBy(stocks, "action"), i => {
                  return {
                    text: i.action,
                    value: i.action
                  };
                })
              ),
              onFilter: (action, record) => {
                return record.action.indexOf(action) === 0;
              },
              sorter: (a, b) => {
                return a.action && b.action
                  ? a.action.localeCompare(b.action)
                  : null;
              }
            },
            {
              title: this.getWord("user"),
              dataIndex: "user",
              key: "user",
              filters: _.sortBy(
                _.map(_.uniqBy(stocks, "user"), i => {
                  return {
                    text: i.user,
                    value: i.user
                  };
                })
              ),
              onFilter: (user, record) => {
                return record.user.indexOf(user) === 0;
              },
              sorter: (a, b) => {
                return a.user && b.user ? a.user.localeCompare(b.user) : null;
              }
            },
            {
              title: this.getWord("date"),
              dataIndex: "date",
              key: "date",
              render: date => (
                <div>
                  {new moment(new Date(date))
                    .utcOffset("+00:00")
                    .format("DD/MM/YY HH:mm")}
                </div>
              ),
              sorter: (a, b) => {
                return a.date && b.date ? a.date.localeCompare(b.date) : null;
              }
            }
          ],
          loading: false
        });
      });
  };

  getPaymentReport = (from, to) => {
    fetch(
      api +
        "report_payments?filter[where][and][0][date][gt]=" +
        from +
        "&filter[where][and][1][date][lt]=" +
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

        this.setState({
          summary,
          data: payments.reverse(),
          columns: [
            {
              title: this.getWord("order"),
              dataIndex: "order_id",
              key: "order_id",
              ...this.getColumnSearchProps("order_id"),

              sorter: (a, b) => {
                return a.order_id - b.order_id;
              },
              render: id => <Link to={`/o/${id}`}>{id}</Link>
            },
            {
              title: this.getWord("customer-name"),
              dataIndex: "customer_name",
              key: "customer_name",
              sorter: (a, b) => {
                return a.customer_name && b.customer_name
                  ? a.customer_name.localeCompare(b.customer_name)
                  : null;
              },
              ...this.getColumnSearchProps("customer_name")
            },
            {
              title: this.getWord("date"),
              dataIndex: "date",
              key: "date",
              sorter: (a, b) => {
                return a.date && b.date ? a.date.localeCompare(b.date) : null;
              },
              render: date => (
                <div>
                  {new moment(new Date(date))
                    .utcOffset("+00:00")
                    .format("DD/MM/YY HH:mm")}
                </div>
              )
            },
            {
              title: this.getWord("type"),
              dataIndex: "type",
              key: "type",
              sorter: (a, b) => {
                return a.type && b.type ? a.type.localeCompare(b.type) : null;
              }
            },
            {
              title: this.getWord("method"),
              dataIndex: "is_cc",
              key: "is_cc",
              sorter: (a, b) => {
                return a.is_cc - b.is_cc;
              },
              filters: _.sortBy(
                _.map(_.uniqBy(payments, "is_cc"), i => {
                  return {
                    text: i.is_cc === 0 ? "Cash" : "Credit Card",
                    value: i.is_cc
                  };
                })
              ),
              onFilter: (is_cc, record) => {
                return Number(record.is_cc) === Number(is_cc);
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
              className: 'right',
              filters: _.sortBy(
                _.map(_.uniqBy(summary, "currency"), i => {
                  return {
                    text: i.currency,
                    value: i.currency
                  };
                })
              ),
              onFilter: (currency, record) => {
                return record.currency.indexOf(currency) === 0;
              },
              render: (alt_amount, record) => (
                  <b>{this.formatDecimals(alt_amount) + " " + record.currency}</b>
              )
            },
            {
              title: this.getWord("usd"),
              dataIndex: "usd",
              key: "usd",
              className: 'right',

              sorter: (a, b) => {
                return a.usd - b.usd;
              },
              render: usd => <span>{this.formatDecimals(usd)}</span>

            },
            {
              title: this.getWord("fee")+"[USD]",
              dataIndex: "fee",
              key: "fee",
              className: 'right',

              sorter: (a, b) => {
                return a.fee - b.fee;
              },
              render: fee => <span>{fee > 0 ? this.formatDecimals(fee) : "-"}</span>
            },
            {
              title: this.getWord("balance"),
              dataIndex: "balance",
              key: "balance",
              className: 'right',

              sorter: (a, b) => {
                return a.balance - b.balance;
              },
              render: balance =><span>{this.formatDecimals(balance)}</span>
            },
            {
              title: this.getWord("total-price") + "[USD]",
              dataIndex: "total",
              key: "total",
              className: 'right',

              render: (total, record) =>
                  <span>
                    {this.formatDecimals(total)}
                    <Icon
                      type={record.balance=== 0 ? "check" : "exclamation"}
                      style={record.balance === 0 ? {color: "green", marginLeft: 10}: {color: "orange", marginLeft: 10}}
                    />
                  </span>
                ,
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
                return a.staff && b.staff
                  ? a.staff.localeCompare(b.staff)
                  : null;
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
          : total
    );
    return total;
  };

  handleChangeReport = (selectedReport, from, to, selectedStore) => {
    let filter =
      selectedStore > 0 ? "&filter[where][store_id]=" + selectedStore : "";

    this.setState({columns: null});
    switch (selectedReport) {
      case 1:
        this.getOrderReport(from, to, filter);
        break;
      case 2:
        this.getStockReport(from, to, filter);
        break;
      case 3:
        this.getFabricReport(from, to, filter);
        break;
      case 4:
        this.getPaymentReport(from, to, filter);
        break;
      case 5:
        this.getStatusesReport(from, to, filter);
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
      let from = new moment(date[0]).subtract(1, "days").format("YYYY-MM-DD");
      let to = new moment(date[1]).add(1, "days").format("YYYY-MM-DD");

      this.setState({
        from,
        to
      });
      switch (this.state.selectedReport) {
        case 1:
          date.length && this.getOrderReport(from, to, this.state.filter);
          break;
        case 2:
          date.length && this.getStockReport(from, to, this.state.filter);
          break;
        case 3:
          date.length && this.getFabricReport(from, to, this.state.filter);
          break;
        case 4:
          date.length && this.getPaymentReport(from, to, this.state.filter);
          break;
        case 5:
          date.length && this.getStatusesReport(from, to, this.state.filter);
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

  handleChangeStore = selectedStore => {
    this.setState({selectedStore});
    this.handleChangeReport(
      this.state.selectedReport,
      this.state.from,
      this.state.to,
      selectedStore
    );
  };

  formatDecimals(figure)
  {
    return figure.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  render() {
    const {
      loading,
      isLoading,
      selectedReport,
      selectedStore,
      data,
      columns,
      summary,
      stores
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
        <Row
                        type="flex"
                        justify="center"
                        align="middle"
                        gutter={16}
                        span={24}
                        style={{
                            marginBottom: 20
                        }}>
                        <img src={Logo} alt="Bebe Tailor" width="150px"/>
                    </Row>

        <HeaderApp
          index="2"
          getWord={this.getWord}
          types={this.types}
          suppliers={this.suppliers}
          colors={this.colors}
          swatchbooklist={this.swatchbooklist}
          locationlist={this.locationlist}
        />

        <Content>
          <div>
            <FormItem
              label={this.getWord("select-a-store")}
              {...formItemLayout}
            >
              <Select
                onChange={value => this.handleChangeStore(value)}
                style={{width: 200}}
                value={selectedStore}
              >
                {stores.length &&
                  stores.map(s => (
                    <Option
                      key={s.id}
                      value={s.id}
                      disabled={
                        localStorage.getItem("role") === "admin"
                          ? false
                          : s.id !== Number(localStorage.getItem("store"))
                      }
                    >
                      {s.description}
                    </Option>
                  ))}
              </Select>
            </FormItem>

            <FormItem
              label={this.getWord("select-a-report")}
              {...formItemLayout}
            >
              <Select
                defaultValue={selectedReport}
                style={{width: 200}}
                onChange={value =>
                  this.handleChangeReport(
                    value,
                    this.state.from,
                    this.state.to,
                    this.state.selectedStore
                  )
                }
              >
                <Option value={1}>{this.getWord("orders")}</Option>
                <Option value={2}>{this.getWord("stock-movements")}</Option>
                <Option value={3}>{this.getWord("fabric-creation")}</Option>
                <Option value={4}>{this.getWord("order-payments")}</Option>
                <Option value={5}>Status Report</Option>
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
      pagination={{
        position: "top",
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "100"]
      }}
      title={() =>
        selectedReport === 4 &&
        summary.length && (
          <div
            title="Cash Summary"
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-start"
            }}
          >
            <h4 style={{marginRight: 40}}>Cash Summary:</h4>
            <div>
              {summary.map(
                s =>
                  s.total > 0 && (
                    <p key={s.currency} style={{marginRight: 30}}>
                      <b>{s.currency + ": " + this.formatDecimals(s.total)}</b>
                    </p>
                  )
              )}
            </div>
          </div>
        )
      }
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
