import React from 'react';

import './my-zone.less';
import util from '@/libs/util';
import { Badge, WingBlank, Flex, WhiteSpace, List, SwipeAction, Modal, Toast, Icon } from 'antd-mobile';
import { Link, hashHistory } from 'react-router';

export default class MyZone extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: util.getUserInfo(),
            memberLevel: null,
            formCount: {}
        }
    }

    componentDidMount () {
        if(!util.hasLogin()) {
            hashHistory.push('/login');
            return;
        }
        this.props.loadVehicles(this.state.user.id);
        this.loadMemberLevel();
        this.loadOrderFormCount();
    }

    loadMemberLevel = () => {
        util.ajax.get(`/api/memberLevel/member/${this.state.user.id}`).then((response)=>{
            this.setState({
                memberLevel: response.data
            })
        })
    }

    loadOrderFormCount = () => {
        util.ajax.get(`/api/entrustForm/count/${this.state.user.id}`).then((response) => {
            this.setState({
                formCount: response.data
            })
        })
    }

    render () {
        const {vehicles, loadVehicles} = this.props;
        const {formCount} = this.state;
        return (<div className="my-zone">
            <div className="widget-user-header">
                <h3 className="widget-user-username">
                    {this.state.user && (this.state.user.name || this.state.user.loginName)}
                    <Badge text={this.state.memberLevel && this.state.memberLevel.name} style={{ marginLeft: 12 }} />
                </h3>
                <Link to={`/member/${this.state.user.id}`} className="widget-user-config"><i className="iconfont icon-config"></i></Link>
            </div>
            <div className="widget-user-image">
                <img src={`${util.baseURL}/static/image/default_user.jpg`} className="img-circle"/>
            </div>
            <div className="box-footer">
                <Flex>
                    <Flex.Item className="border-right">
                        <WingBlank size="md">
                            <div className="description-block">
                                <h5 className="description-header">{this.state.user && util.formatMoney(this.state.user.balance)}</h5>
                                <span className="description-text">
                                    <i className="iconfont icon-trade"></i> 余额
                                </span>
                            </div>
                        </WingBlank>
                    </Flex.Item>
                    <Flex.Item className="border-right">
                        <WingBlank size="md">
                            <div className="description-block">
                                <h5 className="description-header">{this.state.user && this.state.user.point}</h5>
                                <span className="description-text">
                                    <i className="iconfont icon-jifen"></i> 总积分
                                </span>
                            </div>
                        </WingBlank>
                    </Flex.Item>
                    <Flex.Item>
                        <WingBlank size="md">
                            <div className="description-block">
                                <h5 className="description-header">{this.state.user && this.state.user.salePoint}</h5>
                                <span className="description-text">
                                    <i className="iconfont icon-jifen2"></i> 可消费积分
                                </span>
                            </div>
                        </WingBlank>
                    </Flex.Item>
                </Flex>
            </div>
            <WhiteSpace size="lg"></WhiteSpace>
            <List className="my-car">
                <List.Item extra={<i className="iconfont icon-add" onClick={() => {
                    if(vehicles.length >= 5) {
                        Toast.info('您最多只能保存 5 辆爱车！');
                        return;
                    }
                    hashHistory.push('vehicle')
                }}></i>}>
                    <span className="header-title">我的爱车</span>
                </List.Item>
                {
                    vehicles && vehicles.map((vehicle)=>(
                        <SwipeAction
                            key={vehicle.id}
                            style={{ backgroundColor: 'gray' }}
                            autoClose
                            right={[
                                {
                                    text: '删除',
                                    onPress: () => {
                                        Modal.alert('系统提示',
                                            `你确定删除[${vehicle.vehicleCategories[0].name} ${vehicle.vehicleCategories[2].name}]吗？`,
                                            [
                                                { text: '取消' },
                                                {
                                                    text: '确定',
                                                    onPress: () =>
                                                        util.ajax.delete(`/api/vehicle/${vehicle.id}`).then(()=>{
                                                            loadVehicles();
                                                        })
                                                },
                                            ])

                                    },
                                    style: { backgroundColor: '#F4333C', color: 'white' },
                                },
                            ]}
                        >
                            <List.Item onClick={() => {hashHistory.push(`vehicle/${vehicle.id}`)}}>
                                <Flex>
                                    <Flex.Item>
                                        <WhiteSpace size="md"></WhiteSpace>
                                        <div className="title">{`${vehicle.vehicleCategories[0].name} ${vehicle.vehicleCategories[2].name}`}</div>
                                        <WhiteSpace size="sm"></WhiteSpace>
                                        <div className="description">{[...vehicle.plateNumber].map((v, i) => i > 1 && i<4? '*': v)}</div>
                                        <WhiteSpace size="md"></WhiteSpace>
                                    </Flex.Item>
                                    <div>
                                        {vehicle.isDefault? <Badge className="car-badge default-car" text="默认车辆"/>:
                                            <Badge className="car-badge" text="设为默认" onClick={(e)=>{
                                                e.stopPropagation();
                                                util.ajax.post(`/api/vehicle`, Object.assign({}, vehicle, {
                                                    isDefault: true,
                                                    default: true
                                                })).then(()=>{
                                                    loadVehicles();
                                                })
                                            }}/>}

                                    </div>
                                </Flex>
                            </List.Item>
                        </SwipeAction>
                    ))
                }
            </List>
            <WhiteSpace size="lg"></WhiteSpace>
            <List>
                <List.Item arrow="horizontal" onClick={() => {hashHistory.push('/orderForm')}}>
                    <span className="header-title">我的订单</span>
                </List.Item>
                <List.Item>
                    <Flex style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>
                        <Flex.Item>
                            <Badge text={formCount.NEW}><i className="iconfont icon-unpay" style={{fontSize: 22}}></i></Badge>
                            <div>待确认</div>
                        </Flex.Item>
                        <Flex.Item>
                            <Badge text={formCount.DISPATCHING + formCount.CONFIRM}><i className="iconfont icon-payed" style={{fontSize: 22}}></i></Badge>
                            <div>已确认</div>
                        </Flex.Item>
                        <Flex.Item>
                            <Badge text={formCount.FINISHED}><i className="iconfont icon-received" style={{fontSize: 22}}></i></Badge>
                            <div>已完成</div>
                        </Flex.Item>
                    </Flex>
                </List.Item>
            </List>
        </div>)
    }
}
