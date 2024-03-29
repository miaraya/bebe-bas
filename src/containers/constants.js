//export const api = "http://localhost:5000/api/";
export const api = "http://apibas.herokuapp.com/api/";

export const garment_options =
  api + "containers/bebe-garment-options/download/";
export const fabric_url = api + "containers/bebe-fabrics-thumbnails/download/";
//export const fabric_url_full = api + "containers/bebe-fabrics/download/";
//export const fabric_url_thumbnail =
//api + "containers/bebe-fabrics-thumbnails/download/";

export const thumbnail_url =
  "https://bebe-fabrics-thumbnails.s3-us-west-2.amazonaws.com";

export const image_url = "https://bebe-fabrics.s3-ap-southeast-1.amazonaws.com";

export const item_images = api + "containers/bebe-order-images/download/";

export const location_url = api + "containers/bebe-locations/download/";

export const swatchbook_url = "";
export const login_url = api + "users/login";

export const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

export const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};
