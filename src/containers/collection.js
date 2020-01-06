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
  BackTop
} from "antd";

import Logo from "../assets/logo_small.png";

import { api } from "./constants";
import { Card } from "antd";
import { Layout, Modal } from "antd";
import { Rate } from "antd";
import _ from "lodash";
import { Checkbox } from "antd";
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
      filter: []
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
    const renderContent = (column = 2) => (
      <Row>
        <Descriptions size="small" column={column}>
          <Descriptions.Item label="Number of Fabrics">
            {fabrics && fabrics.length}
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
      /*
      if (filter.length) {
        toFilter = _.filter(fabricsUnfiltered, e =>
          _.find(e.metadata, i => _.find(filter, x => x === i.value_id))
        );

        this.setState(
          { fabrics: _.sortBy(toFilter, s => s.price_band).reverse() },
          () => this.setState({ isLoading: false })
        );
      } else {
        this.setState({ fabrics: fabricsUnfiltered });
      }*/
    };

    const {
      loading,
      error,
      fabrics,
      image,
      visible,
      fabricsUnfiltered,
      filterMetadata
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

            <List
              loading={loading}
              split={true}
              loadMore={true}
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 3,
                lg: 4,
                xl: 5,
                xxl: 5
              }}
              pagination={{
                showSizeChanger: true,
                pageSizeOptions: ["10", "50", "100", "1000"],
                position: "both"
              }}
              dataSource={fabrics}
              renderItem={fabric => (
                <List.Item>
                  <Card
                    loading={loading}
                    bodyStyle={{ padding: 10 }}
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
                        <Link
                          to={`/f/${fabric.unique_code}`}
                          style={{
                            fontWeight: "normal",
                            color: "black"
                          }}
                        >
                          {fabric.unique_code}
                        </Link>
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
                        style={{
                          maxHeight: 200,
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
                        <Link to={`/s/${fabric.swatchbook}`}>
                          {fabric.swatchbook}
                        </Link>
                      </Descriptions.Item>
                      <Descriptions.Item label="Old Code">
                        {fabric.old_code}
                      </Descriptions.Item>

                      <Descriptions.Item label="Type">{`${fabric.type}`}</Descriptions.Item>

                      {filterMetadata.map(f => (
                        <Descriptions.Item label={f.metadata} key={f.metadata}>
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
