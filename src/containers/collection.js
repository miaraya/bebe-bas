import React, { Component } from "react";
import { Link } from "react-router";
import "antd/dist/antd.css";
import "../css/css.css";

import {
  Row,
  Col,
  Descriptions,
  List,
  Tag,
  Form,
  Collapse,
  PageHeader,
  Icon,
  BackTop,
  Typography,
  Button,
  Tooltip,
  message
} from "antd";

import Logo from "../assets/logo_small.png";

import { api } from "./constants";
import { Card } from "antd";
import { Layout, Modal } from "antd";
import { Rate } from "antd";
import _ from "lodash";
import { Checkbox } from "antd";
import AuthService from "../AuthService";

const Auth = new AuthService(null);
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
      isLoading: false,
      fabrics: [],
      colors: [],
      types: [],
      filterMetadata: [],
      filter: [],
      selectedFabrics: []
    };
  }
  componentWillMount = async () => {
    let id = this.props.params.id;
    this.setState({ loading: true });

    this.getFabrics(id);

    this.setState({ error: false });
  };

  getFabrics = async id => {
    let request = await fetch(
      api + "web_collections?filter[where][collection]=" + id
    );
    let fabrics = await request.json();

    for (const f of fabrics) {
      f.metadata &&
        f.metadata.forEach(f =>
          this.setState(prevState => ({
            filterMetadata: [...prevState.filterMetadata, f]
          }))
        );
    }

    //METADATA
    let filterMetadata = _(this.state.filterMetadata)
      .groupBy(c => c.metadata)
      .map((value, key) => ({
        metadata: value[0].metadata,
        key: value[0].value,
        values: _(value)
          .groupBy(c => c.value)
          .map((value, key) => ({
            value: value[0].value_id,
            data: value,
            label: `${key} (${value.length})`,

            quantity: value.length
          }))
          .sortBy(fabrics, f => f.label)
          .value()
      }))
      .value();

    this.setState({
      filterMetadata: _.sortBy(filterMetadata, f => f.metadata)
    });
    this.setState({ loading: false });

    this.setState({ fabrics: _.sortBy(fabrics, f => f.price_band).reverse() });
    this.setState({ fabricsUnfiltered: fabrics });
  };

  render() {
    const handleCopy = e => {
      this.textArea.select();
      document.execCommand("copy");
      // This is just personal preference.
      // I prefer to not show the the whole text area selected.
      //e.target.focus();
      message.info("Selected fabric list copied!");

      //this.setState({ copySuccess: 'Copied!' });
    };
    const renderContent = (column = 1) => (
      <Row>
        <Descriptions size="small" column={column}>
          <Descriptions.Item label="Number of Fabrics">
            {fabrics && fabrics.length}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              selectedFabrics.length > 0
                ? `Selected Fabrics (${selectedFabrics.length})`
                : `Selected Fabrics`
            }
          >
            <span>
              {selectedFabrics.map(f => (
                <Tag key={f}>{f}</Tag>
              ))}
              {selectedFabrics.length > 0 && (
                <Tooltip title="Copy">
                  <Button
                    type="solid"
                    shape="circle"
                    icon="copy"
                    onClick={handleCopy}
                  />
                </Tooltip>
              )}
            </span>
          </Descriptions.Item>
        </Descriptions>
        <Collapse
          bordered={false}
          expandIcon={({ isActive }) => (
            <Icon type="caret-right" rotate={isActive ? 90 : 0} />
          )}
        >
          <Panel header="Filters" key="1" style={customPanelStyle}>
            <Form onSubmit={this.handleSubmit}>
              <Checkbox.Group onChange={handleChange}>
                {filterMetadata &&
                  filterMetadata.map((x, j) => (
                    <Col key={j} xs={24} sm={12}>
                      <Form.Item label={x.metadata} key={x.metadata}>
                        {x.values &&
                          x.values.map(v => (
                            <Col xs={12} sm={12} md={8} key={v.label}>
                              <Checkbox value={v.value}>{v.label}</Checkbox>
                            </Col>
                          ))}
                      </Form.Item>
                    </Col>
                  ))}
              </Checkbox.Group>
            </Form>
          </Panel>
        </Collapse>
      </Row>
    );
    const handleChange = async values => {
      this.setState({ filter: values });

      await setFilters(values);
    };

    const setFilters = async filter => {
      if (filter.length) {
        let aux = fabricsUnfiltered;
        filter.forEach(
          x =>
            (aux = _.filter(aux, e =>
              _.find(e.metadata, i => i.value_id === x)
            ))
        );
        this.setState(
          { fabrics: _.sortBy(aux, s => s.price_band).reverse() },
          () => this.setState({ isLoading: false })
        );
      } else {
        this.setState({ fabrics: fabricsUnfiltered });
      }
    };

    const handleCheck = e => {
      let value = e.target.value;
      let checked = e.target.checked;
      console.log(value);

      if (checked) {
        !_.includes(this.state.selectedFabrics, value) &&
          this.setState(prevState => ({
            selectedFabrics: [...prevState.selectedFabrics, value]
          }));
      } else {
        this.setState(prevState => ({
          selectedFabrics: _.filter(prevState.selectedFabrics, x => x !== value)
        }));
      }
      console.log(this.state.selectedFabrics);
    };

    const {
      loading,
      error,
      fabrics,
      image,
      visible,
      fabricsUnfiltered,
      filterMetadata,
      selectedFabrics
    } = this.state;

    const customPanelStyle = {
      background: "#f7f7f7",
      borderRadius: 4,
      marginBottom: 24,
      border: 0,
      overflow: "hidden"
    };

    if (error) {
      return (
        <div>
          COLLECTION <b>{this.props.params.id.toUpperCase()}</b> NOT FOUND :(
        </div>
      );
    } else
      return (
        <Layout className="swrapper">
          <BackTop />
          <Content className="container">
            <Row
              type="flex"
              justify="center"
              align="middle"
              style={{
                marginBottom: 20
              }}
            >
              <img src={Logo} alt="Bebe Tailor" width="150px" />
            </Row>

            <PageHeader
              ghost={true}
              style={{
                border: "1px solid rgb(235, 237, 240)"
              }}
              title="Collection"
              subTitle={this.props.params.id.toUpperCase()}
            >
              <Content>{renderContent()}</Content>
            </PageHeader>
            <Checkbox.Group style={{ width: "100%" }}>
              <List
                loading={loading}
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 4,
                  lg: 4,
                  xl: 4,
                  xxl: 4
                }}
                pagination={{
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "50", "100", "1000"],
                  position: "both",
                  showTitle: true,
                  onChange: () => this.forceUpdate(),
                  style: { marginBottom: 10 }
                }}
                dataSource={fabrics}
                renderItem={fabric => (
                  <List.Item>
                    <Card
                      loading={loading}
                      bodyStyle={{ padding: 10 }}
                      headStyle={{
                        paddingLeft: 10,
                        paddingRight: 10,
                        width: "100%"
                      }}
                      bordered={true}
                      key={fabric.unique_code}
                      title={
                        <span
                          style={{
                            display: "flex",
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center"
                          }}
                        >
                          <Checkbox
                            value={fabric.unique_code}
                            onChange={e => handleCheck(e)}
                          >
                            {Auth.loggedIn() ? (
                              <Link
                                to={`/f/${fabric.unique_code}`}
                                style={{ color: "black" }}
                              >
                                {fabric.swatchbook}
                              </Link>
                            ) : (
                              <span>{fabric.unique_code}</span>
                            )}
                          </Checkbox>
                          {fabric.price_band > 0 && (
                            <Rate
                              style={{
                                width: "100%",
                                textAlign: "right"
                              }}
                              disabled
                              defaultValue={Number(fabric.price_band)}
                            />
                          )}
                        </span>
                      }
                      cover={
                        <img
                          style={{
                            maxHeight: 180,
                            masoverflow: "hidden"
                          }}
                          alt={fabric.unique_code}
                          src={fabric.thumbnail_url}
                          onClick={() => {
                            this.setState({ image: fabric.image_url });
                            this.setState({ visible: true });
                          }}
                        />
                      }
                      actions={[]}
                    >
                      <Descriptions size="small" column={1}>
                        <Descriptions.Item label="Swatchbook">
                          {Auth.loggedIn() ? (
                            <Link to={`/s/${fabric.swatchbook}`}>
                              {fabric.swatchbook}
                            </Link>
                          ) : (
                            <Typography> {fabric.swatchbook}</Typography>
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Old Code">
                          {fabric.old_code}
                        </Descriptions.Item>

                        <Descriptions.Item label="Type">{`${fabric.type}`}</Descriptions.Item>

                        {filterMetadata.map(f => (
                          <Descriptions.Item
                            label={f.metadata}
                            key={f.metadata}
                          >
                            {fabric.metadata.map(
                              m =>
                                f.metadata === m.metadata && (
                                  <Tag key={m.id}>{m.value}</Tag>
                                )
                            )}
                          </Descriptions.Item>
                        ))}
                      </Descriptions>
                    </Card>
                  </List.Item>
                )}
              />
            </Checkbox.Group>
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
          <form>
            <input
              style={{ color: "white" }}
              ref={textarea => (this.textArea = textarea)}
              value={_.map(selectedFabrics).join(", ")}
            />
          </form>
        </Layout>
      );
  }
}

export default Collection;
