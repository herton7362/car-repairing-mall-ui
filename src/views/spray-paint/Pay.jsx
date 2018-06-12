import React from 'react';

import './Pay.less';
import util from '@/libs/util';
import { Button, Toast, Modal, List, Icon, Flex, WhiteSpace } from 'antd-mobile';
import numeral from 'numeral';
import addAddress from '../shop/add_address.png';
import Shops from '../shop/Shop';
import {hashHistory} from "react-router";

export default class Pay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shopVisible: false,
            maintenanceItems: this.props.maintenanceItems,
            total: this.props.total,
            selectedProduction: this.props.selectedProduction,
            selectedShop: null,
            payType: 'ONLINE',
            user: util.getUserInfo(),
            onlinePayType: 'wechat'
        }
    }

    onSelectShop = (shop) => {
        this.setState({
            shopVisible: false,
            selectedShop: shop
        })
    }

    wechatWebPay = ({orderNumber, cashPay}) => {
        window.location.href = util.baseURL + '/api/entrustForm/wechat/web/unified?orderNumber=' +
            orderNumber + '&cashPay=' + cashPay + '&access_token=' + localStorage.accessToken;
    }
    aliWebPay = ({orderNumber, cashPay}) => {
        window.location.href = util.baseURL +  '/api/entrustForm/ali/web/unified?orderNumber=' +
            orderNumber + '&cashPay=' + cashPay + '&access_token=' + localStorage.accessToken;
    }
    wechatAppPay = ({orderNumber, cashPay}) => {
        util.ajax.post('/api/entrustForm/wechat/unified', {
            orderNumber,
            cashPay
        }).then(response=>{
            function setupWebViewJavascriptBridge(callback) {
                var bridge = window.WebViewJavascriptBridge || window.WKWebViewJavascriptBridge;
                if (bridge) { return callback(bridge); }
                var callbacks = window.WVJBCallbacks || window.WKWVJBCallbacks;
                if (callbacks) { return callbacks.push(callback); }
                window.WVJBCallbacks = window.WKWVJBCallbacks = [callback];
                if (window.WKWebViewJavascriptBridge) {
                    //for https://github.com/Lision/WKWebViewJavascriptBridge
                    window.webkit.messageHandlers.iOS_Native_InjectJavascript.postMessage(null);
                } else {
                    //for https://github.com/marcuswestin/WebViewJavascriptBridge
                    var WVJBIframe = document.createElement('iframe');
                    WVJBIframe.style.display = 'none';
                    WVJBIframe.src = 'https://__bridge_loaded__';
                    document.documentElement.appendChild(WVJBIframe);
                    setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0);
                }
            }

            setupWebViewJavascriptBridge(function(bridge) {

                /* Initialize your app here */
                bridge.callHandler('wechatpay', JSON.stringify(response.data), function responseCallback(responseData) {
                    responseData = eval('('+responseData+')');
                    if(responseData.result === 'ok') {
                        Toast.success("提交成功", 1);
                        hashHistory.push('/my-zone');
                    } else {
                        Toast.fail("支付失败", 1);
                    }
                });
            });
        });
    }

    aliAppPay = ({orderNumber, cashPay}) => {
        util.ajax.post('/api/entrustForm/ali/unified', {
            orderNumber,
            cashPay
        }).then(response=>{
            function setupWebViewJavascriptBridge(callback) {
                var bridge = window.WebViewJavascriptBridge || window.WKWebViewJavascriptBridge;
                if (bridge) { return callback(bridge); }
                var callbacks = window.WVJBCallbacks || window.WKWVJBCallbacks;
                if (callbacks) { return callbacks.push(callback); }
                window.WVJBCallbacks = window.WKWVJBCallbacks = [callback];
                if (window.WKWebViewJavascriptBridge) {
                    //for https://github.com/Lision/WKWebViewJavascriptBridge
                    window.webkit.messageHandlers.iOS_Native_InjectJavascript.postMessage(null);
                } else {
                    //for https://github.com/marcuswestin/WebViewJavascriptBridge
                    var WVJBIframe = document.createElement('iframe');
                    WVJBIframe.style.display = 'none';
                    WVJBIframe.src = 'https://__bridge_loaded__';
                    document.documentElement.appendChild(WVJBIframe);
                    setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0);
                }
            }

            setupWebViewJavascriptBridge(function(bridge) {

                /* Initialize your app here */
                bridge.callHandler('alipay', JSON.stringify(response.data), function responseCallback(responseData) {
                    responseData = eval('('+responseData+')');
                    if(responseData.result === 'ok') {
                        Toast.success("提交成功", 1);
                        hashHistory.push('/my-zone');
                    } else {
                        Toast.fail("支付失败", 1);
                    }
                });
            });
        })
    }

    handleSubmit = () => {
        if(!this.state.selectedShop) {
            Toast.fail("请选择门店", 1);
            return;
        }

        const total = this.state.total;
        var ua = navigator.userAgent;
        if(total === 0 && this.state.payType === 'OFFLINE') {
            this.submitForm({
                payType: 'OFFLINE',
                payStatus: 'UNPAY'
            }).then(()=>{
                Toast.success("提交成功", 1);
                hashHistory.push('/my-zone');
            })
        } else {
            if(this.state.payType === 'ONLINE') {
                this.submitForm({
                    payType: 'ONLINE',
                    payStatus: 'UNPAY'
                }).then((response)=>{
                    if(this.state.onlinePayType === 'wechat') {
                        if(ua.indexOf('Android_WebView') > -1 || ua.indexOf('iPhone_WebView') > -1) {
                            this.wechatAppPay({
                                orderNumber: response.data.orderNumber,
                                cashPay: total
                            });
                        } else {
                            this.wechatWebPay({
                                orderNumber: response.data.orderNumber,
                                cashPay: total
                            });
                        }
                    } else {
                        if(ua.indexOf('Android_WebView') > -1 || ua.indexOf('iPhone_WebView') > -1) {
                            this.aliAppPay({
                                orderNumber: response.data.orderNumber,
                                cashPay: total
                            });
                        } else {
                            this.aliWebPay({
                                orderNumber: response.data.orderNumber,
                                cashPay: total
                            })
                        }
                    }
                })
            } else if(this.state.payType === 'OFFLINE') {
                this.submitForm({
                    payType: 'OFFLINE',
                    payStatus: 'UNPAY'
                }).then(()=>{
                    Toast.success("提交成功", 1);
                    hashHistory.push('/my-zone');
                })
            }
        }
    }

    submitForm = (params)=> {
        const partses = [];
        this.state.maintenanceItems.forEach(item=>{
            let parts = item.partses.find(parts=>parts.parts.name === this.state.selectedProduction.parts.name);
            if(partses.some(p=>p.parts.id === parts.parts.id)) {
                partses.find(p=>p.parts.id === parts.parts.id).count += parts.count;
            } else {
                partses.push(Object.assign({}, parts, {id: null}));
            }
        });

        return util.ajax.post(`/api/entrustForm`, {
            ...params,
            status: 'NEW',
            origin: 'ONLINE_SHOP',
            vehicle: this.props.vehicle,
            kilometres: this.props.vehicle.mileage,
            contactTel: this.state.user.mobile,
            items: this.state.maintenanceItems.map(item=>({maintenanceItem: item})),
            clientId: this.state.selectedShop.clientId,
            partses
        })
    }

    render() {
        const {shopVisible, selectedShop, total, maintenanceItems, selectedProduction, payType, onlinePayType} = this.state;
        return (<div className="spray-paint-pay">
            {!shopVisible && (<div style={{paddingBottom: 50}}>
                <div className="select-shop">
                    <List>
                        {!selectedShop && (
                            <List.Item
                                arrow="horizontal"
                                thumb={<img src={addAddress} style={{width: 44, height: 44}} />}
                                style={{padding: '10px 0 10px 15px'}}
                                onClick={() => this.setState({shopVisible: true})}
                            >
                                选择门店
                            </List.Item>
                        )}
                        {selectedShop && (
                            <List.Item
                                arrow="horizontal"
                                thumb={<img src={`${util.baseURL}/attachment/download/${selectedShop.styleImages[0].id}`} style={{width: 60, height: 60}} />}
                                style={{padding: '10px 0 10px 15px'}}
                                onClick={() => this.setState({shopVisible: true})}
                            >
                                {selectedShop.name}
                                <List.Item.Brief>{selectedShop.address}</List.Item.Brief>
                            </List.Item>
                        )}
                    </List>
                </div>
                <WhiteSpace></WhiteSpace>
                <List renderHeader={() => '支付方式'}>
                    <List.Item extra={<Icon type={'ONLINE' === payType&& 'check'} style={{color: '#09bb07'}}/>}
                               onClick={()=>this.setState({payType: 'ONLINE'})}>
                        在线支付
                    </List.Item>
                    <List.Item extra={<Icon type={'OFFLINE' === payType&& 'check'} style={{color: '#09bb07'}}/>}
                               onClick={()=>this.setState({payType: 'OFFLINE'})}>
                        到店支付
                    </List.Item>
                </List>
                {'ONLINE' === payType && <div>
                    <WhiteSpace></WhiteSpace>
                    <List renderHeader={() => '支付方式'}>
                        <List.Item extra={<Icon type={'wechat' === onlinePayType&& 'check'} style={{color: '#09bb07'}}/>}
                                   onClick={()=>this.setState({onlinePayType: 'wechat'})}>
                            微信支付
                        </List.Item>
                        <List.Item extra={<Icon type={'ali' === onlinePayType&& 'check'} style={{color: '#09bb07'}}/>}
                                   onClick={()=>this.setState({onlinePayType: 'ali'})}>
                            支付宝支付
                        </List.Item>
                    </List>
                </div>}
                <WhiteSpace></WhiteSpace>
                <List renderHeader={<div>总价格 <span style={{float: 'right', color: '#C3A769'}}>￥ {numeral(total).format('0,0.0')}</span></div>}>
                    {maintenanceItems.map(item=>(
                        <List.Item key={item.id} extra={numeral(item.partses[0].count * selectedProduction.parts.price).format('0,0.0')}>
                            {item.name}
                        </List.Item>
                    ))}
                </List>
                <WhiteSpace></WhiteSpace>
                <div className="tishi">
                    <div className="more">
                        <div className="text">温馨提示</div>
                    </div>
                    <ul>
                        <li>1.本服务针对日程行驶中的小碰擦和漆面划痕的修补。事故车辆暂时无法提供服务。</li>
                        <li>2.鼎骏所提供的价格仅包含喷漆服务。钣金服务按照店内价格结算。</li>
                        <li>3.已经做过全车改色特效漆的车辆暂时无法提供服务。（变色龙漆、各色哑光漆等）。</li>
                    </ul>
                </div>
                <div className="footer">
                    <Flex>
                        <Flex.Item style={{textAlign: 'right'}}>
                            合计：
                            <span style={{color: '#C3A769'}}>￥ {numeral(total).format('0,0.0')}</span>
                        </Flex.Item>
                        <Flex.Item style={{width: 80}}>
                            <Button type="primary" onClick={this.handleSubmit}>提交订单</Button>
                        </Flex.Item>
                    </Flex>
                </div>
            </div>)}
            {shopVisible && <Shops onSelect={this.onSelectShop}></Shops>}
        </div>)
    }
}
