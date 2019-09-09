import React from "react"

import {
	Modal,
	Form,
	Radio,
	Select,
	InputNumber,
	Button
} from "antd"

import { formItemLayout} from "../containers/constants"
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

export  class AddModal extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			newLocation: undefined,
			all: 0,
			add: this.props.add ? this.props.add : 0
		}
	}
	render() {
		const {visible, onCancel, onOk, form,creatingLoading} = this.props
		const {getFieldDecorator} = form
		const FormItem = Form.Item
		const Option = Select.Option
		const { newLocation, add} = this.state

		const {record, locations} = this.props
        


		return (
			<Modal
				visible={visible}
				onCancel={() => 
				{
					this.setState({add:0})
					onCancel(form)}
				}
				title={record && this
					.props
					.getWord("add-remove-stock-for") + " " + record
					.unique_code
				}
				centered
				okText={add === 0
					? this.props.getWord("add")
					: this.props.getWord("remove")}
				cancelText={this.props.getWord("cancel")}
				onOk={onOk}
				okButtonProps={{ loading: creatingLoading }}>
				<div>
					<Form onSubmit={this.handleSubmitAddRemove}>
						<FormItem
							style={{
								textAlign: "center"
							}}>
							{
								getFieldDecorator("add", 
								
									{initialValue:add})(
									<RadioGroup
										setFieldsValue={add}
										
										onChange={value => {
											this.setState({add:value.target.value})
										}}
										buttonStyle="solid">
										<RadioButton value={0}>{
											this
												.props
												.getWord("add")
										}</RadioButton>
										{
											record && (!record.hetvai && (
												<RadioButton value={1}>{
													this
														.props
														.getWord("remove")
												}</RadioButton>
											))
										}
									</RadioGroup>
								)
							}
						</FormItem>

						<FormItem
							label={this
								.props
								.getWord("location")}
							{...formItemLayout}>
							{
								getFieldDecorator("location", {
									rules: [
										{
											required: true,
											message: "Please input a Location"
										}
									]
								})(
									<Select
										showSearch={true}
										style={{
											width: 200
										}}
										required="required"
										setFieldsValue={newLocation}
										placeholder={this
											.props
											.getWord("select-a-location")}
										optionFilterProp="children"
										onChange={newLocation => {
											add === 1 && this.setState({
												newStock: Number(record.stock.find(i => i.location_id === newLocation).stock)
											})
											this.setState({newLocation})
											this.forceUpdate()
										}}>
										{
											add === 0
												? locations.map(l => (
													<Option value={l.id} key={l.id}>
														{l.description}
													</Option>
												))
												: record
													.stock
													.filter(i => i.stock > 0)
													.map(l => (
														<Option value={l.location_id} key={l.location_id}>
															<div>
																{l.location + ": "}
																<b>{l.stock}</b>
															</div>

														</Option>
													))
										}
									</Select>
								)
							}
						</FormItem>
						<FormItem
							label={this
								.props
								.getWord("quantity")}
							{...formItemLayout}>
							{
								getFieldDecorator("quantity", {
									rules: [
										{
											required: true,
											message: "Please input a quantity"
										}
									]
								})(
									<InputNumber
										min={1}
										max={add === 1 ? (newLocation && Number(
											record.stock.find(i => i.location_id === newLocation)
												? record.stock.find(i => i.location_id === newLocation).stock
												: 0)):500
										}
										initialValue={0}
										setFieldsValue={this.state.newStock}
										onChange={newStock => {
											this.setState({newStock})
										}}/>
								)
							}

							<span>{" m"}</span>
							{
								add === 1 && (
									<Button
										onClick={() => {
											let all = Number(record.stock.find(i => i.location_id === newLocation).stock)
											this
												.props
												.form
												.setFieldsValue({quantity: all})
										}}
										style={{
											marginLeft: 20
										}}
										disabled={!newLocation}>
										{
											this
												.props
												.getWord("all")
										}
									</Button>
								)
							}
						</FormItem>
					</Form>
				</div>
			</Modal>
		)
	}
}

AddModal = Form.create({})(AddModal)
