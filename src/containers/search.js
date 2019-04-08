import React, {Component} from "react";
import PropTypes from "prop-types";

import "antd/dist/antd.css";
import "../css/css.css";
import {Layout, Modal} from "antd";

import {Radio, Button, message} from "antd";
import {Input} from "antd";
import {api, fabric_url, fabric_url_full, formItemLayout} from "./constants";
import {Table} from "antd";
import {Link} from "react-router";
import {Avatar} from "antd";
import {Spin} from "antd";
import {Select} from "antd";
import _ from "lodash";
import HeaderApp from "../components/header";
import Top from "../components/top";
import {Form, Icon, InputNumber, Dropdown, Menu} from "antd";
import AuthService from "../AuthService";

const Auth = new AuthService(null);
const FormItem = Form.Item;

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const Search = Input.Search;
const {Content} = Layout;

class _Search extends Component {
  constructor(props) {
    super(props);
    this.handleLanguage = this.handleLanguage.bind(this);
    this.getWord = this.getWord.bind(this);
    this.getLanguage = this.getLanguage.bind(this);
    this.types = this.types.bind(this);
    this.suppliers = this.suppliers.bind(this);
    this.colors = this.colors.bind(this);
    this.swatchbooklist = this.swatchbooklist.bind(this);
    this.locationlist = this.locationlist.bind(this);

    this.state = {
      isLoading: true,
      creatingLoading: false,
      add: 0,
      stockLocations: [],
      record: null,
      adjustStockVisible: false,
      addStockVisible: false,
      moveStockVisible: false,
      colors: [],
      locationData: [],
      locations: [],
      swatchbooks: [],
      types: [],
      image: "",
      visible: false,
      data: [],
      loading: true,
      error: false,
      selectedOption: undefined
    };
  }

  componentWillMount = () => {
    //console.log(Auth.loggedIn());
    if (!Auth.loggedIn()) {
      this.context.router.replace("/");
    } else {
      try {
        const profile = Auth.getProfile();
        //console.log(profile);
        this.setState({
          user: profile
        });
        this.setState({language: localStorage.getItem("language")});
        this.getDictionary();

        this.getTypes();
        this.getLocations();
        this.getColors();
        this.getSuppliers();
        this.getSwatchbookList();

        this.setState({
          selectedOption: {
            value: 1,
            url: "fabricdetails?filter[where][unique_code][like]="
          }
        });
      } catch (err) {
        //console.log(err);
        Auth.logout();
        this.context.router.replace("/");
      }
    }
  };

  locationlist = () => {
    return this.state.locations;
  };

