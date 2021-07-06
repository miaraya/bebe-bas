import React, { Component } from "react";
import { Link } from "react-router";
import "antd/dist/antd.css";
import "../css/css.css";
import Top from "../components/top";

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
  Button,
  Tooltip,
  message,
  Anchor,
  Switch,
  Card,
  Layout,
  Modal,
  Rate,
  Checkbox,
} from "antd";
//import { MetadataForm } from "../components/metadata";

import Logo from "../assets/logo_small.png";

import { api, thumbnail_url, image_url } from "./constants";
import _ from "lodash";
import AuthService from "../AuthService";
import { Fragment } from "react";

const Auth = new AuthService(null);
const { Panel } = Collapse;
const { Meta } = Card;
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
      fabrics: [],
      colors: [],
      types: [],
      filterMetadata: [],
      filter: [],
      selectedFabrics: [],
      affix: false,
      activeKey: 0,
      record: null,
      editFabricVisible: false,
      creatingLoading: false,
      page: 1,
      pageSize: 48,
      total: 0,
      collection: "",
      filterLoading: false,
      pageSizeOptions: ["12", "24", "48", "120"],
    };
  }

  componentWillMount = async () => {
    if (Auth.loggedIn()) {
      const profile = Auth.getProfile();
      this.setState({ user: profile });
    }

    let collection = this.props.params.id;
    this.setState({ collection });
    //this.setState({ loading: true });
    // this.getMetadata();
    this.getFabrics(collection, this.state.page, this.state.pageSize);
    this.setState({ error: false });
  };

  getFabrics = async (collection, page, pageSize, filter = []) => {
    let skip = 0;

    if (page * pageSize - pageSize > 0)
      skip = Math.abs(page * pageSize - pageSize);
    //console.log(skip, collection, page, pageSize, filter);

    let url = "";
    //console.log(filter);
    if (filter.length > 0) {
      url = `${api}collections/detailbyName/${collection}/${pageSize}/${skip}/[${filter}]`;
      //console.log(url);
    } else
      url = `${api}collections/detailbyName/${collection}/${pageSize}/${skip}`;

    let request = await fetch(url);
    let fabrics = await request.json();

    //console.log(fabrics);

    if (fabrics) {
      this.setState({ loading: false });
      this.setState({ filterLoading: false });

      if (filter.length > 0) {
        this.setState({ total: fabrics.filtered_total });
      } else this.setState({ total: fabrics.fabrics });

      this.setState({
        fabrics: _.sortBy(fabrics.fabric_ids, (f) => f.order).reverse(),
      });

      this.setState({ error: false });
    } else {
      this.setState({ error: true });
    }

    this.setState({
      filterMetadata: fabrics.metadata,
    });
  };

  checkMeta = (record) => {
    let meta = this.state.metadata;
    record.metadata &&
      record.metadata.forEach(
        (r) =>
          meta &&
          meta.forEach(
            (m) =>
              m.meta &&
              m.meta.forEach((m) => {
                if (r.value_id === m.id) {
                  m.checked = true;
                  m.fabric_metadata_id = r.id;
                }
              })
          )
      );
    return record;
  };
  editFabric = async (record) => {
    this.setState({ image: null });
    this.setState({ creatingLoading: false });

    let aux = this.checkMeta(record);
    this.setState({ record: aux });
    //const { form } = this.editFabricForm.props;
    //form.resetFields();
    //this.clear();
    this.setState({ editFabricVisible: true });
  };
  editFabricFormRef = (editFabricForm) => {
    this.editFabricForm = editFabricForm;
  };

  resetMetadata = () => {
    //this.setState({ metadata: this.state.metadataClear });
    //this.forceUpdate();
    /*fetch(api + "web_metadata")
      .then(res => res.json())
      .then(metadata => {
        this.setState({ metadata: _.sortBy(metadata, m => m.value) });
        this.setState({ metadataClear: _.sortBy(metadata, m => m.value) });
      });*/
  };
  getMetadata = () => {
    fetch(api + "web_metadata")
      .then((res) => res.json())
      .then((metadata) => {
        //console.log(metadata);
        this.setState({ metadata: _.sortBy(metadata, (m) => m.value) });
        this.setState({ metadataClear: _.sortBy(metadata, (m) => m.value) });
      });
  };

  render() {
    const handleCopy = (el) => {
      // resolve the element
      el = typeof el === "string" ? document.querySelector(el) : el;

      // handle iOS as a special case
      if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
        // save current contentEditable/readOnly status
        var editable = el.contentEditable;
        var readOnly = el.readOnly;

        // convert to editable with readonly to stop iOS keyboard opening
        el.contentEditable = true;
        el.readOnly = true;

        // create a selectable range
        var range = document.createRange();
        range.selectNodeContents(el);

        // select the range
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        el.setSelectionRange(0, 999999);

        // restore contentEditable/readOnly to original state
        el.contentEditable = editable;
        el.readOnly = readOnly;
      } else {
        el.select();
      }

      // execute copy command
      document.execCommand("copy");
      message.info("Selected fabric list copied!");
    };
    const renderContent = (column = 1) => (
      <Row>
        <Descriptions size="small" column={column}>
          <Descriptions.Item label="Number of Fabrics">
            {total}
          </Descriptions.Item>
          {selectedFabrics.length && (
            <Descriptions.Item
              label={
                selectedFabrics.length > 0
                  ? `Selected Fabrics (${selectedFabrics.length})`
                  : `Selected Fabrics`
              }
            >
              <span>
                {selectedFabrics.map((f) => (
                  <Tag key={f}>{f}</Tag>
                ))}
                {selectedFabrics.length > 0 && (
                  <Tooltip title="Copy">
                    <Button
                      type="solid"
                      shape="circle"
                      icon="copy"
                      onClick={() => {
                        handleCopy(".toCopy");
                      }}
                    />
                  </Tooltip>
                )}
              </span>
            </Descriptions.Item>
          )}
        </Descriptions>

        <Collapse
          bordered={false}
          expandIcon={({ isActive }) => (
            <Icon type="caret-right" rotate={isActive ? 90 : 0} />
          )}
        >
          <Panel header="Filters" key="1" style={customPanelStyle}>
            <Form>
              <Checkbox.Group
                onChange={handleChange}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                {filterMetadata &&
                  filterMetadata.map((x, j) => {
                    return (
                      <Form.Item label={x.name.toString()} key={x.id}>
                        {x.metadata.map((v, j) => {
                          return (
                            <Col key={j} xs={x.metadata_id === 2 ? 12 : 24}>
                              <Checkbox value={v.value_id}>
                                {v.metadata_id === 3 ? (
                                  <span>
                                    <Rate
                                      key={v.id}
                                      disabled
                                      defaultValue={Number(v.value)}
                                    />
                                    {` (${v.count})`}
                                  </span>
                                ) : (
                                  `${v.value} (${v.count})`
                                )}
                              </Checkbox>
                            </Col>
                          );
                        })}
                      </Form.Item>
                    );
                  })}
              </Checkbox.Group>
              <Form.Item style={{ textAlign: "end" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => handleClear()}
                  //loading={this.state.filterLoading}
                >
                  Clear
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => handleFilter()}
                  loading={this.state.filterLoading}
                >
                  Search
                </Button>
              </Form.Item>
            </Form>
          </Panel>
        </Collapse>
      </Row>
    );
    const handleChange = async (values) => {
      //console.log(values);
      this.setState({ filter: values });
      //await setFilters(values);
    };

    const handleClear = () => {
      this.setState({
        filter: this.state.filter.splice(0, this.state.filter.length),
      });
      console.log(this.state.filter);
    };

    const handleFilter = async () => {
      //console.log(this.state.filter);
      this.setState({ loading: true });
      this.setState({ filterLoading: true });
      this.getFabrics(
        this.state.collection,
        1,
        this.state.pageSize,
        this.state.filter
      );

      //await setFilters(this.state.filter);
    };
    /*
    const setFilters = async (filter) => {
      console.log(filter);
      if (filter.length) {
        let aux = fabricsUnfiltered;
        console.log(fabricsUnfiltered);
        filter.forEach((x) => {
          console.log(x);
          aux = _.filter(aux, (e) =>
            _.find(e.fabric.metadata, (i) => i.value_id === x)
          );
        });
        this.setState(
          { fabrics: _.sortBy(aux, (s) => s.price_band).reverse() },
          () => this.setState({ isLoading: false })
        );
      } else {
        this.setState({ fabrics: fabricsUnfiltered });
      }
    };
*/
    const handleCheck = (e) => {
      let value = e.target.value;
      let checked = e.target.checked;

      if (checked) {
        !_.includes(this.state.selectedFabrics, value) &&
          this.setState((prevState) => ({
            selectedFabrics: [...prevState.selectedFabrics, value],
          }));
      } else {
        this.setState((prevState) => ({
          selectedFabrics: _.filter(
            prevState.selectedFabrics,
            (x) => x !== value
          ),
        }));
      }
    };
    const handleSwitch = () => {
      this.setState({ affix: !this.state.affix });
    };
    /*
    const saveMetadata = async (
      value_id,
      metadata_id,
      fabric_id,
      fabric_metadata_id,
      checked,
      value
    ) => {
      this.setState({ creatingLoading: true });
      let request = await fetch(api + "fabric_metadata", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: fabric_metadata_id ? fabric_metadata_id : null,
          fabric_id,
          metadata_id,
          value_id,
          user_id: this.state.user ? this.state.user.user_id : -1,
          active: checked ? 1 : 0,
        }),
      });
         .then(response => response.json())
        .then(responseData => {
          responseData &&
            checked === true &&
            !fabric_metadata_id &&
            message.success(`Metadata "${value}" added.`);
          responseData &&
            checked === false &&
            message.success(`Metadata "${value}" removed.`);

          this.forceUpdate();
        });
      let responseData = await request.json();
      responseData &&
        checked === true &&
        !fabric_metadata_id &&
        message.success(`Metadata "${value}" added.`);
      responseData &&
        checked === false &&
        message.success(`Metadata "${value}" removed.`);
    };
   
    const handleSaveMetadata = async (metadata, fabric_id) => {
      for (let md = 0; md < metadata.length; md++) {
        let aux = _.filter(
          metadata[md].meta,
          (x) => x.checked === true || x.checked === false
        );
        for (let m = 0; m < aux.length; m++) {
          await saveMetadata(
            aux[m].id,
            aux[m].metadata_id,
            fabric_id,
            aux[m].fabric_metadata_id,
            aux[m].checked,
            aux[m].value
          );
        }
      }
    };
*/
    const {
      loading,
      error,
      fabrics,
      image,
      visible,
      filterMetadata,
      selectedFabrics,
      affix,
      pageSize,
      total,
      pageSizeOptions,
    } = this.state;

    const customPanelStyle = {
      background: "#f7f7f7",
      borderRadius: 4,
      marginBottom: 24,
      border: 0,
      overflow: "hidden",
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
          {Auth.loggedIn() && (
            <Top
              username={this.state.user && this.state.user.username}
              getWord={() => {
                return "LOGOUT";
              }}
            />
          )}
          <BackTop />
          <Content className="container">
            <Row
              type="flex"
              justify="center"
              align="middle"
              style={{
                marginBottom: 20,
              }}
            >
              <a href="/">
                <img src={Logo} alt="Bebe Tailor" width="150px" />
              </a>
            </Row>
            <Anchor style={{ paddingTop: 10, paddingBottom: 10 }} affix={affix}>
              <PageHeader
                ghost={true}
                extra={[
                  <Tooltip title="Sticky Header" key={"tooltip"}>
                    <Switch
                      onChange={handleSwitch}
                      loading={loading}
                      checkedChildren="Sticky Header"
                      checked={affix}
                    />
                  </Tooltip>,
                ]}
                style={{
                  border: "1px solid rgb(235, 237, 240)",
                }}
                title="Collection"
                subTitle={this.props.params.id.toUpperCase()}
              >
                <Content>{renderContent()}</Content>
              </PageHeader>
            </Anchor>
            <Checkbox.Group style={{ width: "100%" }}>
              <List
                loading={loading}
                split={true}
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 3,
                  lg: 4,
                  xl: 4,
                  xxl: 4,
                }}
                pagination={{
                  total,
                  showSizeChanger: true,
                  pageSizeOptions,
                  position: "both",
                  showTitle: true,
                  style: { marginBottom: 10 },
                  pageSize,
                  size: "small",
                  onShowSizeChange: (page, pageSize) => {
                    this.setState({ pageSize });
                    this.setState({ page });
                    this.setState({ loading: true });
                    this.getFabrics(
                      this.state.collection,
                      page,
                      pageSize,
                      this.state.filter
                    );
                  },
                  onChange: (page, pageSize) => {
                    this.setState({ pageSize });
                    this.setState({ page });
                    this.setState({ loading: true });
                    this.getFabrics(
                      this.state.collection,
                      page,
                      pageSize,
                      this.state.filter
                    );
                  },
                }}
                dataSource={fabrics}
                renderItem={(fabric) => (
                  <List.Item>
                    <Card
                      style={{
                        maxWidth: 300,
                        height: Auth.loggedIn() ? 460 : 360,
                      }}
                      title={
                        <span
                          style={{
                            display: "flex",
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Checkbox
                            value={fabric.fabric.unique_code}
                            onChange={(e) => handleCheck(e)}
                          >
                            {`${fabric.fabric.unique_code}`}
                          </Checkbox>
                        </span>
                      }
                      cover={
                        <div
                          style={{
                            maxHeight: 180,
                            maxWidth: 300,
                            overflow: "hidden",
                          }}
                        >
                          <img
                            style={{ marginTop: -120 }}
                            alt={fabric.fabric.unique_code}
                            src={`${thumbnail_url}/${fabric.fabric.image}`}
                            onClick={() => {
                              this.setState({ image: fabric.fabric.image });
                              this.setState({ visible: true });
                            }}
                          />
                        </div>
                      }
                    >
                      <Meta description={<FabricMetadata fabric={fabric} />} />
                    </Card>
                  </List.Item>
                )}
              />
            </Checkbox.Group>
          </Content>
          <Footer
            style={{
              textAlign: "center",
              flex: 1,
            }}
          >
            Bebe Tailor {new Date().getFullYear().toString()}, Hoi An, Vietnam.
          </Footer>

          <Modal
            visible={visible}
            footer={null}
            maskClosable={true}
            destroyOnClose={true}
            centered={true}
            onCancel={() => {
              this.setState({ image: null });
              this.setState({ visible: false });
            }}
            width={520}
          >
            <img
              style={{
                width: "100%",
              }}
              alt="Bebe Tailor"
              src={`${image_url}/${image}`}
              onClick={() => {
                this.setState({ visible: false });
                this.setState({ image: null });
              }}
            />
          </Modal>

          <input
            style={{
              color: "white",
              borderColor: "transparent",
            }}
            className="toCopy"
            type="text"
            defaultValue={_.map(selectedFabrics).join(", ")}
          />
          {/*
          <MetadataForm
            record={record}
            visible={editFabricVisible}
            creatingLoading={creatingLoading}
            onOk={this.handleEditFabric}
            metadata={metadata}
            destroyOnClose={true}
            centered={true}
            width={"520"}
            onCancel={(form) => {
              this.setState({ image: null });

              this.setState({ editFabricVisible: false });
              this.getMetadata();
            }}
            saveMetadata={async (metadata, fabric_id) => {
              await handleSaveMetadata(metadata, fabric_id).then(() => {
                handleGetInfo(record);
                //this.getMetadata();
                this.setState({ image: null });
              });
            }}
          /> */}
        </Layout>
      );
  }
}

