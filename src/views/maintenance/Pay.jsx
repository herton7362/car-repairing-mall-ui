import React from 'react';

import util from '@/libs/util';
import { Button, Toast, Modal, List, Icon, Flex, WhiteSpace, Stepper, Steps } from 'antd-mobile';
import numeral from 'numeral';
import addAddress from '../shop/add_address.png';
import Shops from '../shop/Shop';
import { hashHistory } from 'react-router';

import './Pay.less';
import {transStep} from "../order-form/util";

export default class Pay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shopVisible: false,
            selectedItem: props.selectedItem,
            user: util.getUserInfo(),
            payType: 'ONLINE',
            onlinePayType: 'wechat'
        }
    }

    componentDidMount () {
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
    wechatAppPay = () => {
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
        const total = numeral(this.state.selectedItem.manHourPrice
            + this.state.selectedItem.partses.reduce((prev, cur)=>cur.count * cur.parts.price + prev, 0)).format('0.0');
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

        let parts = this.state.selectedItem.partses.forEach(parts=>{
            partses.push(Object.assign({}, parts, {id: null}));
        });

        return util.ajax.post(`/api/entrustForm`, {
            ...params,
            status: 'NEW',
            origin: 'ONLINE_SHOP',
            vehicle: this.props.vehicle,
            kilometres: this.props.vehicle.mileage,
            contactTel: this.state.user.mobile,
            items: [{maintenanceItem:this.state.selectedItem}],
            clientId: this.state.selectedShop.clientId,
            partses
        });
    }

    render() {
        const {shopVisible, selectedShop, selectedItem, imgs, payType, onlinePayType} = this.state;
        return (
            <div className="tyre-pay">
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
                                       onClick={()=>this.setState({onlinePayType: 'ONLINE'})}>
                                微信支付
                            </List.Item>
                            <List.Item extra={<Icon type={'ali' === onlinePayType&& 'check'} style={{color: '#09bb07'}}/>}
                                       onClick={()=>this.setState({onlinePayType: 'ali'})}>
                                支付宝支付
                            </List.Item>
                        </List>
                    </div>}

                    <WhiteSpace></WhiteSpace>
                    <List>
                        <List.Item>
                            {selectedItem.name} <span style={{color: '#999', fontSize: 12}}>（工时费 ￥ {numeral(selectedItem.manHourPrice).format('0,0.0')}）</span>
                        </List.Item>
                        {selectedItem.partses.map(parts=>(
                            <List.Item
                                key={parts.id}
                                thumb={parts.parts.partsCoverImage && <img src={`${util.baseURL}/attachment/download/${parts.parts.partsCoverImage.attachmentId}`} style={{width: 60, height: 60, margin: '10px 0'}} />}
                                extra={`￥${numeral(parts.count * parts.parts.price).format('0,0.0')}`}
                            >
                                {parts.parts.name}
                                <p style={{margin: 0, color: '#999'}}>
                                    x {parts.count}
                                </p>
                            </List.Item>
                        ))}
                    </List>
                    <WhiteSpace></WhiteSpace>
                    <List>
                        <List.Item>购物流程</List.Item>
                        <List.Item>
                            <Steps direction="horizontal" current={4}>
                                <Steps.Step title="选轮胎" />
                                <Steps.Step title="选门店"  />
                                <Steps.Step title="店铺确认" />
                                <Steps.Step title="到店安装" />
                            </Steps>
                        </List.Item>
                    </List>
                    <div className="footer">
                        <Flex>
                            <Flex.Item style={{textAlign: 'right'}}>
                                合计：
                                <span style={{color: '#C3A769'}}>￥ {selectedItem? numeral(selectedItem.manHourPrice
                                    + selectedItem.partses.reduce((prev, cur)=>cur.count * cur.parts.price + prev, 0)).format('0,0.0'): '0.0'}</span>
                            </Flex.Item>
                            <Flex.Item style={{width: 80}}>
                                <Button type="primary" onClick={this.handleSubmit}>立即购买</Button>
                            </Flex.Item>
                        </Flex>
                    </div>
                </div>)}
                {shopVisible && <Shops onSelect={this.onSelectShop}></Shops>}
            </div>
        );
    }
}
