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
  Typography,
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
import { MetadataForm } from "../components/metadata";

import Logo from "../assets/logo_small.png";

import { api, fabric_url_thumbnail, fabric_url_full } from "./constants";
import _ from "lodash";
import AuthService from "../AuthService";
const { Text } = Typography;

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
      selectedFabrics: [],
      affix: false,
      pageSize: 50,
      activeKey: 0,
      record: null,
      editFabricVisible: false,
      creatingLoading: false,
      filter: [],
      filterValues: [],
    };
  }
  componentWillMount = async () => {
    if (Auth.loggedIn()) {
      const profile = Auth.getProfile();
      this.setState({ user: profile });
    }

    let id = this.props.params.id;
    this.setState({ loading: true });
    //this.getMetadata();
    this.getFabrics(id);
    this.setState({ error: false });
  };

  getFabrics = async (name) => {
    let request = await fetch(`
      ${api}collections/detailbyName/${name}`);
    let collection = await request.json();

    for (const f of collection.fabric_ids) {
      f.fabric.metadata.forEach((fabric) =>
        this.setState((prevState) => ({
          filterMetadata: [...prevState.filterMetadata, fabric],
        }))
      );
    }

    let filter = _(this.state.filterMetadata)
      .groupBy((c) => c.metadata.name)
      .map((value, key) => ({
        key,
        values: _(value)
          .groupBy((c) => c.value.value)
          .map((value, key) => ({
            value: value,
            key: key,
            label: `${key} (${value.length})`,
            metadata_id: value[0].metadata_id,
            value_id: value[0].value_id,
            quantity: value.length,
          }))
          .value(),
      }))
      .value();
    this.setState({ filter });

    this.setState({ loading: false });
    /*
    this.setState({ fabrics: _.sortBy(fabrics, (f) => f.unique_code) });
    this.setState({ fabricsUnfiltered: fabrics });
    */
    this.setState({
      fabrics: _.sortBy(collection.fabric_ids, (f) => f.fabric.unique_code),
    });
    this.setState({
      fabricsUnfiltered: _.sortBy(
        collection.fabric_ids,
        (f) => f.fabric.unique_code
      ),
    });

    this.setState({ loading: false });
    // console.log(_.sortBy(collection.fabric_ids, (f) => f.fabric.unique_code));
  };

  checkMeta = (record) => {
    //console.log(record);
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
    //console.log("RECORD", record);
    this.setState({ image: null });
    this.setState({ creatingLoading: false });

    let aux = this.checkMeta(record);
    //console.log("AUX", aux);
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
  /*
  getMetadata = () => {
    fetch(api + "web_metadata")
      .then((res) => res.json())
      .then((metadata) => {
        this.setState({ metadata: _.sortBy(metadata, (m) => m.value) });
        this.setState({ metadataClear: _.sortBy(metadata, (m) => m.value) });
      });
  };*/

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
              {
                //console.log(selectedFabrics)
              }
              {selectedFabrics.map((f) => {
                //console.log(f);
                return <Tag key={f}>{f}</Tag>;
              })}
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
                {filter.map((x, j) => {
                  return (
                    <Col key={j} xs={24} sm={12}>
                      <Form.Item label={x.key} key={x.key}>
                        {x.values.map((v) => {
                          return (
                            <Col xs={12} sm={12} md={8} key={v.label}>
                              <Checkbox value={v.value}>
                                {v.metadata_id === 3 ? (
                                  <span>
                                    <Rate
                                      key={v.id}
                                      disabled
                                      defaultValue={Number(v.key)}
                                    />
                                    {` (${v.quantity})`}
                                  </span>
                                ) : (
                                  v.label
                                )}
                              </Checkbox>
                            </Col>
                          );
                        })}
                      </Form.Item>
                    </Col>
                  );
                })}
              </Checkbox.Group>
              <Form.Item
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button type="primary" onClick={handleFilter}>
                  Filter
                </Button>
              </Form.Item>
            </Form>
          </Panel>
        </Collapse>
      </Row>
    );

    const handleFilter = () => {
      fabricsUnfiltered.length
        ? this.setState({
            fabrics: _.filter(fabricsUnfiltered, (f) =>
              _.includes(this.state.filterValues, f.fabric_id)
            ),
          })
        : this.setState({ fabrics: fabricsUnfiltered });
    };
    const handleChange = async (values) => {
      let temp = [];
      values.forEach((value) => {
        value.forEach((v) => {
          temp.push(v.fabric_id);
        });
      });

      this.setState({ filterValues: _.uniq(temp) });
    };

    const setFilters = async (filter) => {
      if (filter.length) {
        let aux = fabricsUnfiltered;
        filter.forEach(
          (x) =>
            (aux = _.filter(aux, (e) =>
              _.find(e.metadata, (i) => i.value_id === x)
            ))
        );
        this.setState(
          { fabrics: _.sortBy(aux, (s) => s.price_band).reverse() },
          () => this.setState({ isLoading: false })
        );
      } else {
        this.setState({ fabrics: fabricsUnfiltered });
      }
    };

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
      /*   .then(response => response.json())
        .then(responseData => {
          responseData &&
            checked === true &&
            !fabric_metadata_id &&
            message.success(`Metadata "${value}" added.`);
          responseData &&
            checked === false &&
            message.success(`Metadata "${value}" removed.`);

          this.forceUpdate();
        });*/
      let responseData = await request.json();
      responseData &&
        checked === true &&
        !fabric_metadata_id &&
        message.success(`Metadata "${value}" added.`);
      responseData &&
        checked === false &&
        message.success(`Metadata "${value}" removed.`);
    };

    const handleGetInfo = async (record) => {
      //console.log("handleGetInfo", record);
      let request = await fetch(
        api + "fabric_data?filter[where][fabric_id]=" + record.fabric_id
      );
      let aux = await request.json();

      record.metadata = aux;
      this.setState({ record });
      this.forceUpdate();
      this.setState({ creatingLoading: false });
      this.setState({ editFabricVisible: false });
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

    const {
      loading,
      error,
      fabrics,
      image,
      visible,
      fabricsUnfiltered,
      filterMetadata,
      selectedFabrics,
      affix,
      pageSize,
      activeKey,
      record,
      editFabricVisible,
      creatingLoading,
      metadata,
      filter,
    } = this.state;

    const customPanelStyle = {
      background: "#f7f7f7",
      borderRadius: 4,
      marginBottom: 24,
      border: 0,
      overflow: "hidden",
    };

    const PriceBand = (props) => {
      const { fabric } = props;

      let price_band = _.find(
        fabric.fabric.metadata,
        (x) => x.metadata_id === 3
      )
        ? _.find(fabric.fabric.metadata, (x) => x.metadata_id === 3).value.value
        : -1;
      console.log(price_band);

      return (
        <Rate key={fabric.id} disabled defaultValue={Number(price_band)} />
      );
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
                split={true}
                loading={loading}
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
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "50", "100", "1000"],
                  position: "both",
                  showTitle: true,
                  style: { marginBottom: 10 },
                  pageSize: pageSize,
                  size: "small",
                  onShowSizeChange: (page, pageSize) =>
                    this.setState({ pageSize }),
                }}
                dataSource={fabrics}
                renderItem={(fabric) => {
                  console.log(fabric);
                  return (
                    <List.Item>
                      <Card
                        actions={[
                          <Tooltip title="More Info">
                            <Icon
                              type="caret-down"
                              key="more"
                              rotate={
                                this.state.activeKey === fabric.id ? 180 : 0
                              }
                              onClick={() =>
                                this.setState({
                                  activeKey:
                                    this.state.activeKey === fabric.id
                                      ? 0
                                      : fabric.id,
                                })
                              }
                            />
                          </Tooltip>,
                          Auth.loggedIn() && (
                            <Tooltip title="Fabric Data">
                              <Link
                                to={`/f/${fabric.fabric.unique_code}`}
                                target="_blank"
                              >
                                <Icon type="eye" />
                              </Link>
                            </Tooltip>
                          ),
                          Auth.loggedIn() && (
                            <Tooltip title="Edit">
                              <Icon
                                type="edit"
                                key="edit"
                                onClick={() => this.editFabric(fabric)}
                              />
                            </Tooltip>
                          ),
                        ]}
                        loading={loading}
                        bodyStyle={{ padding: 10 }}
                        headStyle={{
                          paddingLeft: 10,
                          paddingRight: 10,
                          width: "100%",
                        }}
                        bordered={true}
                        key={fabric.unique_code}
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
                              <Tooltip
                                title={
                                  fabric.fabric.total_stock > 0
                                    ? null
                                    : "No Stock"
                                }
                              >
                                <Text
                                  type={
                                    fabric.fabric.total_stock > 0
                                      ? null
                                      : "danger"
                                  }
                                >
                                  {fabric.fabric.unique_code}
                                </Text>
                              </Tooltip>
                            </Checkbox>
                            <PriceBand fabric={fabric} />
                          </span>
                        }
                        cover={
                          <img
                            style={{
                              maxHeight: 180,
                              masoverflow: "hidden",
                            }}
                            alt={fabric.unique_code}
                            src={fabric_url_thumbnail + fabric.fabric.image}
                            onClick={() => {
                              this.setState({
                                image: fabric_url_full + fabric.fabric.image,
                              });
                              this.setState({ visible: true });
                            }}
                          />
                        }
                      >
                        <Collapse accordion={true} activeKey={fabric.id}>
                          <Panel
                            key={fabric.id}
                            header={null}
                            className="collapse"
                          >
                            {/*
                          <Descriptions key={1} size="small" column={1}>
                            {filterMetadata &&
                              filterMetadata.map((f) => (
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
                              ))}
                          </Descriptions>
                          */}
                          </Panel>
                        </Collapse>

                        <Collapse
                          accordion={true}
                          activeKey={activeKey}
                          className="collapse"
                        >
                          <Panel key={fabric.id} className="collapse">
                            <Descriptions key={1} size="small" column={1}>
                              <Descriptions.Item label="Swatchbook">
                                {Auth.loggedIn() ? (
                                  <Link
                                    to={`/s/${fabric.fabric.swatchbook.unique_code}`}
                                    target="_blank"
                                  >
                                    {fabric.fabric.swatchbook.unique_code}
                                  </Link>
                                ) : (
                                  <Typography>
                                    {fabric.fabric.swatchbook.unique_code}
                                  </Typography>
                                )}
                              </Descriptions.Item>
                              <Descriptions.Item label="Old Code">
                                {fabric.fabric.old_code}
                              </Descriptions.Item>

                              <Descriptions.Item label="Type">{`${fabric.fabric.type.description}`}</Descriptions.Item>
                            </Descriptions>
                          </Panel>
                        </Collapse>
                      </Card>
                    </List.Item>
                  );
                }}
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
              src={image}
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
          {/*record && (
            <MetadataForm
              record={record}
              visible={editFabricVisible}
              creatingLoading={creatingLoading}
              onOk={this.handleEditFabric}
              destroyOnClose={true}
              centered={true}
              width={"520"}
              onCancel={(form) => {
                this.setState({ image: null });

                this.setState({ editFabricVisible: false });
                //this.getMetadata();
              }}
              saveMetadata={async (metadata, fabric_id) => {
                await handleSaveMetadata(metadata, fabric_id).then(() => {
                  handleGetInfo(record);
                  //this.getMetadata();
                  this.setState({ image: null });
                });
              }}
            />
            ) */}
        </Layout>
      );
  }
}
export default Collection;
