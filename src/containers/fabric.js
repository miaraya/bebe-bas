import React, { Component } from "react";
import { Link } from "react-router";
import "antd/dist/antd.css";
import "../css/css.css";
import { Spin, Descriptions, PageHeader, Tag, Typography, Divider } from "antd";
import Top from "../components/top";

import Logo from "../assets/logo_small.png";
import _ from "lodash";

import { api, thumbnail_url, image_url, location_url } from "./constants";
import { Layout, Modal, Row, Col } from "antd";
import { Rate } from "antd";
import AuthService from "../AuthService";
import moment from "moment";

const Auth = new AuthService(null);

const { Content } = Layout;

class Fabric extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: true,
      image: "",
      visible: false,
      locations: [],
      dateFormat: "DD/MM/YY HH:mm a",
    };
  }
  componentWillMount = () => {
    let id = this.props.params.id;
    this.checkLanguage();
    this.getFabricData(id);
    this.getDictionary();
    //this.getStockData(id);
    //Auth.loggedIn() && this.getFabricStock(id);
    const profile = Auth.getProfile();
    this.setState({
      user: profile,
    });
  };

  checkLanguage = () => {
    localStorage.getItem("language")
      ? this.setState({ language: localStorage.getItem("language") })
      : this.setState({ language: "vietnamese" });
  };
  getDictionary = () => {
    fetch(api + "/dictionaries")
      .then((res) => res.json())
      .then((dictionary) => {
        this.setState({ dictionary });
        this.setState({ isLoading: false });
      });
  };
  /*
  getStockData = (id) => {
    fetch(api + "fabric_location_stocks?filter[where][unique_code]=" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((locations) => {
        this.setState({
          locations: _.filter(locations, (i) => i.quantity > 0 || i.extra > 0),
        });
      })
      .catch((error) => {});
  };
*/
  /*
  getFabricStock = id => {
    fetch(api + "report_fabric_stocks?filter[where][unique_code]=" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then(history => {
        this.setState({
          history: _.reverse(_.sortBy(history, i => i.cut_date_raw))
        });
      })
      .catch(error => {});
  };*/

  getFabricData = (unique_code) => {
    fetch(api + "fabrics/detail/" + unique_code)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((fabric) => {
        if (fabric) {
          this.setState({ fabric });
          let metadata = _(fabric.metadata)
            .groupBy((m) => m.metadata_id)
            .map((value, key) => ({
              value,
              key: value[0].metadata.name,
              id: value[0].metadata.id,
            }))
            .value();
          this.setState({ metadata });
          this.setState({ loading: false });
          this.setState({ error: false });
        } else {
          this.setState({ loading: false });
          this.setState({ error: true });
        }
      })
      .catch((error) => {
        this.setState({ loading: false });
        this.setState({ error: true });
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

  render() {
    const {
      loading,
      error,
      fabric,
      image,
      visible,
      dateFormat,
      metadata,
    } = this.state;

    if (loading) {
      return (
        <Content className="containerHome">
          <Spin size="large" />
        </Content>
      );
    } else if (error) {
      return (
        <div>
          <b>FABRIC {this.props.params.id} NOT FOUND :(</b>
        </div>
      );
    } else
      return (
        <Layout className="wrapper">
          <Top
            username={this.state.user.username}
            handleLanguage={this.handleLanguage}
            getWord={this.getWord}
            getLanguage={this.getLanguage}
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
            <a href="/">
              <img src={Logo} alt="Bebe Tailor" width="150px" />
            </a>
          </Row>
          <PageHeader
            title={fabric.unique_code}
            tags={
              fabric.total_stock > 0 &&
              fabric.total_stock <= 10 && <Tag color="orange">LOW STOCK</Tag>
            }
          ></PageHeader>

          <Content className="container">
            <Row type="flex" justify="center" align="top" gutter={40} span={24}>
              <img
                style={{ maxWidth: 300, alignSelf: "top" }}
                alt={fabric.unique_code}
                src={`${thumbnail_url}/${fabric.image}`}
                onClick={() => {
                  this.setState({
                    image: image_url + fabric.image,
                  });
                  this.setState({ visible: true });
                }}
              />
              <Col xs={24} sm={24} md={16} style={{ paddingTop: 16 }}>
                <Descriptions title={this.getWord("fabric-details")} column={2}>
                  <Descriptions.Item label={this.getWord("fabric-code")}>
                    <b>{fabric.unique_code}</b>
                  </Descriptions.Item>

                  <Descriptions.Item label={this.getWord("type")}>
                    {`${fabric.type.description} (${fabric.type.alias})`}
                  </Descriptions.Item>

                  <Descriptions.Item label={this.getWord("swatchbook")}>
                    <Link to={`/s/${fabric.swatchbook.unique_code}`}>
                      {fabric.swatchbook.unique_code}
                    </Link>
                  </Descriptions.Item>
                  <Descriptions.Item label={this.getWord("old-code")}>
                    {fabric.old_code}
                  </Descriptions.Item>
                  <Descriptions.Item label={this.getWord("supplier")}>
                    {fabric.supplier.name}
                  </Descriptions.Item>
                  <Descriptions.Item label={this.getWord("created")}>
                    {moment(fabric.creation_date).format(dateFormat)}
                  </Descriptions.Item>
                  <Descriptions.Item label={this.getWord("last-stock-update")}>
                    {moment(fabric.last_stock_update).format(dateFormat)}
                  </Descriptions.Item>

                  <Descriptions.Item label={this.getWord("total-stock")}>
                    {fabric.total_stock > 0 ? (
                      fabric.total_stock + "m"
                    ) : (
                      <span style={{ color: "red" }}>
                        {this.getWord("no-stock")}
                      </span>
                    )}
                  </Descriptions.Item>
                </Descriptions>
                <Divider />
                {/* METADATA */}
                {
                  <Descriptions title="Metadata">
                    {metadata.map((m) => {
                      console.log(metadata);
                      return (
                        <Descriptions.Item label={m.key} key={m.key}>
                          {m.value.map((v) =>
                            m.id !== 3 ? (
                              <Tag>{v.value.value}</Tag>
                            ) : (
                              <Rate
                                disabled
                                defaultValue={Number(v.value.value)}
                              />
                            )
                          )}
                        </Descriptions.Item>
                      );
                    })}
                  </Descriptions>
                }
                <Divider />
                {fabric.stock.length > 0 && (
                  <Descriptions
                    title={this.getWord("stock-fabric-location")}
                    column={2}
                  >
                    {fabric.stock.map((l, i) => (
                      <Descriptions.Item
                        key={i}
                        label={
                          <Link
                            disabled={!l.image}
                            style={{
                              borderColor: "transparent",
                              padding: 0,
                            }}
                            onClick={() => {
                              this.setState({
                                image: location_url + l.image,
                              });
                              this.setState({ visible: true });
                            }}
                          >
                            <span>{l.location}</span>
                          </Link>
                        }
                      >
                        {l.stock}m
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                )}
              </Col>
            </Row>
            {/*Auth.loggedIn() && (
              <span>
                <Divider />
                <Row>
                  <Col span={24}>
                    <Descriptions title={this.getWord("history")}>
                      <Descriptions.Item>
                        <Table
                          dataSource={history}
                          pagination={{
                            position: "bottom",
                            showSizeChanger: true,
                            pageSizeOptions: ["10", "20", "100"],
                          }}
                          rowKey="id"
                          size="small"
                        >
                          <Column
                            title={this.getWord("item")}
                            dataIndex="item"
                            key="item"
                            render={(item) => (
                              <Link to={`/i/${item}`}>{item}</Link>
                            )}
                          />
                          <Column
                            title={this.getWord("type")}
                            dataIndex="garment"
                            key="garment"
                          />

                          <Column
                            title={this.getWord("length")}
                            dataIndex="length"
                            key="length"
                          />
                          <Column
                            title={this.getWord("location")}
                            dataIndex="location"
                            key="location"
                          />
                          <Column
                            title={this.getWord("cutter")}
                            dataIndex="staff"
                            key="staff"
                          />
                          <Column
                            title={this.getWord("date")}
                            dataIndex="cut_date"
                            key="cut_date"
                          />
                        </Table>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                </Row>
                            </span> 
            )} */}
          </Content>
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
              style={{ width: "100%" }}
              alt="Bebe Tailor"
              src={image}
              onClick={() => {
                this.setState({ visible: false });
                this.setState({ image: null });
              }}
            />
          </Modal>
        </Layout>
      );
  }
}

export default Fabric;
