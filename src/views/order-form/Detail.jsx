import React from 'react';

import util from '@/libs/util';
import { Button, Toast, List, Icon, WhiteSpace, Steps } from 'antd-mobile';
import {transStep} from './util';
import numeral from 'numeral';

import './Detail.less';
import {hashHistory} from "react-router";

export default class OrderFormDetail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            form: {
                id: this.props.params.id
            }
        }

    }

    componentDidMount () {
        if(this.state.form.id) {
            util.ajax.get(`/api/entrustForm/${this.state.form.id}`).then((response)=>{
                this.setState({
                    form: response.data
                })
            })
        }
    }

    render() {
        const {form} = this.state;
        const shop = form.shop;
        return (<div className="order-form-detail">
            <div className="select-shop">
                <List>
                    <List.Item
                        thumb={<img src={`${util.baseURL}/attachment/download/${shop && shop.styleImages[0].id}`} style={{width: 60, height: 60}} />}
                        style={{padding: '10px 0 10px 15px'}}
                    >
                        {shop && shop.name}
                        <List.Item.Brief>{shop && shop.address}</List.Item.Brief>
                    </List.Item>
                </List>
            </div>
            <WhiteSpace size="lg" />
            <List renderHeader={() => '购买服务'}>
                {form.items && form.items.map(i=>(
                    <List.Item key={i.id} extra={`工时费 ￥${numeral(i.maintenanceItem.manHourPrice).format('0,0.0')}`}>
                        {`${i.maintenanceItem.category} ${i.maintenanceItem.name}`}
                    </List.Item>
                ))}
                {form.partses && form.partses.map(i=>(
                    <List.Item key={i.id} extra={`￥${numeral(i.parts.price).format('0,0.0')} x ${i.count}`}>
                        {i.parts.name}
                    </List.Item>
                ))}
                <List.Item extra={<span style={{color: '#C3A769'}}>￥{form.items && form.partses && numeral(form.items.reduce((prev, cur)=>prev + cur.maintenanceItem.manHourPrice, 0)
                    + form.partses.reduce((prev, cur)=>cur.count * cur.parts.price + prev, 0)).format('0,0.0')}</span>}>
                        合计
                </List.Item>
            </List>
            <WhiteSpace size="lg" />
            <List>
                <List.Item extra={form.orderNumber}>
                    订单编号
                </List.Item>
                <List.Item extra={util.dateFormat(new Date(form.createdDate))}>
                    创建时间
                </List.Item>
            </List>

            <WhiteSpace size="lg" />
            <List>
                <List.Item extra={form && form.payType === 'ONLINE'? '在线支付': '到店支付'}>
                    支付方式
                </List.Item>
                <List.Item extra={form && form.payStatus === 'PAYED'? '已支付': '待支付'}>
                    支付状态
                </List.Item>
                <List.Item extra={<span>￥ {numeral(form.cashPay).format('0,0.0')}</span>}>
                    现金支付
                </List.Item>
            </List>
            <WhiteSpace size="lg" />
            <div className="step-wrap">
                <Steps current={transStep(form.status)}>
                    <Steps.Step title="店铺确认" description={transStep(form.status) < 1? '等待4s店确认订单': '4s店已确认订单'} />
                    <Steps.Step title="到店服务" description="到4s店享受服务" />
                    <Steps.Step title="服务完成" />
                </Steps>
            </div>

        </div>);
    }
}
