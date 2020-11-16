import React, { Component } from "react";
import "antd/dist/antd.css";
import "../css/css.css";
import { Layout, Tabs, Row, Col, Modal, Typography } from "antd";
import { Statistic, Steps, Descriptions } from "antd";

import { Divider, Empty } from "antd";
import { Spin } from "antd";
import { Timeline, Icon } from "antd";

import _ from "lodash";
import { Link } from "react-router";

import Logo from "../assets/logo_small.png";
import { api } from "./constants";
import { Card } from "antd";
import Top from "../components/top";
import AuthService from "../AuthService";
import moment from "moment";
import {
  fabric_image,
  fabric_thumbnail,
  StaffList,
  item_image,
} from "../components";

const { Step } = Steps;

const Auth = new AuthService(null);

const { Meta } = Card;

const { Content, Footer } = Layout;
const TabPane = Tabs.TabPane;

class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: false,
      details: [],
      images: [],
      options: [],
      image: "",
      visible: false,
      fabrics: [],
      fittings: [],
      measurements: [],
      measurement_images: [],
    };
  }

  render() {
    //const { id } = this.props.params;
    const {
      order_customer,
      loading,
      error,
      images,
      image,
      visible,
      options,
      fabrics,
      fittings,
      measurements,
      measurement_images,
      language,
      status_id,
    } = this.state;

    let dateFormat = "MMM DD,YY hh:mm A";
    let dateFormatViet = "DD/MM/YY hh:mm A";

    if (loading) {
      return (
        <Content className="containerHome">
          <Spin size="large" />
        </Content>
      );
    } else if (error || !order_customer) {
      return (
        <div>
          ITEM <b>{this.props.params.id.toUpperCase()}</b> NOT FOUND :(
        </div>
      );
    } else
      return (
        <Layout className="wrapper">
          <Top
            username={this.state.user.username}
            handleLanguage={this.handleLanguage}
            getLanguage={this.getLanguage}
            getWord={this.getWord}
          />

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

          <Row
            type="flex"
            justify="center"
            align="middle"
            gutter={16}
            span={24}
          >
            <Col xs={24} sm={24} md={4} justify="center">
              <Statistic
                title={this.getWord("item-number")}
                prefix="#"
                value={`${order_customer.order_id}-${order_customer.index}`}
                groupSeparator=""
                style={{
                  textAlign: "center",
                }}
              />
            </Col>
            <Col xs={24} sm={24} md={4} justify="center">
              <Statistic
                title={this.getWord("item")}
                value={order_customer.garment.alias}
                style={{
                  textAlign: "center",
                }}
              />
            </Col>
            <Col xs={24} sm={24} md={4} justify="center">
              <Statistic
                title={this.getWord("item-status")}
                value={order_customer.status}
                style={{
                  textAlign: "center",
                }}
              />
            </Col>

            <Col
              justify="center"
              xs={12}
              sm={16}
              md={18}
              style={{
                margin: 20,
              }}
            >
              <Steps direction="horizontal" size="small" current={status_id}>
                <Step title="Paid" description="" />
                <Step title="In Progress" description="" />
                <Step title="Finished" description="" />
              </Steps>
            </Col>
          </Row>
          <Content className="container">
            <Descriptions title={this.getWord("order-details")}>
              <Descriptions.Item label={this.getWord("order")}>
                {order_customer && (
                  <Link to={`/o/${order_customer.order_id}`}>
                    {order_customer.order_id}
                  </Link>
                )}
              </Descriptions.Item>
              <Descriptions.Item label={this.getWord("order-status")}>
                {order_customer.order.status}
              </Descriptions.Item>

              <Descriptions.Item label={this.getWord("customer-name")}>
                {`${order_customer.order.customer_first_name} ${order_customer.order.customer_last_name}`}
              </Descriptions.Item>
              <Descriptions.Item label={this.getWord("email")}>
                {order_customer.order.customer_email &&
                  order_customer.order.customer_email.toLowerCase()}
              </Descriptions.Item>
              <Descriptions.Item label={this.getWord("staff")}>
                <StaffList record={order_customer.order} />
              </Descriptions.Item>
              <Descriptions.Item label={this.getWord("date")}>
                {moment(order_customer.order.timestamp).format(dateFormat)}
              </Descriptions.Item>

              <Descriptions.Item label={this.getWord("hotel")}>
                {order_customer.order.hotel_ids.length
                  ? order_customer.order.hotel_ids.map(
                      (h) =>
                        h.active && (
                          <span
                            key={h.id}
                          >{`${h.hotel.name}, room: ${h.room} `}</span>
                        )
                    )
                  : order_customer.order.store_id === 4
                  ? "On Line"
                  : "No Hotel"}
                {order_customer.hotel}
              </Descriptions.Item>

              {order_customer.order.store_id !== 4 && (
                <Descriptions.Item label={this.getWord("fitting-day")}>
                  {order_customer.order.fitting !== null
                    ? moment(order_customer.order.fitting).format(
                        language === "vietnamese" ? dateFormatViet : dateFormat
                      )
                    : "-"}
                </Descriptions.Item>
              )}

              {order_customer.order.store_id !== 4 && (
                <Descriptions.Item label={this.getWord("last-day")}>
                  {order_customer.order.last_day !== null
                    ? moment(order_customer.order.last_day)
                        .utc()
                        .format(
                          language === "vietnamese" ? "DD/MM/YY" : "MMM DD,YY"
                        )
                    : "-"}
                </Descriptions.Item>
              )}
            </Descriptions>
            <Divider />
            <Descriptions title={this.getWord("item-details")}></Descriptions>

            <Row>
              <Tabs defaultActiveKey="1" tabPosition="top">
                <TabPane tab={<h3> {this.getWord("items")}</h3>} key="1">
                  <Row gutter={40}>
                    <Col span={8}>
                      <Descriptions
                        title={this.getWord("options")}
                        column={1}
                        bordered="true"
                        size="small"
                      >
                        {options.length > 0 ? (
                          _.chain(options)
                            .orderBy((x) => x.option.order, "asc")
                            .value()
                            .map((o, i) => (
                              <Descriptions.Item
                                key={o.id}
                                label={
                                  language === "vietnamese"
                                    ? o.option.vietnamese
                                      ? `${i + 1}. ${o.option.vietnamese}`
                                      : `${i + 1}. ${o.option.name}`
                                    : `${i + 1}. ${o.option.name}`
                                }
                              >
                                {language === "vietnamese"
                                  ? o.value.vietnamese
                                    ? o.value.vietnamese
                                    : o.value.name
                                  : o.value.name}
                              </Descriptions.Item>
                            ))
                        ) : (
                          <Empty />
                        )}
                      </Descriptions>
                      <Divider />
                      <Descriptions title={this.getWord("notes")} column={1}>
                        <Descriptions.Item
                          label={this.getWord("notes")}
                          layout="vertical"
                        >
                          {order_customer.notes ? (
                            <Typography>{order_customer.notes}</Typography>
                          ) : (
                            this.getWord("no-notes")
                          )}
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={8}>
                      <Descriptions
                        title={this.getWord("fabric")}
                        column={1}
                        bordered={false}
                      >
                        {fabrics.length > 0 &&
                          fabrics.map((f) => (
                            <Descriptions.Item key={f.id}>
                              <Card
                                size={"small"}
                                key={f.id}
                                hoverable="hoverable"
                                cover={
                                  <img
                                    onClick={() => {
                                      this.setState({
                                        image: fabric_image + f.fabric.image,
                                      });
                                      this.setState({ visible: true });
                                    }}
                                    style={{ height: 150, overflow: "hidden" }}
                                    alt={f.fabric.unique_code}
                                    src={fabric_thumbnail + f.fabric.image}
                                  />
                                }
                              >
                                <Meta
                                  title={
                                    <Link to={`/f/${f.fabric.unique_code}`}>
                                      {f.fabric.unique_code}
                                    </Link>
                                  }
                                  description={
                                    f.notes !== null
                                      ? f.notes
                                      : this.getWord("no-notes")
                                  }
                                />
                              </Card>
                            </Descriptions.Item>
                          ))}
                      </Descriptions>
                    </Col>
                    <Col span={8}>
                      <Descriptions title={this.getWord("image")} column={1}>
                        {images.length > 0 ? (
                          images.map((i) => (
                            <Descriptions.Item key={i.id}>
                              <Card
                                size={"small"}
                                key={i.id}
                                hoverable="hoverable"
                                cover={
                                  <img
                                    alt="Order "
                                    onClick={() => {
                                      this.setState({
                                        image: item_image + i.image,
                                      });
                                      this.setState({ visible: true });
                                    }}
                                    src={item_image + i.image}
                                  />
                                }
                              >
                                <Meta
                                  description={
                                    i.notes !== null
                                      ? i.notes
                                      : this.getWord("no-notes")
                                  }
                                />
                              </Card>
                            </Descriptions.Item>
                          ))
                        ) : (
                          <Descriptions.Item>
                            <Empty description={this.getWord("no-images")} />
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tab={<h3> {this.getWord("measurements")}</h3>} key="3">
                  <Row gutter={40}>
                    <Col span={16}>
                      <Descriptions
                        title={this.getWord("values")}
                        column={2}
                        bordered="true"
                        size="small"
                      >
                        {measurements.length > 0 ? (
                          _.chain(measurements)
                            .filter(
                              (x) =>
                                x.sub_customer_id === order_customer.customer_id
                            )
                            .orderBy((x) => x.measurement.order, "asc")
                            .value()
                            .map((o, i) => (
                              <Descriptions.Item
                                key={o.id}
                                label={
                                  language === "vietnamese"
                                    ? `${i + 1}. ${o.measurement.type_viet}:`
                                    : `${i + 1}. ${o.measurement.type_eng}:`
                                }
                              >
                                <Typography
                                  style={{ textAlign: "end" }}
                                >{` ${o.value}cm`}</Typography>
                              </Descriptions.Item>
                            ))
                        ) : (
                          <Empty />
                        )}
                      </Descriptions>
                      <Divider />
                      <Descriptions title={this.getWord("notes")} column={1}>
                        <Descriptions.Item>
                          {measurements.length > 0 && measurements[0].note
                            ? measurements[0].note
                            : this.getWord("no-notes")}
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={8}>
                      <Descriptions title={this.getWord("image")} column={1}>
                        {measurement_images.length > 0 ? (
                          _.filter(
                            measurement_images,
                            (x) =>
                              x.sub_customer_id === order_customer.customer_id
                          ).map((o) => (
                            <Descriptions.Item>
                              <Card
                                title={o.unique_code}
                                size={"small"}
                                key={o.id}
                                hoverable="hoverable"
                                cover={
                                  <img
                                    onClick={() => {
                                      this.setState({
                                        image: item_image + o.image,
                                      });
                                      this.setState({ visible: true });
                                    }}
                                    alt={o.unique_code}
                                    src={item_image + o.image}
                                  />
                                }
                              >
                                <Meta
                                  description={
                                    o.notes ? o.notes : this.getWord("no-notes")
                                  }
                                />
                              </Card>
                            </Descriptions.Item>
                          ))
                        ) : (
                          <Descriptions.Item>
                            <Empty description={this.getWord("no-images")} />
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tab={<h3> {this.getWord("fitting-")}</h3>} key="2">
                  <h3>{this.getWord("history")}</h3>
                  <Timeline
                    mode="left"
                    style={{
                      margin: 20,
                    }}
                  >
                    {fittings.length > 0 ? (
                      fittings.map((f) => (
                        <Timeline.Item
                          key={f.id}
                          color={
                            f.alteration === "yes"
                              ? "red"
                              : f.status === "done"
                              ? "green"
                              : ""
                          }
                          dot={f.status === "done" && <Icon type="check" />}
                        >
                          <Row>
                            <b>{f.creation_date}</b>
                          </Row>
                          <Row>
                            {this.getWord("alteration")}:
                            <b>
                              {this.state.language === "vietnamese"
                                ? f.fitting_alteration_viet
                                : f.alteration}
                            </b>
                          </Row>

                          {f.changes_needed !== "" && (
                            <Row>
                              {this.getWord("changes-needed")}:
                              <b>{f.changes_needed}</b>
                            </Row>
                          )}
                          <Row>
                            {this.getWord("status")}:
                            <b>
                              {this.state.language === "vietnamese"
                                ? f.fitting_status_viet
                                : f.status}
                            </b>
                          </Row>
                        </Timeline.Item>
                      ))
                    ) : (
                      <Empty description={this.getWord("no-history")} />
                    )}
                  </Timeline>
                </TabPane>
              </Tabs>
            </Row>
          </Content>
          <Modal
            visible={visible}
            footer={null}
            maskClosable={true}
            onCancel={() => this.setState({ visible: false })}
            width="100%"
          >
            <img
              style={{
                width: "100%",
              }}
              alt="Bebe Tailor"
              src={image}
              onClick={() => this.setState({ visible: false })}
            />
          </Modal>
          <Footer
            style={{
              textAlign: "center",
              flex: 1,
            }}
          >
            Bebe Tailor {new Date().getFullYear().toString()}, Hoi An, Vietnam.
          </Footer>
        </Layout>
      );
  }

  componentWillMount = () => {
    let id = this.props.params.id;
    this.checkLanguage();
    this.setState({ user: Auth.getProfile() });

    if (_.indexOf(id, "-") > 0) this.getItemId(id);
    else this.getData(id);
    this.getDictionary();
  };

  getItemId = (id) => {
    let aux = id.split("-");
    fetch(`${api}/items/${aux[0]}/${aux[1]}`)
      .then((res) => res.json())
      .then((order_customer) => {
        console.log(order_customer);

        this.setState({ order_customer: order_customer });
        this.setState({ options: order_customer.options });
        this.setState({ fabrics: order_customer.fabrics });
        this.setState({ images: order_customer.images });
        this.setState({
          measurements: order_customer.order.measurement_ids,
        });
        this.setState({
          measurement_images: order_customer.order.measurement_images,
        });

        this.setState({ loading: false });
      })
      .catch((error) => {
        this.setState({ loading: false });

        this.setState({ error: true });
      });
  };

  checkLanguage = () => {
    localStorage.getItem("language")
      ? this.setState({ language: localStorage.getItem("language") })
      : this.setState({ language: "vietnamese" });
  };

  getData = (id) => {
    //this.getOrderData(id);
    //this.getItemInfo(id);
    //this.getItemImages(id);
    //this.getItemOptions(id);
    //this.getItemFabrics(id);
    //this.getItemFittings(id);
    //this.getMeasurements(id);
    //this.getMeasurementImages(id);
  };

  getGarmentMeasurement = (id, measurements) => {
    fetch(api + "/garment_measurements?filter[where][garment_id]=" + id)
      .then((res) => res.json())
      .then((garment_measurement) => {
        console.log(garment_measurement, measurements);
        //this.setState({ dictionary });
      });
  };

  getDictionary = () => {
    fetch(api + "/dictionaries")
      .then((res) => res.json())
      .then((dictionary) => {
        this.setState({ dictionary });
      });
  };

  handleLanguage = () => {
    this.state.language === "vietnamese"
      ? this.setState({ language: "english" })
      : this.setState({ language: "vietnamese" });

    this.state.language === "vietnamese"
      ? localStorage.setItem("language", "english")
      : localStorage.setItem("language", "vietnamese");
  };
  getLanguage = () => {
    return this.state.language;
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

  getMeasurementImages = (id) => {
    fetch(
      api + "web_order_measurement_image_items?filter[where][item_id]=" + id
    )
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((json) => {
        var measurement_images = _(json)
          .groupBy((x) => x.customer_name)
          .map((value, key) => ({ measurements: value, name: key }))
          .value();
        measurement_images
          ? this.setState({
              measurement_images: measurement_images[0]
                ? measurement_images[0].measurements
                : [],
            })
          : this.setState({ measurement_images: [] });
      });
  };

  getItemFittings = (id) => {
    fetch(api + "web_order_fittings?filter[where][item_id]=" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((fittings) => {
        this.setState({ fittings });
      });
  };
  getItemFabrics = (id) => {
    fetch(api + "web_order_fabrics?filter[where][item_id]=" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((fabrics) => {
        this.setState({ fabrics });
      });
  };
  getItemOptions = (id) => {
    fetch(api + "web_order_options?filter[where][item_id]=" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((options) => {
        this.setState({ options });
      });
  };

  getItemImages = (id) => {
    fetch(api + "web_order_images?filter[where][item_id]=" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((images) => {
        this.setState({ images });
      });
  };

  getItemInfo = (id) => {
    fetch(api + "web_order_items?filter[where][item_id]=" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((details) => {
        details
          ? this.setState({ details: details[0] })
          : this.setState({ details: [] });

        switch (details[0].status_id) {
          case "done":
            this.setState({ status_id: 2 });
            break;
          case "pending":
            this.setState({ status_id: -1 });
            break;
          default:
            this.setState({ status_id: 1 });
        }
      })
      .catch((error) => this.setState({ error: true }));
  };

  getOrderData = (id) => {
    fetch(api + "web_item_customers/" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((order_customer) => {
        this.setState({ order_customer });
        this.setState({ error: false });
        this.setState({ loading: false });
      })
      .catch((error) => {
        this.setState({ loading: false });

        this.setState({ error: true });
      });
  };
}

export default Item;
