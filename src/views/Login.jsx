import React from 'react';

import util from '@/libs/util'
import { List, WingBlank, WhiteSpace, InputItem, Button, Toast } from 'antd-mobile';
import { hashHistory } from 'react-router';

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mobile: this.props.mobile,
            password: this.props.password
        }
    }

    login = () => {
        util.ajax.post(`/admin/login?username=${this.state.mobile.replace(/ /g, '')}@tonr&password=${this.state.password}`)
            .then((response)=>{
                window.localStorage.accessToken = response.data['access_token'];
                window.localStorage.refreshToken = response.data['refresh_token'];
                window.localStorage.expiration = new Date().getTime() + ((response.data['expires_in'] / 2) * 1000);
                Toast.success('登录成功', 1);
                util.ajax.get('/user/info').then((response)=>{
                    util.setUserInfo(response.data);
                    hashHistory.push('/');
                })
            }).catch((error)=>{
                if(error.response) {
                    if('Bad credentials' === error.response.data.message) {
                        Toast.fail('密码错误请重新输入', 1);
                    }
                }
                return Promise.reject(error);
            })
    }

    render () {
        return (<form>
            <List renderHeader={() => (<div>
                <WhiteSpace size="xl"></WhiteSpace>
                <WhiteSpace size="xl"></WhiteSpace>
                <WingBlank size="lg">
                    <div style={{fontSize: 24, textAlign: 'center', color: '#333'}}>使用手机号密码登录</div>
                </WingBlank>
                <WhiteSpace size="xl"></WhiteSpace>
                <WhiteSpace size="xl"></WhiteSpace>
            </div>)}>
                <InputItem type="phone"
                           placeholder="请输入手机号"
                           value={this.state.mobile}
                           onChange={(v) => this.setState({ mobile: v })}>手机号</InputItem>

                <InputItem type="password"
                           placeholder="请输入密码"
                           value={this.state.password}
                           onChange={(v) => this.setState({ password: v })}>密码</InputItem>
            </List>
            <WhiteSpace size="xl"></WhiteSpace>
            <WingBlank><Button type="primary" onClick={this.login}>确定</Button></WingBlank>
            <WhiteSpace size="xl"></WhiteSpace>
            <div style={{color: '#999', textAlign: 'center'}}>
                忘记密码？请 <a href="javascript:void(0);" onClick={() => {this.props.goToPage('forgotPwd')}}>点此找回密码</a>
            </div>
        </form>)
    }
}

class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mobile: this.props.mobile,
            password: this.props.password,
            code: null,
            counter: null
        }
    }

    sendVerifyCode = () => {
        if(this.state.counter) {
            return;
        }
        this.setState({
            counter: 60
        })
        let interval = setInterval(() => {
            this.setState((prevState, props) => ({
                counter: prevState.counter - 1
            }));
            if(this.state.counter === 0) {
                clearInterval(interval);
            }
        }, 1000);
        util.ajax.get('/verifyCode', {
            params: {
                mobile: this.state.mobile.replace(/ /g, '')
            }
        })
    }

    register = () => {
        util.ajax.post(`/register?mobile=${this.state.mobile.replace(/ /g, '')}&code=${this.state.code}&password=${this.state.password}`).then(()=>{
            Toast.info('注册成功，前往登录', 1);
            this.props.goToPage('login', {
                password: this.state.password
            })
        })
    }

    render () {
        return (<form>
            <List renderHeader={() => (<div>
                <WhiteSpace size="xl"></WhiteSpace>
                <WhiteSpace size="xl"></WhiteSpace>
                <WingBlank size="lg">
                    <div style={{fontSize: 24, textAlign: 'center', color: '#333'}}>注册用户</div>
                </WingBlank>
                <WhiteSpace size="xl"></WhiteSpace>
                <WhiteSpace size="xl"></WhiteSpace>
            </div>)}>
                <InputItem type="phone"
                           placeholder="请输入手机号"
                           value={this.state.mobile}
                           extra={<div style={{color: this.state.counter? '#999': '#C3A769'}}
                                       onClick={this.sendVerifyCode}>{this.state.counter || ''} 获取验证码</div>}
                           onChange={(v) => this.setState({ mobile: v })}>手机号</InputItem>
                <InputItem type="number"
                           placeholder="请输入收到的验证码"
                           value={this.state.code}
                           onChange={(v) => this.setState({ code: v })}>
                        验证码
                </InputItem>
                <InputItem type="password"
                           placeholder="请输入密码"
                           value={this.state.password}
                           onChange={(v) => this.setState({ password: v })}>
                        密码
                </InputItem>
            </List>
            <WhiteSpace size="xl"></WhiteSpace>
            <WingBlank><Button type="primary" onClick={this.register}>确定</Button></WingBlank>
        </form>)
    }
}