class FabricMetadata extends React.Component {
  render() {
    const { fabric } = this.props;
    let metadata = _(fabric.fabric.metadata)
      .groupBy((m) => m.metadata_id)
      .map((value, key) => ({
        value,
        key: value[0].metadata.name,
        id: value[0].metadata.id,
      }))
      .value();

    return (
      <Descriptions key={1} size="small" column={1}>
        {metadata.map((m) => {
          return (
            <Descriptions.Item label={m.key} key={m.id}>
              {m.value.map((v) =>
                m.id !== 3 ? (
                  <Tag key={v.id}>{v.value.value}</Tag>
                ) : (
                  <Rate
                    key={v.id}
                    disabled
                    defaultValue={Number(v.value.value)}
                  />
                )
              )}
            </Descriptions.Item>
          );
        })}
        {Auth.loggedIn() && (
          <Fragment>
            <Descriptions.Item label="Swatchbook">
              <Link
                to={`/s/${fabric.fabric.swatchbook.unique_code}`}
                target="_blank"
              >
                {fabric.fabric.swatchbook.unique_code}
              </Link>
            </Descriptions.Item>
            <Descriptions.Item label="Old Code">
              {fabric.fabric.old_code}
            </Descriptions.Item>

            <Descriptions.Item label="Type">{`${fabric.fabric.type.description}`}</Descriptions.Item>
          </Fragment>
        )}
      </Descriptions>
    );
    /*
  {fabric.fabric.metadata.map((f) => (
    <Descriptions.Item
      label={f.metadata}
      key={f.metadata}
    >
      {fabric.metadata &&
        fabric.metadata.map((m) =>
          f.metadata === m.metadata &&
          m.metadata_id &&
          m.metadata_id !== 3 ? (
            <Tag key={m.id}>{m.value}</Tag>
          ) : (
            f.metadata === m.metadata &&
            m.metadata_id === 3 && (
              <Rate
                key={m.id}
                disabled
                defaultValue={Number(m.value)}
              />
            )
          )
        )}
    </Descriptions.Item>
  ))}*/
  }
}
export default Collection;
