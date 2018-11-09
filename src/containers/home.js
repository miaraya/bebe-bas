import React, {Component} from "react";
import "antd/dist/antd.css";
import "../css/css.css";
import {Layout} from "antd";

import Logo from "../assets/logo.png";
import {Radio} from "antd";
import {Input} from "antd";
import {api, fabric_url, fabric_url_full, location_url} from "./constants";

const Search = Input.Search;
const {Content, Header} = Layout;

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 1,
      data: [],
      loading: false,
      error: false,
      selectedOption: {
        value: 1,
        placeholder: "Fabric Code",
        url: "fabrics?filter[where][unique_code][like]="
      },
      options: [
        {
          value: 1,
          placeholder: "Fabric Code",
          url: "fabrics?filter[where][unique_code][like]="
        },
        {
          value: 2,
          placeholder: "Fabric Old Code",
          url: "fabrics?filter[where][old_code][like]="
        },
        {
          value: 3,
          placeholder: "Swatchbook",
          url: "swatchbooks?[where][type_id]="
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
      })
      .catch(error => {});
  };

  render() {
    const {value, options, selectedOption, data} = this.state;
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
        </Content>
      </Layout>
    );
  }
}

export default Home;
