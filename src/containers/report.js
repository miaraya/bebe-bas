import React, {Component} from "react";
import {Table, Select, Form} from "antd";

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
      columns: []
    };
  }
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
          return a.quantity > b.quantity;
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
        key: "user"
      },
      {
        title: this.getWord("date"),
        dataIndex: "date",
        key: "date",
        render: date => (
          <div>{new Date(date).toLocaleString("ES").slice(0, 10)}</div>
        )
      }
    ];
  };
  getOrderColumns = () => {
    return [
      {
        title: this.getWord("order"),
        dataIndex: "order_id",
        key: "order_id",
        render: id => <Link to={`/o/${id}`}>{id}</Link>
      },
      {
        title: this.getWord("date"),
        dataIndex: "order_date",
        key: "order_date",
        render: date => (
          <div>{new Date(date).toLocaleString("ES").slice(0, 10)}</div>
        )
      },
      {
        title: this.getWord("customer-name"),
        dataIndex: "customer_name",
        key: "customer_name"
      },
      {
        title: this.getWord("hotel"),
        dataIndex: "hotel_name",
        key: "hotel_name"
      },
      {
        title: this.getWord("room"),
        dataIndex: "hotel_room",
        key: "hotel_room"
      },
      {
        title: this.getWord("origin"),
        dataIndex: "order_origin",
        key: "order_origin"
      },
      {
        title: this.getWord("price-usd") + " [USD]",
        dataIndex: "total",
        key: "total"
      },
      {
        title: this.getWord("total-items"),
        dataIndex: "num_items",
        key: "num_items"
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

        let colorFilter = [];
        colors.map(c =>
          colorFilter.push({text: c.description, value: c.description})
        );

        this.setState({colorFilter});

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
    console.log(date);
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
    const {loading, isLoading, selectedReport, data, columns} = this.state;
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
                defaultValue={[
                  moment(this.state.from, dateFormat),
                  moment(this.state.to, dateFormat)
                ]}
              />
            </FormItem>
          </div>
          {!loading ? (
            <Table
              dataSource={data}
              columns={columns}
              rowKey="id"
              size="small"
            />
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
