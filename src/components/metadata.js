import React, { Component } from "react";
import { Form, Modal, Tag } from "antd";
import { formItemLayout } from "../containers/constants";

const { CheckableTag } = Tag;
const FormItem = Form.Item;

export class MetadataForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      creatingLoading: false
    };
  }
  componentWillMount = () => {};
  handleChange = (checked, m) => {
    console.log(checked);
    m.checked = checked;

    this.forceUpdate();
  };

  render() {
    const {
      creatingLoading,
      record,
      visible,
      onCancel,
      form,
      metadata,
      saveMetadata
    } = this.props;
    return (
      <Modal
        title={record && `Edit metadata for fabric: ${record.unique_code}`}
        centered
        visible={visible}
        onCancel={() => onCancel(form)}
        okButtonProps={{ loading: creatingLoading }}
        onOk={() => saveMetadata(metadata, record && record.fabric_id)}
      >
        <Form>
          {metadata &&
            metadata.map(m => (
              <FormItem
                key={m.id}
                label={m.metadata}
                {...formItemLayout}
                value={m}
              >
                {m.meta.map(m => (
                  <CheckableTag
                    key={m.id}
                    onChange={checked => this.handleChange(checked, m)}
                    checked={m.checked}
                  >
                    {m.value}
                  </CheckableTag>
                ))}
              </FormItem>
            ))}
        </Form>
      </Modal>
    );
  }
}

MetadataForm = Form.create({})(MetadataForm);
