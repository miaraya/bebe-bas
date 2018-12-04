import React, {Component} from "react";
import PropTypes from "prop-types";

import "antd/dist/antd.css";
import "../css/css.css";
import {Layout, Modal} from "antd";

import {Radio, Button, message} from "antd";
import {Input} from "antd";
import {api, fabric_url, fabric_url_full} from "./constants";
import {Table} from "antd";
import {Link} from "react-router";
import {Avatar} from "antd";
import {Spin} from "antd";
import {Select} from "antd";
import _ from "lodash";
import AuthService from "../AuthService";
import HeaderApp from "../components/header";
import Top from "../components/top";
import {Form, Icon, InputNumber, Dropdown, Menu} from "antd";
const FormItem = Form.Item;

const Auth = new AuthService(null);
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const Search = Input.Search;
const {Content} = Layout;

class _Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
      selectedOption: {
        value: 1,
        placeholder: "Fabric Code",
        url: "fabricdetails?filter[where][unique_code][like]="
      },
      options: [
        {
          value: 1,
          placeholder: "Fabric Code",
          url: "fabricdetails?filter[where][unique_code][like]="
        },
        {
          value: 2,
          placeholder: "Fabric Old Code",
          url: "fabricdetails?filter[where][old_code][like]="
        },
        {
          value: 3,
          placeholder: "Swatchbook"
        },
        {
          value: 4,
          placeholder: "Location"
        }
      ],

      columns: [
        {
          title: "Fabric",
          dataIndex: "unique_code",
          key: "unique_code",
          sorter: (a, b) => {
            return a.unique_code.localeCompare(b.unique_code);
          },
          render: fabric => <Link to={`/f/${fabric}`}>{fabric}</Link>
        },
        {
          title: "Old Code",
          dataIndex: "old_code",
          key: "old_code",
          sorter: (a, b) => {
            return a.old_code.localeCompare(b.old_code);
          }
        },
        {
          title: "Swatchbook",
          dataIndex: "swatchbook",
          key: "swatchbook",
          sorter: (a, b) => {
            return a.swatchbook.localeCompare(b.swatchbook);
          },
          render: swatchbook => (
            <Link to={`/s/${swatchbook}`}>{swatchbook}</Link>
          )
        },
        {
          title: "Thumbnail",
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
          title: "Color",
          dataIndex: "color",
          key: "color",
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
          ),
          role: "admin"
        },

        {
          title: "Stock",
          dataIndex: "total_stock",
          key: "total_stock",
          render: (stock, record) => (
            <div style={{display: "flex"}}>
              <div>
                {!record.hetvai ? (
                  record.stock.map(
                    (s, i) =>
                      Number(s.total_stock) + Number(s.extra_fabric) > 0 && (
                        <div
                          key={i}
                          style={{display: "flex", flexDirection: "column"}}
                        >
                          <span>
                            <b>{s.location}</b>
                          </span>
                          <span style={{marginLeft: 20}}>
                            {"Stock: " +
                              s.total_stock +
                              "m - Extra: " +
                              s.extra_fabric +
                              "m"}
                          </span>
                        </div>
                      )
                  )
                ) : (
                  <div style={{color: "red"}}>No Stock </div>
                )}
              </div>
              <div style={{marginLeft: 15, alignSelf: "center"}}>
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item>
                        <a onClick={() => this.addStock(this.state.record)}>
                          Add/Remove
                        </a>
                      </Menu.Item>
                      {this.state.record &&
                        (!this.state.record.hetvai && (
                          <Menu.Item>
                            <a
                              onClick={() =>
                                this.adjustStock(this.state.record)
                              }
                            >
                              Adjust
                            </a>
                          </Menu.Item>
                        ))}
                      {this.state.record &&
                        (!this.state.record.hetvai && (
                          <Menu.Item>
                            <a
                              onClick={() => this.moveStock(this.state.record)}
                            >
                              Move
                            </a>
                          </Menu.Item>
                        ))}
                    </Menu>
                  }
                  onClick={() => this.setState({record})}
                >
                  <Icon type="edit" />
                </Dropdown>
              </div>
            </div>
          )
        }
      ],
      columnsSwatchbooks: [
        {
          title: "Swatchbook",
          dataIndex: "unique_code",
          key: "unique_code",
          render: swatchbook => (
            <Link to={`/s/${swatchbook}`}>{swatchbook}</Link>
          )
        },
        {
          title: "Fabric Type",
          dataIndex: "description",
          key: "description"
        },
        {
          title: "Alias",
          dataIndex: "alias",
          key: "alias"
        },
        {
          title: "Fabric Count",
          dataIndex: "count",
          key: "count"
        }
      ],
      columnsLocations: [
        {
          title: "Fabric",
          dataIndex: "unique_code",
          key: "unique_code",
          render: fabric => <Link to={`/f/${fabric}`}>{fabric}</Link>
        },
        {
          title: "Location",
          dataIndex: "location",
          key: "location"
        }
      ]
    };
  }

  addStock = record => {
    this.clear();
    this.setState({record});
    this.setState({addStockVisible: true});
  };
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

        this.getTypes();
        this.getLocations();
        this.getColors();
        this.getDictionary();
      } catch (err) {
        //console.log(err);
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
      });
  };
  handleLanguage = () => {
    this.setState({english: !this.state.english});
    this.setState({toLanguage: !this.state.english ? "Vietnamese" : "English"});
  };
  getWord = key => {
    if (this.state.dictionary) {
      var array = this.state.dictionary.filter(item => item.key === key);
      if (array[0])
        return this.state.english ? array[0].english : array[0].vietnamese;
      else {
        return "NOT FOUND";
      }
    }
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

    data.map(r => {
      total = 0;
      r.stock.map(s => {
        total = total + Number(s.total_stock) + Number(s.extra_fabric);
        //console.log(total);
      });
      total > 0 ? (r.hetvai = false) : (r.hetvai = true);
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
    //console.log("clear");
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

  setStock = (fabric_id, location_id, quantity, extra, add) => {
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
        extra: extra ? extra : 0
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
            aux.stock.map(s => {
              total = total + Number(s.total_stock) + Number(s.extra_fabric);
              //console.log(total);
            });
            total > 0 ? (aux.hetvai = false) : (aux.hetvai = true);

            this.setState({record: aux});

            this.setState({addStockVisible: false});
            this.setState({adjustStockVisible: false});
            this.setState({moveStockVisible: false});

            add === 0
              ? message.success("Yo added " + quantity + " meters")
              : message.success("Yo removed " + quantity * -1 + " meters");

            this.clear();
          });
      });

    //this.setState({record: [0]});
  };

  saveAdjustStock = (stock, oldStock) => {
    stock.map((s, i) => {
      this.setStock(
        s.fabric_id,
        s.location_id,
        Number(s.total_stock) + Number(oldStock[i].total_stock) * -1,
        Number(s.extra_fabric) + Number(oldStock[i].extra_fabric) * -1,
        1
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
    this.setStock(fabric_id, from, quantity, extra, 1);
    this.setStock(fabric_id, to, quantity, extra, 0);
  };

  setHetVai = oldStockLocations => {
    oldStockLocations.map(l => {
      l.total_stock = 0;
      l.extra_fabric = 0;
    });
    this.setState({oldStockLocations});
  };

  render() {
    const {
      newStock,
      stockLocations,
      options,
      selectedOption,
      data,
      visible,
      image,
      loading,
      columns,
      types,
      swatchbooks,
      columnsSwatchbooks,
      columnsLocations,
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
    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 8}
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 16}
      }
    };
    return (
      <Layout className="wrapper">
        {Auth.loggedIn() && <Top username={this.state.user.username} />}
        <HeaderApp index="1" />
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
                placeholder={selectedOption.placeholder}
                onSearch={query => this.doSearch(selectedOption.url, query)}
                style={{width: 200}}
              />
            ) : selectedOption.value === 3 ? (
              <Select
                showSearch
                style={{width: 200}}
                placeholder="Select a Fabric Type"
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
                placeholder="Select a Location"
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
          title={record ? "Adjust stock for: " + record.unique_code : ""}
          centered
          visible={adjustStockVisible}
          onOk={() => this.setState({adjustStockVisible: false})}
          onCancel={() => this.setState({adjustStockVisible: false})}
          footer={[
            <Button
              key="back"
              onClick={() => this.setState({adjustStockVisible: false})}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={creatingLoading}
              onClick={() =>
                this.saveAdjustStock(stockLocations, oldStockLocations)
              }
            >
              Save
            </Button>
          ]}
        >
          <div style={{display: "flex", flexDirection: "column"}}>
            <Button
              type="danger"
              style={{alignSelf: "flex-end"}}
              onClick={() => this.setHetVai(oldStockLocations)}
            >
              Mark as Het Vai
            </Button>
            <Form>
              {oldStockLocations &&
                oldStockLocations.map((l, i) => (
                  <div key={i}>
                    <h3>{l.location}</h3>
                    <FormItem label="Quantity" {...formItemLayout}>
                      <InputNumber
                        min={0}
                        value={l.total_stock}
                        onChange={value => {
                          l.total_stock = value;
                          this.setState({data});
                        }}
                      />
                    </FormItem>

                    <FormItem label="Extra Fabric" {...formItemLayout}>
                      <InputNumber
                        min={0}
                        value={l.extra_fabric}
                        onChange={value => {
                          l.extra_fabric = value;
                          this.setState({data});
                        }}
                      />
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
          title={record ? "Add/Remove stock for: " + record.unique_code : ""}
          centered
          visible={addStockVisible}
          onOk={() => this.setState({addStockVisible: false})}
          onCancel={() => this.setState({addStockVisible: false})}
          footer={[
            <Button
              key="back"
              onClick={() => this.setState({addStockVisible: false})}
            >
              Cancel
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
                  add
                );
              }}
            >
              Save
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
              <RadioButton value={0}>Add</RadioButton>
              {record &&
                (!record.hetvai && <RadioButton value={1}>Remove</RadioButton>)}
            </RadioGroup>
            <Form>
              <FormItem label="Location" {...formItemLayout}>
                <Select
                  showSearch
                  value={newLocation && newLocation}
                  style={{width: 200}}
                  placeholder="Select a Location"
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
                            <div>
                              {"Stock: " +
                                l.total_stock +
                                "m - Extra: " +
                                l.extra_fabric +
                                "m"}
                            </div>
                          </Option>
                        ))}
                </Select>
              </FormItem>
              <FormItem label="Quantity" {...formItemLayout}>
                <InputNumber
                  min={0}
                  value={this.state.newStock ? this.state.newStock : 0}
                  onChange={newStock => {
                    this.setState({newStock});
                  }}
                />
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
                    All
                  </Button>
                )}
              </FormItem>
              <FormItem label="Extra" {...formItemLayout}>
                <InputNumber
                  min={0}
                  value={this.state.newExtra ? this.state.newExtra : 0}
                  onChange={newExtra => {
                    this.setState({newExtra});
                  }}
                />
                {add === 1 && (
                  <Button
                    onClick={() => {
                      this.setState({
                        newExtra: Number(
                          record.stock.find(i => i.location_id === newLocation)
                            .extra_fabric
                        )
                      });
                    }}
                    style={{marginLeft: 20}}
                    disabled={!newLocation}
                  >
                    All
                  </Button>
                )}
              </FormItem>
            </Form>
          </div>
        </Modal>

        <Modal
          title={record ? "Move stock for: " + record.unique_code : ""}
          centered
          visible={moveStockVisible}
          onOk={() => this.setState({moveStockVisible: false})}
          onCancel={() => this.setState({moveStockVisible: false})}
          footer={[
            <Button
              key="back"
              onClick={() => this.setState({moveStockVisible: false})}
            >
              Cancel
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
              Save
            </Button>
          ]}
        >
          <div>
            <Form>
              <FormItem label="From" {...formItemLayout}>
                <Select
                  showSearch
                  value={oldLocation && oldLocation}
                  style={{width: 200}}
                  placeholder="Select a Location"
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
              <FormItem label="To" {...formItemLayout}>
                <Select
                  showSearch
                  value={newLocation && newLocation}
                  style={{width: 200}}
                  placeholder="Select a Location"
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
              <FormItem label="Quantity" {...formItemLayout}>
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
                  {" "}
                  All
                </Button>
              </FormItem>
              <FormItem label="Extra" {...formItemLayout}>
                <InputNumber
                  min={0}
                  max={
                    oldLocation &&
                    Number(
                      record.stock.find(i => i.location_id === oldLocation)
                        .extra_fabric
                    )
                  }
                  value={newExtra ? newExtra : 0}
                  onChange={newExtra => {
                    this.setState({newExtra});
                  }}
                />
              </FormItem>
            </Form>
          </div>
        </Modal>
      </Layout>
    );
  }
}

export default _Search;
