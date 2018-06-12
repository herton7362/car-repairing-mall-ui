import React from 'react';

import util from '@/libs/util';
import { Button, Toast, Modal, List, Icon, Flex, WhiteSpace, Tabs, Badge } from 'antd-mobile';
import { hashHistory } from 'react-router';
import {transStatus} from './util';
import numeral from 'numeral';

const status = (status) => {
    return <span style={{color: '#ed5050'}}>{transStatus(status)}</span>;
}

export default class OrderForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: util.getUserInfo(),
            all: {
                count: 0,
                data: []
            },
            unsure: {
                count: 0,
                data: []
            },
            sure: {
                count: 0,
                data: []
            },
            done: {
                count: 0,
                data: []
            }
        }
    }

    componentDidMount () {
        this.loadAll();
        this.loadUnsure();
        this.loadSure();
        this.loadDone()
    }

    loadAll = () => {
        this.loadEntrustForms(null).then((response)=>{
            this.setState({
                all: {
                    count: response.data.totalElements,
                    data: response.data.content
                }
            })
        });
    }

    loadUnsure = () => {
        this.loadEntrustForms('NEW').then((response)=>{
            this.setState({
                unsure: {
                    count: response.data.totalElements,
                    data: response.data.content
                }
            })
        });
    }

    loadSure = () => {
        this.loadEntrustForms('CONFIRM').then((response)=>{
            this.setState({
                sure: {
                    count: response.data.totalElements,
                    data: response.data.content
                }
            })
        });
    }

    loadDone = () => {
        this.loadEntrustForms('FINISHED').then((response)=>{
            this.setState({
                done: {
                    count: response.data.totalElements,
                    data: response.data.content
                }
            })
        });
    }

    loadEntrustForms = (status) => {
        return util.ajax.get('/api/entrustForm', {
            params: {
                sort:'createdDate',
                order: 'desc',
                all: 'true',
                status,
                creatorId: this.state.user.id,
                origin: 'ONLINE_SHOP',
                logicallyDeleted: 0
            }
        })
    }

    render() {
        const {all, unsure, sure, done} = this.state;
        const OrderForms = (props) => {
            return (<div>{props.source.data.map(item=>(<div key={item.id}>
                <List>
                    <List.Item extra={status(item.status)}>
                        <span style={{color: '#888'}}>{item.orderNumber}</span>
                    </List.Item>
                    {item.items.map(i=>(
                        <List.Item key={i.id} extra={`工时费 ￥${numeral(i.maintenanceItem.manHourPrice).format('0,0.0')}`}>
                            {`${i.maintenanceItem.category} ${i.maintenanceItem.name}`}
                        </List.Item>
                    ))}
                    {item.partses.map(i=>(
                        <List.Item key={i.id} extra={`￥${numeral(i.count * i.parts.price).format('0,0.0')}`}>
                            {i.parts.name}
                        </List.Item>
                    ))}
                    <List.Item style={{padding: '10px'}}>
                        <div style={{textAlign: 'right', color: '#888'}}>
                            共 {item.partses.reduce((prev, cur)=>cur.count + prev, 0)} 件商品
                            合计
                            <span style={{fontSize: 18, color: '#333'}}>
                                        ￥{numeral(item.items.reduce((prev, cur)=>prev + cur.maintenanceItem.manHourPrice, 0)
                                + item.partses.reduce((prev, cur)=>cur.count * cur.parts.price + prev, 0)).format('0,0.0')}
                                    </span>
                        </div>
                        <Button
                            size="small"
                            type="ghost"
                            inline style={{float: 'right', marginTop: '10px'}}
                            onClick={()=>hashHistory.push(`/orderForm/${item.id}`)}
                        >查看详情</Button>
                    </List.Item>
                </List>
                <WhiteSpace size="lg"></WhiteSpace>
            </div>))}</div>);
        }
        return (<div>
            <Tabs tabs={[
                { title: <Badge text={all.count}>全部</Badge> },
                { title: <Badge text={unsure.count}>待确认</Badge> },
                { title: <Badge text={sure.count}>已确认</Badge> },
                { title: <Badge text={done.count}>已完成</Badge> },
            ]}
                  initialPage={0}
            >
                <div>
                    <OrderForms source={all}></OrderForms>
                </div>
                <div>
                    <OrderForms source={unsure}></OrderForms>
                </div>
                <div>
                    <OrderForms source={sure}></OrderForms>
                </div>
                <div>
                    <OrderForms source={done}></OrderForms>
                </div>
            </Tabs>
        </div>);
    }
}
