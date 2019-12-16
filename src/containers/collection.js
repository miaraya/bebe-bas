import React, { Component } from "react";
import { Link } from "react-router";
import "antd/dist/antd.css";
import "../css/css.css";
import { Spin, Row, Col, Statistic, Descriptions, Typography } from "antd";
import { Divider } from "antd";

import Logo from "../assets/logo_small.png";

import { api } from "./constants";
import { Card } from "antd";
import { Layout, Modal } from "antd";
import { Rate } from "antd";
import _ from "lodash";
import { Checkbox } from "antd";
import { Collapse } from "antd";
const { Panel } = Collapse;

const { Content, Footer } = Layout;

class Collection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: true,
      image: "",
      visible: false,
      locations: [],
      colorFilter: [],
      typeFilter: [],
      isLoading: false
    };
  }
  componentWillMount = () => {
    let id = this.props.params.id;
    this.getFabrics(id);
  };

  formatDecimals = figure => {
    return figure && figure.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  getFabrics = id => {
    fetch(api + "web_collections?filter[where][collection]=" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then(fabrics => {
        this.setState({
          fabrics: _.sortBy(fabrics, f => f.price_band).reverse()
        });

        //GET COLORS
        let colors = _(fabrics)
          .groupBy(c => c.color_id)
          .map((value, key) => ({
            label: `${value[0].color} (${value.length})`,
            value: value[0].color_id,
            color_id: value[0].color_id,
            quantity: value.length
          }))
          .value();
        this.setState({ colors: _.sortBy(colors, c => c.quantity).reverse() });
        console.log(colors);

        //GET TYPES
        let types = _(fabrics)
          .groupBy(c => c.type_id)
          .map((value, key) => ({
            label: `${value[0].type} (${value.length})`,
            value: value[0].type_id,
            type_id: value[0].type_id,
            quantity: value.length
          }))
          .value();
        this.setState({ types: _.sortBy(types, c => c.quantity).reverse() });
        console.log(types);

        this.setState({
          fabricsUnfiltered: _.sortBy(fabrics, f => f.unique_code)
        });
        this.setState({ loading: false });
        this.setState({ error: false });
      })
      .catch(error => {
        console.log(error);
        this.setState({ loading: false });

        this.setState({ error: true });
      });
  };

  render() {
    const handleChangeColor = async values => {
      this.setState({ isLoading: true });

      let filter = [];
      _.forEach(values, i => filter.push({ color_id: i }));
      this.setState({ colorFilter: filter });

      await setFilters(filter, this.state.typeFilter);
    };
    const handleChangeType = async values => {
      this.setState({ isLoading: true });

      let filter = [];
      _.forEach(values, i => filter.push({ type_id: i }));

      this.setState({ typeFilter: filter });

      await setFilters(this.state.colorFilter, filter);
    };

    const setFilters = async (colorFilter, typeFilter) => {
      let toFilter = [];
      toFilter = fabricsUnfiltered
        .filter(e =>
          _.find(colorFilter.length > 0 ? colorFilter : colors, {
            color_id: e.color_id
          })
        )
        .filter(e =>
          _.find(typeFilter.length > 0 ? typeFilter : types, {
            type_id: e.type_id
          })
        );

      toFilter.length > 0
        ? this.setState({ fabrics: toFilter })
        : this.setState({ fabrics: fabricsUnfiltered });

      this.setState(
        { fabrics: _.sortBy(toFilter, s => s.price_band).reverse() },
        () => this.setState({ isLoading: false })
      );
    };

    const {
      loading,
      error,
      fabrics,
      image,
      visible,
      fabricsUnfiltered,
      colors,
      types,
      isLoading
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
          COLLECTION <b>{this.props.params.id.toUpperCase()}</b> NOT FOUND :(
        </div>
      );
    } else
      return (
        <Layout className="swrapper">
          <Row
            type="flex"
            justify="center"
            align="middle"
            gutter={16}
            span={24}
            style={{
              marginBottom: 20
            }}
          >
            <img src={Logo} alt="Bebe Tailor" width="150px" />
          </Row>
          <Content className="container">
            <Row
              type="flex"
              justify="center"
              align="middle"
              gutter={16}
              span={24}
            >
              <Col xs={24} sm={24} md={4} justify="center">
                <Statistic
                  title="Collection"
                  value={this.props.params.id.toUpperCase()}
                  style={{
                    textAlign: "center"
                  }}
                />
              </Col>

              <Col xs={24} sm={24} md={4} justify="center">
                <Statistic
                  title="Number of Fabrics"
                  value={fabrics && fabrics.length}
                  style={{
                    textAlign: "center"
                  }}
                />
              </Col>
            </Row>

            <Divider />

            {/* FILTERS */}

            {isLoading && (
              <Row type="flex" justify="center">
                <Spin />
              </Row>
            )}

            <Row type="flex" justify="center" align="top">
              <Col
                type="flex"
                justify="center"
                align="center"
                gutter={16}
                span={8}
              >
                <Typography style={{ marginBottom: 20 }}>
                  Type Filter
                </Typography>
                <Checkbox.Group options={types} onChange={handleChangeType} />
              </Col>
              <Col
                type="flex"
                justify="center"
                align="center"
                gutter={16}
                span={8}
              >
                <Typography style={{ marginBottom: 20 }}>
                  Color Filter
                </Typography>
                <Checkbox.Group options={colors} onChange={handleChangeColor}>
                  {colors.map(c => (
                    <Checkbox key={c.value} value={c.value}>
                      {c.label}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </Col>
            </Row>

            <Divider
              style={{
                backgroundColor: "transparent"
              }}
            />
            <Row
              type="flex"
              justify="center"
              align="middle"
              gutter={16}
              span={24}
            >
              {fabrics ? (
                fabrics.map(fabric => (
                  <Card
                    size="small"
                    style={{
                      margin: 15,
                      maxWidth: 280,
                      alignSelf: "flex-start"
                    }}
                    bordered={false}
                    key={fabric.unique_code}
                    title={
                      <div
                        style={{
                          display: "flex",
                          flex: 1,
                          justifyContent: "space-between",
                          alignContent: "center"
                        }}
                      >
                        {" "}
                        <h2>
                          <Link
                            to={`/f/${fabric.unique_code}`}
                            style={{
                              fontWeight: "normal",
                              color: "black"
                            }}
                          >
                            {fabric.unique_code}
                          </Link>
                        </h2>
                        {fabric.price_band > 0 && (
                          <Rate
                            style={{
                              fontSize: 14
                            }}
                            disabled
                            defaultValue={Number(fabric.price_band)}
                          />
                        )}
                      </div>
                    }
                    cover={
                      <img
                        style={{ height: 200, overflow: "hidden" }}
                        alt={fabric.unique_code}
                        src={fabric.thumbnail_url}
                        onClick={() => {
                          this.setState({ image: fabric.image_url });
                          this.setState({ visible: true });
                        }}
                      />
                    }
                  >
                    <Descriptions size="small" column={1}>
                      {/*<Descriptions.Item label="Price">{`$${this.formatDecimals(fabric.price)} VND`}</Descriptions.Item>*/}
                      <Descriptions.Item label="Swatchbook">
                        <Link to={`/s/${fabric.swatchbook}`}>
                          {fabric.swatchbook}
                        </Link>
                      </Descriptions.Item>
                      <Descriptions.Item label="Old Code">
                        {fabric.old_code}
                      </Descriptions.Item>

                      <Descriptions.Item label="Color">
                        {fabric.color}
                      </Descriptions.Item>
                      <Descriptions.Item label="Type">{`${fabric.type}`}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                ))
              ) : (
                <Spin size="medium" />
              )}
            </Row>
          </Content>
          <Footer
            style={{
              textAlign: "center",
              flex: 1
            }}
          >
            Bebe Tailor {new Date().getFullYear().toString()}, Hoi An, Vietnam.
          </Footer>

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
                width: "100%"
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
      );
  }
}

export default Collection;
