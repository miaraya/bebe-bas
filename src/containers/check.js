import React from "react";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";

const url = "http://apibas.herokuapp.com/api/";
//const url = "http://localhost:5000/api/";
var missing = [];

class Check extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fabric: null,
      missing: [],
      isLoading: false,
      count: 0,
      types: [],
      type: "Undefined",
      selectedType: []
    };
  }
  componentWillMount() {
    fetch(url + "types")
      .then(res => res.json())
      .then(types => {
        this.setState({types});
      });
  }

  componentDidMount() {}

  proceed = () => {
    this.doClear();
    var index = 0;
    var count = 0;
    var length = this.state.fabric.length;
    var loading = true;
    this.setState({isLoading: true});
    if (length > 0) {
      this.state.fabric.map(fabric => {
        this.imageExists(
          fabric.fabric_image,
          function() {
            console.log("checking: " + fabric.unique_code);
            index++;
            if (index >= length) {
              loading = false;
              this.setState({isLoading: loading});
            }
          }.bind(this),
          function() {
            missing.push(
              {fabric_image: fabric.fabric_image},
              {unique_code: fabric.unique_code}
            );
            index++;
            count++;

            this.setState({count: count});

            if (index >= length) {
              loading = false;
            }
            this.setState({isLoading: loading});
          }.bind(this)
        );
      });
      this.setState({missing: missing});
    }
  };

  doCheck = type => {
    fetch(url + "fabricdetails?filter[where][type]=" + type)
      .then(res => res.json())
      .then(fabric => {
        this.setState({fabric});
        fabric.length > 0 ? this.proceed() : "";
      });
  };

  doClear = () => {
    missing = [];
    this.setState({count: 0});
    this.setState({missing: missing});
    this.setState({isLoading: false});
  };
  update = () => {};

  componentDidUpdate() {}

  imageExists(url, good, bad) {
    var img = new Image();
    img.onload = good;
    img.onerror = bad;
    img.src =
      "http://apibas.herokuapp.com/api/containers/bebe-fabrics-thumbnails/download/" +
      url;
  }
  handleChange = event => {
    this.setState({[event.target.name]: event.target.value});
  };
  render() {
    const {missing, types} = this.state;
    return (
      <div>
        <FormControl>
          <InputLabel htmlFor="age-native-simple">Fabric Type</InputLabel>
          <Select
            native
            value={this.state.type}
            onChange={this.handleChange}
            inputProps={{
              name: "type"
            }}
          >
            <option value="" />
            {types.length > 0
              ? types.map(t => (
                  <option key={t.id} value={t.description}>
                    {t.description} - {t.alias}
                  </option>
                ))
              : ""}
          </Select>
        </FormControl>

        <Button onClick={() => this.doCheck(this.state.type)}>Check</Button>
        <Button onClick={this.doClear}>Clear</Button>
        <div>{"Not found: " + this.state.count}</div>
        <div hidden={!this.state.isLoading}>
          <CircularProgress size={50} />
        </div>
        <div>
          {missing
            ? missing.map(x => <div key={x.id}>{x.unique_code}</div>)
            : ""}
        </div>
      </div>
    );
  }
}

export default Check;
