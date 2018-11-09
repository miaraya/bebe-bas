import React, {Component} from "react";
import "antd/dist/antd.css";
import "../css/css.css";
import {Layout, Modal} from "antd";

import Logo from "../assets/logo.png";
import {Radio} from "antd";
import {Input} from "antd";
import {api, fabric_url, fabric_url_full, location_url} from "./constants";
import {Table, Divider, Tag} from "antd";
import {Link} from "react-router";
import {Avatar} from "antd";
import {Spin} from "antd";

const {Column, ColumnGroup} = Table;

const Search = Input.Search;
const {Content, Header} = Layout;

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: "",
      visible: false,
      value: 1,
      data: [],
      loading: false,
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
        }
      ]
    };
  }
  componentWillMount = () => {};
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

  render() {
    const {
      value,
      options,
      selectedOption,
      data,
      visible,
      image,
      loading
    } = this.state;
    return (
      <Layout className="wrapper">
        <Header className="header">
          <img src={Logo} alt="Bebe Tailor" width="150px" />
        </Header>
        <Content className="container">
          <div
            style={{
              marginTop: 40,
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
            <Search
              placeholder={selectedOption.placeholder}
              onSearch={query => this.doSearch(selectedOption.url, query)}
              style={{width: 200}}
            />
          </div>
          <Divider />
          {loading ? (
            <div style={{display: "flex", justifyContent: "center"}}>
              <Spin size="large" />
            </div>
          ) : (
            <Table dataSource={data}>
              <Column
                title="Fabric"
                dataIndex="unique_code"
                key="unique_code"
                render={fabric => <Link to={`/f/${fabric}`}>{fabric}</Link>}
              />
              <Column title="Old Code" dataIndex="old_code" key="old_code" />
              <Column
                title="Swatchbook"
                dataIndex="swatchbook"
                key="swatchbook"
                render={swatchbook => (
                  <Link to={`/s/${swatchbook}`}>{swatchbook}</Link>
                )}
              />
              <Column
                title="Thumbnail"
                dataIndex="fabric_image"
                key="fabric_image"
                render={fabric_image => (
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
                )}
              />
            </Table>
          )}
        </Content>
        <Modal
          visible={visible}
          footer={null}
          maskClosable={true}
          onCancel={() => this.setState({visible: false})}
          width="100%"
        >
          <img
            style={{width: "100%"}}
            alt="Bebe Tailor"
            src={image}
            onClick={() => this.setState({visible: false})}
          />
        </Modal>
      </Layout>
    );
  }
}

export default Home;