class ForgotPwd extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mobile: this.props.mobile,
            password: this.props.password,
            code: null,
            counter: null
        }
    }

    sendVerifyCode = () => {
        if(this.state.counter) {
            return;
        }
        this.setState({
            counter: 60
        })
        let interval = setInterval(() => {
            this.setState((prevState, props) => ({
                counter: prevState.counter - 1
            }));
            if(this.state.counter === 0) {
                clearInterval(interval);
            }
        }, 1000);
        util.ajax.get('/verifyCode', {
            params: {
                mobile: this.state.mobile.replace(/ /g, '')
            }
        })
    }

    forgetPwd = () => {
        if(!this.state.code) {
            Toast.info('验证码不能为空', 1);
            return;
        }
        if(!this.state.password) {
            Toast.info('密码不能为空', 1);
            return;
        }
        util.ajax.post(`/editPwd?mobile=${this.state.mobile.replace(/ /g, '')}&code=${this.state.code}&password=${this.state.password}`).then(() => {
            this.props.goToPage('login');
        }).catch(error => {
            Toast.info(error.response.data.message, 1);
        });
    }

    render () {
        return (<div>
            <List renderHeader={() => (<div>
                <WhiteSpace size="xl"></WhiteSpace>
                <WhiteSpace size="xl"></WhiteSpace>
                <WingBlank size="lg">
                    <div style={{fontSize: 24, textAlign: 'center', color: '#333'}}>密码找回</div>
                </WingBlank>
                <WhiteSpace size="xl"></WhiteSpace>
                <WhiteSpace size="xl"></WhiteSpace>
            </div>)}>
                <InputItem type="phone"
                           placeholder="请输入手机号"
                           value={this.state.mobile}
                           extra={<div style={{color: this.state.counter? '#999': '#C3A769'}}
                                       onClick={this.sendVerifyCode}>{this.state.counter || ''} 获取验证码</div>}
                           onChange={(v) => this.setState({ mobile: v })}>手机号</InputItem>
                <InputItem type="number"
                           placeholder="请输入收到的验证码"
                           value={this.state.code}
                           onChange={(v) => this.setState({ code: v })}>
                    验证码
                </InputItem>
                <InputItem type="password"
                           placeholder="请输入密码"
                           value={this.state.password}
                           onChange={(v) => this.setState({ password: v })}>
                    密码
                </InputItem>
            </List>
            <WhiteSpace size="xl"></WhiteSpace>
            <WingBlank><Button type="primary" onClick={this.forgetPwd}>确定</Button></WingBlank>
            <WhiteSpace size="xl"></WhiteSpace>
            <div style={{color: '#999', textAlign: 'center'}}>
                <a href="javascript:void(0);" onClick={() => {this.props.goToPage('login')}}>通过手机号密码登录</a>
            </div>
        </div>)
    }
}

export default class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mobile: null,
            page: null,
            password: null
        }
    }

    goToPage = (page, props) => {
        this.setState({
            password: props && props.password || null,
            page
        })
    }

    checkTelExist = () => {
        util.ajax.get(`/user/mobile/${this.state.mobile.replace(/ /g, '')}`).then((response)=>{
            if(response.data) {
                this.setState({
                    page: 'login'
                })
            } else {
                this.setState({
                    page: 'register'
                })
            }
        })
    }

    render () {
        return (<div className="login" style={{background: '#fff', height: '100%'}}>

            <form style={{display: this.state.page? 'none': 'block'}}>
                <List renderHeader={() => (<div>
                    <WhiteSpace size="xl"></WhiteSpace>
                    <WhiteSpace size="xl"></WhiteSpace>
                    <WingBlank size="lg">
                        <div style={{fontSize: 24, textAlign: 'center', color: '#333'}}>输入手机号</div>
                    </WingBlank>
                    <WhiteSpace size="xl"></WhiteSpace>
                    <WhiteSpace size="xl"></WhiteSpace>
                </div>)}>
                    <InputItem type="phone"
                               placeholder="请输入手机号"
                               value={this.state.mobile}
                               onChange={(v) => this.setState({ mobile: v })}>手机号</InputItem>
                </List>
                <WhiteSpace size="xl"></WhiteSpace>
                <WingBlank><Button type="primary" onClick={this.checkTelExist}>确定</Button></WingBlank>
                <WhiteSpace size="xl"></WhiteSpace>
                <div style={{color: '#999', textAlign: 'center'}}>
                    回到 <a href="javascript:void(0);" onClick={() => {hashHistory.push('/')}}>首页</a>
                </div>
            </form>
            {this.state.page === 'login' && React.createElement(Login, {
                mobile: this.state.mobile,
                password: this.state.password,
                goToPage: this.goToPage
            })}
            {this.state.page === 'register' && React.createElement(Register, {
                mobile: this.state.mobile,
                password: this.state.password,
                goToPage: this.goToPage
            })}
            {this.state.page === 'forgotPwd' && React.createElement(ForgotPwd, {
                mobile: this.state.mobile,
                password: this.state.password,
                goToPage: this.goToPage
            })}
        </div>)
    }
}
