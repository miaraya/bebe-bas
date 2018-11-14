import React, {Component} from "react";
import "antd/dist/antd.css";
import "../css/css.css";
import {Layout, Modal} from "antd";

import Logo from "../assets/logo.png";
import {Radio} from "antd";
import {Input} from "antd";
import {api, fabric_url, fabric_url_full} from "./constants";
import {Table, Divider} from "antd";
import {Link} from "react-router";
import {Avatar} from "antd";
import {Spin} from "antd";
import {Select} from "antd";
import _ from "lodash";

const Option = Select.Option;
const Search = Input.Search;
const {Content, Header} = Layout;

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
          placeholder: "Swatchbook",
          url: "fabricdetails?filter[where][old_code][like]="
        }
      ],

      columns: [
        {
          title: "Fabric",
          dataIndex: "unique_code",
          key: "unique_code",
          render: fabric => <Link to={`/f/${fabric}`}>{fabric}</Link>
        },
        {
          title: "Old Code",
          dataIndex: "old_code",
          key: "old_code"
        },
        {
          title: "Swatchbook",
          dataIndex: "swatchbook",
          key: "swatchbook",
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
      ]
    };
  }
  componentWillMount = () => {
    this.getTypes();
    console.log(this.state);
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
        this.setState({data});
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
  handleChange = value => {
    this.getSwatchbooks(value);
  };
  render() {
    const {
      options,
      selectedOption,
      data,
      visible,
      image,
      loading,
      columns,
      types,
      swatchbooks,
      columnsSwatchbooks
    } = this.state;

    return (
      <Layout className="wrapper">
        <Header className="header">
          <Link to={`/`}>
            <img src={Logo} alt="Bebe Tailor" width="150px" />
          </Link>
        </Header>
        <Content className="container">
          <Divider />

          <div
            style={{
              marginTop: 40,
              marginBottom: 40,
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
              flex: 1
            }}
          >
            Search by:
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
            {selectedOption.value !== 3 ? (
              <Search
                placeholder={selectedOption.placeholder}
                onSearch={query => this.doSearch(selectedOption.url, query)}
                style={{width: 200}}
              />
            ) : (
              <Select
                showSearch
                style={{width: 200}}
                placeholder="Select a Fabric Type"
                optionFilterProp="children"
                onChange={value => this.handleChange(value)}
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
                  <Option value="jack">Jack</Option>
                )}
              </Select>
            )}
          </div>
          <Divider />
          {loading ? (
            <div style={{display: "flex", justifyContent: "center"}}>
              <Spin size="large" />
            </div>
          ) : data.length > 0 && selectedOption.value !== 3 ? (
            <Table
              dataSource={data}
              columns={columns}
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
          ) : (
            <div />
          )}
        </Content>
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
      </Layout>
    );
  }
}

export default Home;
