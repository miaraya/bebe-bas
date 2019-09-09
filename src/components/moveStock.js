import React from "react"

import {
	Modal,
	Form,
	InputNumber,
	Button,
	Select
} from "antd"
import {formItemLayout} from "../containers/constants"

const Option = Select
	.Option

export class MoveModal extends React
	.Component {
	constructor(props) {
		super(props)

		this.state = {
			newLocation: undefined,
			all: 0,
			add: 0,
			oldLocation: undefined,
			newStock:0

		}
	}

	render() {
		const {
			visible,
			onCancel,
			onOk,
			creatingLoading,
			form,
			locations
		} = this.props
		const {oldLocation, newLocation} = this.state
		const {getFieldDecorator} = form

		const FormItem = Form.Item

		const {record} = this.props

		return (
			<Modal
				title={record
					? this
						.props
						.getWord("move-stock-for") + " " + record.unique_code
					: ""
				}
				centered
				visible={visible}
				onCancel={() => onCancel(form)}
				onOk={onOk}
				okText={this.props.getWord("move")}
				okButtonProps={{ loading: creatingLoading }}>
				<Form>
					<FormItem
						label={this
							.props
							.getWord("from")}
						{...formItemLayout}>
						{
							getFieldDecorator("fromLocation", {
								rules: [
									{
										required: true,
										message: "Please input a Location"
									}
								]
							})(
								<Select
									showSearch
									setFieldsValue={oldLocation}
									style={{
										width: 200
									}}
									placeholder={this
										.props
										.getWord("select-a-location")}
									optionFilterProp="children"
									onChange={oldLocation => {
										this
											.props
											.form
											.setFieldsValue({
												quantity:undefined
											})
										this.setState({oldLocation})
                                    
									}}
									filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
									}>
									{
										record && record
											.stock
											.filter(s => s.stock > 0)
											.map(l => (
												<Option value={l.location_id} key={l.location_id}>
													{l.location + "    max: " + l.stock + "m"}
												</Option>
											))
									}
								</Select>
							) }
					</FormItem>
					<FormItem
						label={this
							.props
							.getWord("to")}
						{...formItemLayout}>
						{
							getFieldDecorator("toLocation", {
								rules: [
									{
										required: true,
										message: "Please input a Location"
									}
								]
							})(
								<Select
									showSearch
									setFieldsValue={newLocation && newLocation}
									style={{
										width: 200
									}}
									placeholder={this
										.props
										.getWord("select-a-location")}
									optionFilterProp="children"
									onChange={newLocation => this.setState({newLocation})}
									filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
									}>
									{
										locations && locations.map(l => (
											<Option value={l.id} key={l.id}>
												{l.description}
											</Option>
										))
									}
								</Select>
							)}
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
									min={0}
									max={oldLocation && Number(
										record.stock.find(i => i.location_id === oldLocation)
											? record.stock.find(i => i.location_id === oldLocation).stock
											: 0
									)}
									initialValue={0}

									setFieldsValue={this.state.newStock}
									onChange={newStock => {
										this.setState({newStock})
									}}/>
							)}
						<span>{" m"}</span>
						<Button
								
							onClick={() => {
								let all = Number(record.stock.find(i => i.location_id === oldLocation).stock)
								this
									.props
									.form
									.setFieldsValue({
										quantity:all
									})
							}}
							style={{
								marginLeft: 20
							}}
							disabled={!oldLocation}
						>
							{
								this
									.props
									.getWord("all")
							}
						</Button>
					</FormItem>
				</Form>
			</Modal>

		)
	}
}
MoveModal = Form
	.create({})(MoveModal)
