import React, { Component } from "react";
import PropTypes from "prop-types";

import "antd/dist/antd.css";
import "../css/css.css";
import { Layout, Modal } from "antd";

import { Radio, message, Row } from "antd";
import { Input } from "antd";
import { api } from "./constants";
import { Table } from "antd";
import { Link } from "react-router";
import { Avatar } from "antd";
import { Spin } from "antd";
import { Select } from "antd";
import _ from "lodash";
import HeaderApp from "../components/header";
import Top from "../components/top";
import { Icon, Dropdown, Menu } from "antd";
import AuthService from "../AuthService";
import Logo from "../assets/logo_small.png";

import { AddModal } from "../components/addRemoveStock";
import { AdjustModal } from "../components/adjustStock";
import { MoveModal } from "../components/moveStock";

import { FabricForm } from "../components/fabric";
//import Dashboard from "./dashboard";

const Auth = new AuthService(null);

const Option = Select.Option;
const Search = Input.Search;
const { Content } = Layout;

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
      editFabricVisible: false,
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
      selectedOption: undefined,
    };
  }

  componentDidMount = () => {
    if (!Auth.loggedIn()) {
      this.context.router.replace("/");
    } else {
      try {
        const profile = Auth.getProfile();
        this.setState({
          user: profile,
        });
        this.setState({ language: localStorage.getItem("language") });
        this.getDictionary();

        this.getTypes();
        this.getLocations();
        this.getColors();
        this.getSuppliers();
        this.getSwatchbookList();

        this.setState({
          selectedOption: {
            value: 1,
            url: "fabricdetails?filter[where][unique_code][like]=",
          },
        });
        this.showSearch();
      } catch (err) {
        Auth.logout();
        this.context.router.replace("/");
      }
    }
  };

  addStock = (record) => {
    const { form } = this.addForm.props;
    form.resetFields();
    this.clear();
    this.setState({ record });
    this.setState({ addStockVisible: true });
    this.forceUpdate();
  };

  adjustStock = (record) => {
    const { form } = this.adjustForm.props;

    form.resetFields();
    this.clear();
    this.setState({ record });
    this.setState({ adjustStockVisible: true });
    let stock = this.state.data.find(
      (i) => i.unique_code === record.unique_code
    ).stock;
    this.setState({
      stockLocations: stock.filter((i) => Number(i.total_stock) > 0),
    });

    this.setState({
      oldStockLocations: JSON.parse(
        JSON.stringify(stock.filter((i) => Number(i.total_stock) > 0))
      ),
    });

    this.setState({ adjustStockVisible: true });
  };

  moveStock = (record) => {
    const { form } = this.moveForm.props;
    form.resetFields();
    this.clear();
    this.setState({ moveStockVisible: true });
  };

  async saveMoveStock(fabric_id, from, to, quantity) {
    this.setState({ creatingLoading: true });
    await this.setStock(Number(fabric_id), from, quantity, 1, "move remove");
    await this.setStock(Number(fabric_id), to, quantity, 0, "move add");
  }

  editFabric = (record) => {
    const { form } = this.editFabricForm.props;
    form.resetFields();
    this.clear();
    this.setState({ editFabricVisible: true });
  };

  handleEditFabric = () => {
    const { form } = this.editFabricForm.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.state.record.fabric_id && this.saveEditFabric(values);
      form.resetFields();
    });
  };

  handleNewFabric = () => {
    const { form } = this.newFabricForm.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.saveNewFabric(values);
      form.resetFields();
    });
  };

  handleMoveStock = () => {
    const { form } = this.moveForm.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.saveMoveStock(
        this.state.record.fabric_id,
        values.fromLocation,
        values.toLocation,
        values.quantity
      );
      form.resetFields();
    });
  };

  handleAdjustStock = (oldStockLocations) => {
    const { form } = this.adjustForm.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.saveAdjustStock(oldStockLocations, this.state.record.stock);
      form.resetFields();
    });
  };

  async saveAdjustStock(newStock, stock) {
    this.setState({ creatingLoading: true });
    for (let i = 0; i < newStock.length; i++) {
      let oldStock = stock.find(
        (j) => j.location_id === newStock[i].location_id
      ).stock;
      if (oldStock !== newStock[i].stock) {
        if (Number(oldStock) !== 0)
          await this.setStock(
            newStock[i].fabric_id,
            newStock[i].location_id,
            oldStock,
            1,
            "adjust remove"
          );
        if (Number(newStock[i].stock) !== 0)
          await this.setStock(
            newStock[i].fabric_id,
            newStock[i].location_id,
            newStock[i].stock,
            0,
            "adjust add"
          );
      }
    }
  }

  saveEditFabric = (values) => {
    this.setState({ creatingLoading: true });
    console.log(values);

    values &&
      this.state.record.fabric_id &&
      fetch(api + "fabrics/update?where[id]=" + this.state.record.fabric_id, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          color_id: values.color,
          old_code: values.supplier_code,
          supplier_id: values.supplier,
          price: values.price,
          swatchbook_id: values.swatchbook,
          price_band_id: values.price_band,
        }),
      })
        .then((response) => response.json())
        .then((responseData) => {
          if (responseData.count > 0) {
            message.success("Fabric: " + values.code + " edited.");

            this.setState({ editFabricVisible: false });
            fetch(
              api +
                "fabricdetails?filter[where][unique_code][like]=" +
                this.state.record.unique_code
            )
              .then((res) => {
                if (res.ok) {
                  return res.json();
                } else {
                  this.setState({ error: true });
                  throw new Error("Something went wrong ...");
                }
              })
              .then((data) => {
                let aux = this.state.record;
                aux.stock = _.sortBy(data, [
                  function (o) {
                    return o.location;
                  },
                ]);

                let total = 0;
                aux.stock.forEach((s) => {
                  total = total + Number(s.stock);
                });
                total > 0 ? (aux.hetvai = false) : (aux.hetvai = true);

                aux.old_code = data[0].old_code;
                aux.swatchbook_id = data[0].swatchbook_id;
                aux.swatchbook = data[0].swatchbook;
                aux.color = data[0].color;
                aux.color_id = data[0].color_id;
                aux.price = data[0].price;
                aux.price_band = data[0].price_band;
                this.setState({ record: aux });
                this.forceUpdate();
              });
          } else {
            message.error("Error: " + responseData.error.message);
          }
          console.log(
            "POST Response",
            "Response Body -> " + JSON.stringify(responseData)
          );
        });
  };

  saveNewFabric = (values) => {
    this.setState({ creatingLoading: true });
    fetch(api + "fabrics", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type_id: values.type,
        unique_code: values.code,
        color_id: values.color,
        old_code: values.supplier_code,
        supplier_id: values.supplier,
        price: values.price,
        swatchbook_id: values.swatchbook,
        price_band_id: values.price_band,
        image: values.code.toUpperCase() + ".jpg",
        user_id: this.props.user ? Number(this.props.user.staff_id) : -1,
        total_stock: values.quantity,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.id) {
          this.setStock(
            responseData.id,
            values.location,
            values.stock,
            0,
            "add"
          );
          message.success("Fabric: " + values.code + " created.");
        } else {
          message.error("Error: " + responseData.error.message);
        }
        console.log(
          "POST Response",
          "Response Body -> " + JSON.stringify(responseData)
        );
      });
  };

  handleAddRemoveStock = () => {
    const { form } = this.addForm.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      if (values.quantity !== 0) {
        this.setState({ creatingLoading: true });
        this.setStock(
          this.state.record.fabric_id,
          values.location,
          values.quantity,
          values.add,
          values.add === 0 ? "add" : "remove"
        );
        form.resetFields();
      }
      form.setFieldsValue({ add: 0 });
    });
  };

  saveFormRef = (addForm) => {
    this.addForm = addForm;
  };

  adjustFormRef = (adjustForm) => {
    this.adjustForm = adjustForm;
  };

  moveFormRef = (moveForm) => {
    this.moveForm = moveForm;
  };
  editFabricFormRef = (editFabricForm) => {
    this.editFabricForm = editFabricForm;
  };
  newFabricFormRef = (newFabricForm) => {
    this.newFabricForm = newFabricForm;
  };

  showModal = () => {
    this.setState({ add: 0 });

    this.setState({ addStockVisible: true });
  };

  handleCancel = (form) => {
    form.resetFields();
    this.setState({ add: 0 });
    this.setState({ addStockVisible: false });
    this.setState({ adjustStockVisible: false });
    this.setState({ moveStockVisible: false });
  };

  locationlist = () => {
    return this.state.locations;
  };

  colors = () => {
    return this.state.colors;
  };
  swatchbooklist = (filter) => {
    return filter
      ? this.state.swatchbooklist.filter((i) => i.type_id === filter)
      : this.state.swatchbooklist;
  };
  getSwatchbookList = () => {
    fetch(api + "swatchbooks")
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then((swatchbooklist) => {
        this.setState({
          swatchbooklist: _.sortBy(swatchbooklist, [
            function (o) {
              return o.unique_code;
            },
          ]),
        });
      })
      .catch((error) => {});
  };
  getSuppliers = () => {
    fetch(api + "suppliers")
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then((suppliers) => {
        this.setState({
          suppliers: _.sortBy(suppliers, [
            function (o) {
              return o.name;
            },
          ]),
        });
      })
      .catch((error) => {});
  };
  suppliers = () => {
    return this.state.suppliers;
  };
  getLanguage = () => {
    return this.state.language;
  };

  getDictionary = () => {
    fetch(api + "/dictionaries")
      .then((res) => res.json())
      .then((dictionary) => {
        this.setState({ dictionary });
        this.setState({ isLoading: false });
        //console.log(dictionary);
      });
  };

  getWord = (key) => {
    return this.state.dictionary
      ? this.state.language === "vietnamese"
        ? this.state.dictionary.find((i) => i.key === key)
          ? this.state.dictionary.find((i) => i.key === key).vietnamese
          : ""
        : this.state.dictionary.find((i) => i.key === key)
        ? this.state.dictionary.find((i) => i.key === key).english
        : ""
      : "";
  };

  doSearch = (url, query) => {
    this.setState({ loading: true });
    fetch(api + url + "%" + query + "%")
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((data) => {
        var result = _(data)
          .groupBy((x) => x.unique_code)
          .map((value, key) => ({
            stock: value,
            unique_code: key,
            old_code: value[0].old_code,
            swatchbook: value[0].swatchbook,
            fabric_image: value[0].fabric_image,
            color: value[0].color,
            fabric_id: value[0].fabric_id,
            thumbnail_url: value[0].thumbnail_url,
            image_url: value[0].image_url,
            total: Number(value[0].total_stock),
            hetvai: value[0].total_stock <= 0,
            type: value[0].type,
            supplier: value[0].supplier,
            supplier_id: value[0].supplier_id,
            price: value[0].price,
            price_band: value[0].price_band,
            color_id: value[0].color_id,
            type_id: value[0].type_id,
            swatchbook_id: value[0].swatchbook_id,
          }))
          //.sortBy(result, ["unique_code", "old_code"])
          .value();

        this.setState({
          data: _.orderBy(result, ["hetvai", "unique_code"], ["asc", "asc"]),
        });
        this.setState({ loading: false });
      })
      .catch((error) => {});
  };
  types = () => {
    return this.state.types;
  };
  getTypes = () => {
    fetch(api + "fabric_types")
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then((types) => {
        this.setState({
          types: _.sortBy(types, [
            function (o) {
              return o.description;
            },
          ]),
        });
        this.setState({ loading: false });
      })
      .catch((error) => {});
  };
  getSwatchbooks = (id) => {
    this.setState({ loading: true });
    fetch(api + "web_swatchbooks?filter[where][description]=" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then((swatchbooks) => {
        this.setState({ swatchbooks });
        this.setState({ loading: false });
      })
      .catch((error) => {});
  };
  getLocationData = (id) => {
    this.setState({ loading: true });
    fetch(api + "stock_locations?filter[where][location]=" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then((locationData) => {
        this.setState({
          locationData,
        });
        this.setState({ loading: false });
      })
      .catch((error) => {});
  };
  getLocations = () => {
    this.setState({ loading: true });
    fetch(api + "locations")
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then((locations) => {
        //onsole.log(locations);
        this.setState({
          locations: _.sortBy(locations, [
            function (o) {
              return o.description;
            },
          ]),
        });
        this.setState({ loading: false });
      })
      .catch((error) => {});
  };
  getColors = () => {
    fetch(api + "colors")
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then((colors) => {
        this.setState({
          colors: _.sortBy(colors, [
            function (o) {
              return o.description;
            },
          ]),
        });

        let colorFilter = [];
        colors.map(
          (c) =>
            c.description &&
            colorFilter.push({
              text: c.description,
              value: c.description,
              id: c.id,
            })
        );

        this.setState({ colorFilter });

        this.setState({ loading: false });
      })
      .catch((error) => {});
  };
  handleChangeType = (value) => {
    this.getSwatchbooks(value);
  };
  handleChangeLocation = (value) => {
    this.getLocationData(value);
  };
  handleChangeColor = (value, record) => {};

  getStockData = (unique_code) => {
    fetch(
      api + "fabric_location_stocks?filter[where][unique_code]=" + unique_code
    )
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((stockLocations) => {
        this.setState({ stockLocations });
      })
      .catch((error) => {});
  };

  clear = () => {
    this.setState({
      newLocation: undefined,
      newStock: undefined,
      oldLocation: undefined,
      add: undefined,
      creatingLoading: false,
    });
    this.forceUpdate();
  };

  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.shape({
        push: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired,
      }),
      staticContext: PropTypes.object,
    }).isRequired,
  };

  setStock = (fabric_id, location_id, quantity, add, action) => {
    return new Promise((resolve) => {
      //add or Remove
      if (add === 1) {
        quantity = quantity * -1;
      }

      const fetchPromise = fetch(api + "stocks", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fabric_id,
          location_id,
          quantity: quantity ? quantity : 0,
          user_id: Number(this.state.user.staff_id),
          action,
        }),
      });
      fetchPromise
        .then((response) => {
          return response.json();
        })
        .then((responseData) => {
          this.setState({ creatingLoading: false });
          this.setState({ addStockVisible: false });
          resolve("resolvedd");

          this.state.record &&
            fetch(
              api +
                "fabricdetails?filter[where][unique_code][like]=" +
                this.state.record.unique_code
            )
              .then((res) => {
                if (res.ok) {
                  return res.json();
                } else {
                  this.setState({ error: true });
                  throw new Error("Something went wrong ...");
                }
              })
              .then((data) => {
                let aux = this.state.record;
                aux.stock = _.sortBy(data, [
                  function (o) {
                    return o.location;
                  },
                ]);

                let total = 0;
                aux.stock.forEach((s) => {
                  total = total + Number(s.stock);
                });
                total > 0 ? (aux.hetvai = false) : (aux.hetvai = true);

                this.setState({ record: aux });
                this.setState({ addStockVisible: false });
                this.setState({ adjustStockVisible: false });
                this.setState({ moveStockVisible: false });

                add === 0
                  ? message.success(quantity + " meters added")
                  : message.success(quantity * -1 + " meters removed");

                this.clear();
              });
        });
    });
  };

  setHetVai = (oldStockLocations) => {
    oldStockLocations.forEach((l) => {
      l.stock = 0;
    });
    this.forceUpdate();
    this.setState({ oldStockLocations });
  };

  handleLanguage = () => {
    this.state.language === "vietnamese"
      ? this.setState({ language: "english" })
      : this.setState({ language: "vietnamese" });

    this.state.language === "vietnamese"
      ? localStorage.setItem("language", "english")
      : localStorage.setItem("language", "vietnamese");
  };
  /*
  showDashboard = () => {
    this.setState({ dashboardVisible: true });
    this.setState({ searchVisible: false });
  };
  */
  showSearch = () => {
    this.setState({ dashboardVisible: false });
    this.setState({ searchVisible: true });
  };

  render() {
    const {
      isLoading,
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
      creatingLoading,
      moveStockVisible,
      editFabricVisible,
      //dashboardVisible,
      searchVisible,
    } = this.state;

    const options = [
      {
        value: 1,
        placeholder: this.state.dictionary ? this.getWord("fabric-code") : "",
        url: "fabricdetails?filter[where][unique_code][like]=",
      },
      {
        value: 2,
        placeholder: this.state.dictionary
          ? this.getWord("fabric-code-old")
          : "",
        url: "fabricdetails?filter[where][old_code][like]=",
      },
      {
        value: 3,
        placeholder: this.state.dictionary ? this.getWord("swatchbook") : "",
      },
      {
        value: 4,
        placeholder: this.state.dictionary ? this.getWord("location") : "",
      },
    ];
    const columnsLocations = [
      {
        title: this.getWord("fabric-code"),
        dataIndex: "unique_code",
        key: "unique_code",
        render: (fabric) => <Link to={`/f/${fabric}`}>{fabric}</Link>,
      },
      {
        title: this.getWord("location"),
        dataIndex: "location",
        key: "location",
      },
    ];

    const columns = [
      {
        title: this.getWord("fabric-code"),
        dataIndex: "unique_code",
        key: "unique_code",
        sorter: (a, b) => {
          return a.unique_code.localeCompare(b.unique_code);
        },
        render: (fabric) => <Link to={`/f/${fabric}`}>{fabric}</Link>,
      },
      {
        title: this.getWord("fabric-code-old"),
        dataIndex: "old_code",
        key: "old_code",
        sorter: (a, b) => {
          return a.old_code.localeCompare(b.old_code);
        },
      },
      {
        title: this.getWord("swatchbook"),
        dataIndex: "swatchbook",
        key: "swatchbook",
        sorter: (a, b) => {
          return a.swatchbook.localeCompare(b.swatchbook);
        },
        render: (swatchbook) => (
          <Link to={`/s/${swatchbook}`}>{swatchbook}</Link>
        ),
      },
      {
        title: this.getWord("thumbnail"),
        dataIndex: "thumbnail_url",
        key: "thumbnail_url",
        render: (thumbnail_url, record) => (
          <Avatar
            size={100}
            shape="square"
            src={thumbnail_url}
            onClick={() => {
              this.setState({
                image: record.image_url,
              });
              this.setState({ visible: true });
            }}
          />
        ),
      },
      {
        title: this.getWord("color"),
        dataIndex: "color",
        key: "color",
        filters: _.sortBy(this.state.colorFilter, [
          function (o) {
            return o.text;
          },
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
        ),
      },

      {
        title: this.getWord("stock"),
        dataIndex: "total_stock",
        key: "total_stock",
        sorter: (a, b) => a.total_stock - b.total_stock,
        filters: [
          {
            text: "No Stock",
            value: 0,
          },
          {
            text: "In Stock",
            value: 1,
          },
        ],
        filterMultiple: false,
        onFilter: (stock, record) => {
          if (stock === 0) return Number(record.total) <= 0;
          else return Number(record.total) > 0;
        },

        render: (stock, record) => (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              {!record.hetvai && (
                <div style={{ marginBottom: 10 }}>
                  {this.getWord("total-stock")}:{" "}
                  <b>{record.stock[0].total_stock}m</b>
                </div>
              )}
              {!record.hetvai ? (
                record.stock.map(
                  (s, i) =>
                    Number(s.total_stock) > 0 && (
                      <div
                        key={i}
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        <span>
                          {s.location + ": "}
                          <b>{s.stock + "m "}</b>
                        </span>
                      </div>
                    )
                )
              ) : (
                <div style={{ color: "red" }}>{this.getWord("no-stock")} </div>
              )}
            </div>
            {["admin", "stock"].find(
              (i) => i === localStorage.getItem("role")
            ) && (
              <div style={{ marginLeft: 15, alignSelf: "center" }}>
                <Dropdown
                  overlay={
                    <Menu>
                      {record && (
                        <Menu.Item onClick={() => this.addStock(record)}>
                          {this.getWord("add-remove-stock")}
                        </Menu.Item>
                      )}
                      {record && !record.hetvai && (
                        <Menu.Item onClick={() => this.adjustStock(record)}>
                          {this.getWord("het-vai-adjust")}
                        </Menu.Item>
                      )}
                      {record && !record.hetvai && (
                        <Menu.Item onClick={() => this.moveStock(record)}>
                          {this.getWord("move-fabric")}
                        </Menu.Item>
                      )}
                      {record && (
                        <Menu.Item onClick={() => this.editFabric(record)}>
                          {this.getWord("edit-fabric")}
                        </Menu.Item>
                      )}
                    </Menu>
                  }
                  onClick={() => this.setState({ record })}
                >
                  <Icon type="edit" style={{ fontSize: 20 }} />
                </Dropdown>
              </div>
            )}
          </div>
        ),
      },
    ];
    const columnsSwatchbooks = [
      {
        title: this.getWord("swatchbook"),
        dataIndex: "unique_code",
        key: "unique_code",
        render: (swatchbook) => (
          <Link to={`/s/${swatchbook}`}>{swatchbook}</Link>
        ),
      },
      {
        title: this.getWord("type"),
        dataIndex: "description",
        key: "description",
      },
      {
        title: this.getWord("alias"),
        dataIndex: "alias",
        key: "alias",
      },
      {
        title: "Fabric Count",
        dataIndex: "count",
        key: "count",
      },
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
        <Row
          type="flex"
          justify="center"
          align="middle"
          gutter={16}
          span={24}
          style={{
            marginBottom: 20,
          }}
        >
          <img src={Logo} alt="Bebe Tailor" width="150px" />
        </Row>
        <HeaderApp
          index="1"
          getWord={this.getWord}
          types={this.types}
          suppliers={this.suppliers}
          colors={this.colors}
          swatchbooklist={this.swatchbooklist}
          locationlist={this.locationlist}
          user={this.state.user}
          handleNewFabric={this.handleNewFabric}
          newFabricFormRef={this.newFabricFormRef}
          // showDashboard={this.showDashboard}
          showSearch={this.showSearch}
        />
        {/* dashboardVisible && <Dashboard /> */}
        {searchVisible && (
          <Content className="container">
            <div
              style={{
                flex: 1,
                flexDirection: "column",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
                paddingBottom: 50,
              }}
            >
              <Radio.Group
                defaultValue={1}
                buttonStyle="solid"
                style={{ margin: 20 }}
                value={selectedOption.value}
                onChange={(e) =>
                  this.setState({
                    selectedOption: options.find(
                      (v) => v.value === e.target.value
                    ),
                  })
                }
              >
                {options.map((o) => (
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
                  onSearch={(query) => this.doSearch(selectedOption.url, query)}
                  style={{ width: 200 }}
                />
              ) : selectedOption.value === 3 ? (
                <Select
                  showSearch
                  style={{ width: 200 }}
                  placeholder={
                    this.state.dictionary
                      ? this.getWord("select-a-fabric-type")
                      : ""
                  }
                  optionFilterProp="children"
                  onChange={(value) => this.handleChangeType(value)}
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {types ? (
                    types.map((t) => (
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
                  style={{ width: 200 }}
                  placeholder={this.getWord("select-a-location")}
                  optionFilterProp="children"
                  onChange={(value) => this.handleChangeLocation(value)}
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {locations &&
                    locations.map((l) => (
                      <Option value={l.description} key={l.id}>
                        {l.description}
                      </Option>
                    ))}
                </Select>
              )}
            </div>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Spin size="large" />
              </div>
            ) : data.length > 0 &&
              (selectedOption.value === 1 || selectedOption.value === 2) ? (
              <Table
                dataSource={data}
                columns={_.filter(columns, function (o) {
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
        )}

        <AddModal
          visible={addStockVisible}
          onCancel={this.handleCancel}
          onOk={this.handleAddRemoveStock}
          wrappedComponentRef={this.saveFormRef}
          locations={this.state.locations}
          record={record}
          getWord={this.getWord}
          creatingLoading={creatingLoading}
          add={this.state.add}
        />

        <AdjustModal
          visible={adjustStockVisible}
          onCancel={this.handleCancel}
          onOk={this.handleAdjustStock}
          getWord={this.getWord}
          record={record}
          oldStockLocations={this.state.oldStockLocations}
          setHetVai={this.setHetVai}
          wrappedComponentRef={this.adjustFormRef}
          creatingLoading={creatingLoading}
        />
        <MoveModal
          visible={moveStockVisible}
          getWord={this.getWord}
          newStock={this.state.newStock}
          locations={this.state.locations}
          onCancel={this.handleCancel}
          record={record}
          creatingLoading={creatingLoading}
          onOk={this.handleMoveStock}
          wrappedComponentRef={this.moveFormRef}
        />

        <FabricForm
          record={record}
          visible={editFabricVisible}
          getWord={this.getWord}
          types={this.types}
          colors={this.colors}
          swatchbooklist={() => this.swatchbooklist(record && record.type_id)}
          locationlist={this.locationlist}
          suppliers={this.suppliers}
          user={this.user}
          onOk={this.handleEditFabric}
          edit={true}
          onCancel={(form) => {
            this.setState({ editFabricVisible: false });
            form.resetFields();
          }}
          wrappedComponentRef={this.editFabricFormRef}
          creatingLoading={creatingLoading}
        />

        <Modal
          visible={visible}
          footer={null}
          maskClosable={true}
          onCancel={() => {
            this.setState({ visible: false });
            this.setState({ image: null });
          }}
          width="100%"
        >
          <img
            style={{
              width: "100%",
            }}
            alt="Bebe Tailor"
            src={image}
            onClick={() => {
              this.setState({ visible: false });
              this.setState({ image: null });
            }}
          />
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