  colors = () => {
    return this.state.colors;
  };
  swatchbooklist = () => {
    return this.state.swatchbooklist;
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
  getLanguage = () => {
    return this.state.language;
  };
  addStock = record => {
    this.clear();
    this.setState({record});
    this.setState({addStockVisible: true});
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
    return this.state.dictionary
      ? this.state.language === "vietnamese"
        ? this.state.dictionary.find(i => i.key === key)
          ? this.state.dictionary.find(i => i.key === key).vietnamese
          : ""
        : this.state.dictionary.find(i => i.key === key)
          ? this.state.dictionary.find(i => i.key === key).english
          : ""
      : "";
  };
  doSearch = (url, query) => {
    this.setState({loading: true});
    fetch(api + url + "%" + query + "%")
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({error: true});
          throw new Error("Something went wrong ...");
        }
      })
      .then(data => {
        var result = _(data)
          .groupBy(x => x.unique_code)
          .map((value, key) => ({
            stock: value,
            unique_code: key,
            old_code: value[0].old_code,
            swatchbook: value[0].swatchbook,
            fabric_image: value[0].fabric_image,
            color: value[0].color,
            fabric_id: value[0].fabric_id,
            hetvai: true
          }))
          .value();

        result = this.checkHetVai(result);

        this.setState({data: result});
        //console.log(result);

        //  this.setState({data});
        this.setState({loading: false});
      })
      .catch(error => {});
  };
  types = () => {
    return this.state.types;
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
  getSwatchbooks = id => {
    this.setState({loading: true});
    fetch(api + "web_swatchbooks?filter[where][description]=" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then(swatchbooks => {
        this.setState({swatchbooks});
        this.setState({loading: false});
      })
      .catch(error => {});
  };
  getLocationData = id => {
    this.setState({loading: true});
    fetch(api + "stock_locations?filter[where][location]=" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then(locationData => {
        this.setState({
          locationData
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
  handleChangeType = value => {
    this.getSwatchbooks(value);
  };
  handleChangeLocation = value => {
    this.getLocationData(value);
  };
  handleChangeColor = (value, record) => {
    //console.log(value);
    //console.log(record);
  };

  checkHetVai = data => {
    var total;

    data.forEach(r => {
      total = 0;
      r.stock.forEach(s => {
        total = total + Number(s.total_stock);
        //console.log(total);
      });
      total > 0 ? (r.hetvai = false) : (r.hetvai = true);
      total > 0 ? (r.total_stock = total) : (r.total_stock = 0);
    });
    return data;
  };

  getStockData = unique_code => {
    //console.log(unique_code);
    fetch(
      api + "fabric_location_stocks?filter[where][unique_code]=" + unique_code
    )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({error: true});
          throw new Error("Something went wrong ...");
        }
      })
      .then(stockLocations => {
        this.setState({stockLocations});
      })
      .catch(error => {});
  };

  clear = () => {
    this.setState({
      newLocation: undefined,
      newStock: undefined,
      newExtra: undefined,
      oldLocation: undefined,
      add: 0,
      creatingLoading: false
    });
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

  setStock = (fabric_id, location_id, quantity, extra, add, action) => {
    //add or Remove
    if (add === 1) {
      quantity = quantity * -1;
      extra = extra * -1;
    }
    fetch(api + "stocks", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fabric_id,
        location_id,
        quantity: quantity ? quantity : 0,
        extra: 0,
        user_id: Number(this.state.user.user_id),
        action
      })
    })
      .then(response => response.json())
      .then(responseData => {
        console.log(
          "POST Response",
          "Response Body -> " + JSON.stringify(responseData)
        );
        fetch(
          api +
            "fabricdetails?filter[where][unique_code][like]=" +
            this.state.record.unique_code
        )
          .then(res => {
            if (res.ok) {
              return res.json();
            } else {
              this.setState({error: true});
              throw new Error("Something went wrong ...");
            }
          })
          .then(data => {
            //console.log(data);

            let aux = this.state.record;
            aux.stock = _.sortBy(data, [
              function(o) {
                return o.location;
              }
            ]);

            let total = 0;
            aux.stock.forEach(s => {
              total = total + Number(s.total_stock);
              //console.log(total);
            });
            total > 0 ? (aux.hetvai = false) : (aux.hetvai = true);

            this.setState({record: aux});

            this.setState({addStockVisible: false});
            this.setState({adjustStockVisible: false});
            this.setState({moveStockVisible: false});

            add === 0
              ? message.success(quantity + " meters added")
              : message.success(quantity * -1 + " meters removed");

            this.clear();
          });
      });

    //this.setState({record: [0]});
  };

  saveAdjustStock = (stock, oldStock) => {
    stock.forEach((s, i) => {
      this.setStock(
        s.fabric_id,
        s.location_id,
        Number(s.total_stock) + Number(oldStock[i].total_stock) * -1,
        Number(s.extra_fabric) + Number(oldStock[i].extra_fabric) * -1,
        1,
        Number(oldStock[i].total_stock) === 0 ? "het vai" : "adjust"
      );
    });
    //console.log(this.state.record);
    //console.log(stock);
    //console.log(oldStock);
  };

  adjustStock = record => {
    this.setState({record});
    let stock = this.state.data.find(i => i.unique_code === record.unique_code)
      .stock;
    this.setState({
      stockLocations: stock.filter(
        i => Number(i.total_stock) + Number(i.extra_fabric) > 0
      )
    });
    this.setState({
      oldStockLocations: JSON.parse(
        JSON.stringify(
          stock.filter(i => Number(i.total_stock) + Number(i.extra_fabric) > 0)
        )
      )
    });
    this.setState({adjustStockVisible: true});
  };

  moveStock = record => {
    this.clear();
    //console.log(record);
    this.setState({moveStockVisible: true});
  };
  saveMoveStock = (fabric_id, from, to, quantity, extra) => {
    this.setStock(fabric_id, from, quantity, extra, 1, "move");
    this.setStock(fabric_id, to, quantity, extra, 0, "move");
  };

  setHetVai = oldStockLocations => {
    oldStockLocations.forEach(l => {
      l.total_stock = 0;
      l.extra_fabric = 0;
    });
    this.setState({oldStockLocations});
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
      isLoading,
      newStock,
      stockLocations,
      selectedOption,
      data,
      visible,
      image,
      loading,
      types,
      swatchbooks,
      locations,
      locationData,
      user,
      adjustStockVisible,
      record,
      addStockVisible,
      add,
      newLocation,
      creatingLoading,
      oldStockLocations,
      moveStockVisible,
      oldLocation,
      newExtra
    } = this.state;

    const options = [
      {
        value: 1,
        placeholder: this.state.dictionary ? this.getWord("fabric-code") : "",
        url: "fabricdetails?filter[where][unique_code][like]="
      },
      {
        value: 2,
        placeholder: this.state.dictionary
          ? this.getWord("fabric-code-old")
          : "",
        url: "fabricdetails?filter[where][old_code][like]="
      },
      {
        value: 3,
        placeholder: this.state.dictionary ? this.getWord("swatchbook") : ""
      },
      {
        value: 4,
        placeholder: this.state.dictionary ? this.getWord("location") : ""
      }
    ];
    const columnsLocations = [
      {
        title: this.getWord("fabric-code"),
        dataIndex: "unique_code",
        key: "unique_code",
        render: fabric => <Link to={`/f/${fabric}`}>{fabric}</Link>
      },
      {
        title: this.getWord("location"),
        dataIndex: "location",
        key: "location"
      }
    ];

    const columns = [
      {
        title: this.getWord("fabric-code"),
        dataIndex: "unique_code",
        key: "unique_code",
        sorter: (a, b) => {
          return a.unique_code.localeCompare(b.unique_code);
        },
        render: fabric => <Link to={`/f/${fabric}`}>{fabric}</Link>
      },
      {
        title: this.getWord("fabric-code-old"),
        dataIndex: "old_code",
        key: "old_code",
        sorter: (a, b) => {
          return a.old_code.localeCompare(b.old_code);
        }
      },
      {
        title: this.getWord("swatchbook"),
        dataIndex: "swatchbook",
        key: "swatchbook",
        sorter: (a, b) => {
          return a.swatchbook.localeCompare(b.swatchbook);
        },
        render: swatchbook => <Link to={`/s/${swatchbook}`}>{swatchbook}</Link>
      },
      {
        title: this.getWord("thumbnail"),
        dataIndex: "fabric_image",
        key: "fabric_image",
        render: fabric_image => (
          <Avatar
            size={100}
            shape="square"
            src={fabric_url + fabric_image}
            onClick={() => {
              this.setState({
                image: fabric_url_full + fabric_image
              });
              this.setState({visible: true});
            }}
          />
        )
      },
      {
        title: this.getWord("color"),
        dataIndex: "color",
        key: "color",
        filters: _.sortBy(this.state.colorFilter, [
          function(o) {
            return o.text;
          }
        ]),
        onFilter: (color, record) => {
          return record.color.indexOf(color) === 0;
        },

        sorter: (a, b) => {
          return a.color.localeCompare(b.color);
        },
        render: (color, record) => (
          /*<Select
            showSearch
            style={{width: 100}}
            placeholder="Select a Location"
            optionFilterProp="children"
            value={color}
            onChange={value => this.handleChangeColor(value, record)}
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
          >
            {this.state.colors ? (
              this.state.colors.map(l => (
                <Option value={l.description} key={l.id}>
                  {l.description}
                </Option>
              ))
            ) : (
              <div />
            )}
          </Select>*/
          <div>{color}</div>
        )
      },

      {
        title: this.getWord("stock"),
        dataIndex: "total_stock",
        key: "total_stock",
        sorter: (a, b) => a.total_stock - b.total_stock,
        filters: [
          {
            text: "Het Vai",
            value: 0
          }
        ],
        onFilter: (stock, record) => {
          return record.total_stock <= 0;
        },

        render: (stock, record) => (
          <div style={{display: "flex", justifyContent: "space-between"}}>
            <div>
              {!record.hetvai ? (
                record.stock.map(
                  (s, i) =>
                    Number(s.total_stock) > 0 && (
                      <div
                        key={i}
                        style={{display: "flex", flexDirection: "column"}}
                      >
                        <span>
                          <b>{s.location}</b>
                        </span>
                        <span style={{marginLeft: 10}}>
                          {this.getWord("stock") + ": " + s.stock + "m "}
                        </span>
                      </div>
                    )
                )
              ) : (
                <div style={{color: "red"}}>{this.getWord("no-stock")} </div>
              )}
            </div>
            {["admin", "stock"].find(
              i => i === localStorage.getItem("role")
            ) && (
              <div style={{marginLeft: 15, alignSelf: "center"}}>
                <Dropdown
                  overlay={
                    <Menu>
                      {this.state.record && (
                        <Menu.Item
                          onClick={() => this.addStock(this.state.record)}
                        >
                          {this.getWord("add-remove-stock")}
                        </Menu.Item>
                      )}
                      {this.state.record &&
                        (!this.state.record.hetvai && (
                          <Menu.Item
                            onClick={() => this.adjustStock(this.state.record)}
                          >
                            {this.getWord("het-vai-adjust")}
                          </Menu.Item>
                        ))}
                      {this.state.record &&
                        (!this.state.record.hetvai && (
                          <Menu.Item
                            onClick={() => this.moveStock(this.state.record)}
                          >
                            {this.getWord("move-fabric")}
                          </Menu.Item>
                        ))}
                    </Menu>
                  }
                  onClick={() => this.setState({record})}
                >
                  <Icon type="edit" style={{fontSize: 20}} />
                </Dropdown>
              </div>
            )}
          </div>
        )
      }
    ];
    const columnsSwatchbooks = [
      {
        title: this.getWord("swatchbook"),
        dataIndex: "unique_code",
        key: "unique_code",
        render: swatchbook => <Link to={`/s/${swatchbook}`}>{swatchbook}</Link>
      },
      {
        title: this.getWord("type"),
        dataIndex: "description",
        key: "description"
      },
      {
        title: this.getWord("alias"),
        dataIndex: "alias",
        key: "alias"
      },
      {
        title: "Fabric Count",
        dataIndex: "count",
        key: "count"
      }
    ];
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
          index="1"
          getWord={this.getWord}
          types={this.types}
          suppliers={this.suppliers}
          colors={this.colors}
          swatchbooklist={this.swatchbooklist}
          locationlist={this.locationlist}
          user={this.state.user}
        />
        <Content className="container">
          <div
            style={{
              flex: 1,
              flexDirection: "column",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-evenly",
              paddingBottom: 50
            }}
          >
            <Radio.Group
              defaultValue={1}
              buttonStyle="solid"
              style={{margin: 20}}
              value={selectedOption.value}
              onChange={e =>
                this.setState({
                  selectedOption: options.find(v => v.value === e.target.value)
                })
              }
            >
              {options.map(o => (
                <Radio.Button value={o.value} key={o.value}>
                  {o.placeholder}
                </Radio.Button>
              ))}
            </Radio.Group>
            {selectedOption.value === 1 || selectedOption.value === 2 ? (
              <Search
                placeholder={
                  selectedOption.value === 1
                    ? this.state.dictionary
                      ? this.getWord("fabric-code")
                      : ""
                    : this.state.dictionary
                      ? this.getWord("fabric-code-old")
                      : ""
                }
                onSearch={query => this.doSearch(selectedOption.url, query)}
                style={{width: 200}}
              />
            ) : selectedOption.value === 3 ? (
              <Select
                showSearch
                style={{width: 200}}
                placeholder={
                  this.state.dictionary
                    ? this.getWord("select-a-fabric-type")
                    : ""
                }
                optionFilterProp="children"
                onChange={value => this.handleChangeType(value)}
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                {types ? (
                  types.map(t => (
                    <Option value={t.description} key={t.id}>
                      {t.description + " - " + t.alias}
                    </Option>
                  ))
                ) : (
                  <div />
                )}
              </Select>
            ) : (
              <Select
                showSearch
                style={{width: 200}}
                placeholder={this.getWord("select-a-location")}
                optionFilterProp="children"
                onChange={value => this.handleChangeLocation(value)}
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                {locations ? (
                  locations.map(l => (
                    <Option value={l.description} key={l.id}>
                      {l.description}
                    </Option>
                  ))
                ) : (
                  <div />
                )}
              </Select>
            )}
          </div>
          {loading ? (
            <div style={{display: "flex", justifyContent: "center"}}>
              <Spin size="large" />
            </div>
          ) : data.length > 0 &&
          (selectedOption.value === 1 || selectedOption.value === 2) ? (
            <Table
              dataSource={data}
              columns={_.filter(columns, function(o) {
                return !o.role || user.role === "admin";
              })}
              rowKey="unique_code"
              size="small"
            />
          ) : swatchbooks.length > 0 && selectedOption.value === 3 ? (
            <Table
              size="small"
              dataSource={swatchbooks}
              columns={columnsSwatchbooks}
              rowKey="unique_code"
            />
          ) : locationData.length > 0 && selectedOption.value === 4 ? (
            <Table
              size="small"
              dataSource={locationData}
              columns={columnsLocations}
              rowKey="description"
            />
          ) : (
            <div />
          )}
        </Content>
        <Modal
          title={
            record
              ? this.getWord("adjust-stock-for") + " " + record.unique_code
              : ""
          }
          centered
          visible={adjustStockVisible}
          onOk={() => this.setState({adjustStockVisible: false})}
          onCancel={() => this.setState({adjustStockVisible: false})}
          footer={[
            <Button
              key="back"
              onClick={() => this.setState({adjustStockVisible: false})}
            >
              {this.getWord("cancel")}
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={creatingLoading}
              onClick={() =>
                this.saveAdjustStock(stockLocations, oldStockLocations)
              }
            >
              {this.getWord("save")}
            </Button>
          ]}
        >
          <div style={{display: "flex", flexDirection: "column"}}>
            <Button
              type="danger"
              style={{alignSelf: "flex-end"}}
              onClick={() => this.setHetVai(oldStockLocations)}
            >
              {this.getWord("mark-as-het-vai")}
            </Button>
            <Form>
              {oldStockLocations &&
                oldStockLocations.map((l, i) => (
                  <div key={i}>
                    <h3>{l.location}</h3>
                    <FormItem
                      label={this.getWord("quantity")}
                      {...formItemLayout}
                    >
                      <InputNumber
                        min={0}
                        value={l.total_stock}
                        onChange={value => {
                          l.total_stock = value;
                          this.setState({data});
                        }}
                      />
                      <span>{" m"}</span>
                    </FormItem>
                  </div>
                ))}
            </Form>
          </div>
        </Modal>
        <Modal
          visible={visible}
          footer={null}
          maskClosable={true}
          onCancel={() => {
            this.setState({visible: false});
            this.setState({image: null});
          }}
          width="100%"
        >
          <img
            style={{width: "100%"}}
            alt="Bebe Tailor"
            src={image}
            onClick={() => {
              this.setState({visible: false});
              this.setState({image: null});
            }}
          />
        </Modal>
        <Modal
          title={
            record
              ? this.getWord("add-remove-stock-for") + " " + record.unique_code
              : ""
          }
          centered
          visible={addStockVisible}
          onOk={() => this.setState({addStockVisible: false})}
          onCancel={() => this.setState({addStockVisible: false})}
          footer={[
            <Button
              key="back"
              onClick={() => this.setState({addStockVisible: false})}
            >
              {this.getWord("cancel")}
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={creatingLoading}
              onClick={() => {
                this.setState({creatingLoading: true});
                this.setStock(
                  record.fabric_id,
                  this.state.newLocation,
                  this.state.newStock,
                  this.state.newExtra,
                  add,
                  add === 0 ? "add" : "remove"
                );
              }}
            >
              {this.getWord("save")}
            </Button>
          ]}
        >
          <div style={{display: "flex", flexDirection: "column"}}>
            <RadioGroup
              onChange={value => {
                //console.log(this.state.newLocation);
                this.setState({add: value.target.value});
                this.setState({newLocation: null});
              }}
              buttonStyle="solid"
              value={add}
              style={{alignSelf: "center", paddingBottom: 30}}
            >
              <RadioButton value={0}>{this.getWord("add")}</RadioButton>
              {record &&
                (!record.hetvai && (
                  <RadioButton value={1}>{this.getWord("remove")}</RadioButton>
                ))}
            </RadioGroup>
            <Form>
              <FormItem label={this.getWord("location")} {...formItemLayout}>
                <Select
                  showSearch
                  value={newLocation && newLocation}
                  style={{width: add === 0 ? 200 : 300}}
                  placeholder={this.getWord("select-a-location")}
                  optionFilterProp="children"
                  onChange={newLocation => this.setState({newLocation})}
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {add === 0
                    ? locations.map(l => (
                        <Option value={l.id} key={l.id}>
                          {l.description}
                        </Option>
                      ))
                    : record.stock
                        .filter(i => i.total_stock > 0 || i.extra_fabric > 0)
                        .map(l => (
                          <Option value={l.location_id} key={l.location_id}>
                            <div>
                              <b>{l.location}</b>
                            </div>
                            <span style={{marginLeft: 20}}>
                              {this.getWord("stock") +
                                ": " +
                                l.total_stock +
                                "m - " +
                                this.getWord("extra") +
                                ": " +
                                l.extra_fabric +
                                "m"}
                            </span>
                          </Option>
                        ))}
                </Select>
              </FormItem>
              <FormItem label={this.getWord("quantity")} {...formItemLayout}>
                <InputNumber
                  min={0}
                  value={this.state.newStock ? this.state.newStock : 0}
                  onChange={newStock => {
                    this.setState({newStock});
                  }}
                />
                <span>{" m"}</span>
                {add === 1 && (
                  <Button
                    onClick={() => {
                      this.setState({
                        newStock: Number(
                          record.stock.find(i => i.location_id === newLocation)
                            .total_stock
                        )
                      });
                    }}
                    style={{marginLeft: 20}}
                    disabled={!newLocation}
                  >
                    {this.getWord("all")}
                  </Button>
                )}
              </FormItem>
            </Form>
          </div>
        </Modal>

        <Modal
          title={
            record
              ? this.getWord("move-stock-for") + " " + record.unique_code
              : ""
          }
          centered
          visible={moveStockVisible}
          onOk={() => this.setState({moveStockVisible: false})}
          onCancel={() => this.setState({moveStockVisible: false})}
          footer={[
            <Button
              key="back"
              onClick={() => this.setState({moveStockVisible: false})}
            >
              {this.getWord("cancel")}
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={creatingLoading}
              onClick={() => {
                this.setState({creatingLoading: true});
                this.saveMoveStock(
                  record.fabric_id,
                  oldLocation,
                  newLocation,
                  Number(newStock),
                  Number(newExtra)
                );
              }}
            >
              {this.getWord("save")}
            </Button>
          ]}
        >
          <div>
            <Form>
              <FormItem label={this.getWord("from")} {...formItemLayout}>
                <Select
                  showSearch
                  value={oldLocation && oldLocation}
                  style={{width: 200}}
                  placeholder={this.getWord("select-a-location")}
                  optionFilterProp="children"
                  onChange={oldLocation => {
                    this.setState({oldLocation});
                    //console.log(record.stock.find(i => i.location_id === oldLocation)  .total_stock  );
                  }}
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {record &&
                    record.stock.filter(s => s.total_stock > 0).map(l => (
                      <Option value={l.location_id} key={l.location_id}>
                        {l.location + "    max: " + l.total_stock + "m"}
                      </Option>
                    ))}
                </Select>
              </FormItem>
              <FormItem label={this.getWord("to")} {...formItemLayout}>
                <Select
                  showSearch
                  value={newLocation && newLocation}
                  style={{width: 200}}
                  placeholder={this.getWord("select-a-location")}
                  optionFilterProp="children"
                  onChange={newLocation => this.setState({newLocation})}
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {locations &&
                    locations.map(l => (
                      <Option value={l.id} key={l.id}>
                        {l.description}
                      </Option>
                    ))}
                </Select>
              </FormItem>
              <FormItem label={this.getWord("quantity")} {...formItemLayout}>
                <InputNumber
                  min={0}
                  max={
                    oldLocation &&
                    Number(
                      record.stock.find(i => i.location_id === oldLocation)
                        .total_stock
                    )
                  }
                  value={newStock ? newStock : 0}
                  onChange={newStock => {
                    this.setState({newStock});
                  }}
                />
                <span>{" m"}</span>
                <Button
                  style={{marginLeft: 20}}
                  disabled={!oldLocation}
                  onClick={() =>
                    this.setState({
                      newStock: record.stock.find(
                        i => i.location_id === oldLocation
                      ).total_stock,
                      newExtra: record.stock.find(
                        i => i.location_id === oldLocation
                      ).extra_fabric
                    })
                  }
                >
                  {this.getWord("all")}
                </Button>
              </FormItem>
            </Form>
          </div>
        </Modal>
      </Layout>
    ) : (
      <Content className="containerHome">
        <Spin size="large" />
      </Content>
    );
  }
}

export default _Search;
