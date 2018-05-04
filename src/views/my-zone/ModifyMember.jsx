import React from 'react';

import util from '@/libs/util';
import { List, InputItem, Toast, WhiteSpace, WingBlank, Button } from 'antd-mobile';
import { hashHistory } from 'react-router';

export default class ModifyMember extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            user: util.getUserInfo(),
            form: {
                name: null,
                mobile: null
            }
        };
    }
    componentDidMount () {
        util.ajax.get(`/api/member/${this.state.user.id}`).then((response)=>{
            this.setState({
                form: response.data
            })
        })
    }

    quit = () => {
        window.localStorage.accessToken = null;
        window.localStorage.refreshToken = null;
        window.localStorage.expiration = null;
        hashHistory.push('/');
    }

    save = () => {
        util.ajax.post('/api/member', this.state.form).then(() => {
            Toast.success('保存成功', 1);
            util.setUserInfo(this.state.form);
            hashHistory.push('/my-zone');
        })
    }

    render () {
        return (
            <form className="form" onSubmit={(e)=>e.preventDefault}>
                <List renderHeader={() => <b>个人信息</b>}>
                    <InputItem placeholder="请输入姓名" value={this.state.form.name} onChange={(v)=>{
                        this.setState((prevState, props) => ({
                            form: Object.assign(prevState.form, {
                                name: v
                            })
                        }));
                    }}>姓名</InputItem>
                    <InputItem placeholder="请输入手机号" value={this.state.form.mobile} onChange={(v)=>{
                        this.setState((prevState, props) => ({
                            form: Object.assign(prevState.form, {
                                mobile: v
                            })
                        }));
                    }}>手机号</InputItem>
                    <List.Item arrow="horizontal" onClick={this.quit}>退出</List.Item>
                </List>
                <WhiteSpace size="lg"></WhiteSpace>
                <WingBlank><Button type="primary" onClick={this.save}>保存</Button></WingBlank>
            </form>
        );
    }
}

