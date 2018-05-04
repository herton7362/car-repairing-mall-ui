import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory, IndexRoute } from 'react-router';
import util from '@/libs/util';

import Main from './views/Main'
import App from './views/App';
import Login from './views/Login';
import Vehicle from './views/vehicle/Vehicle';
import ModifyMember from './views/my-zone/ModifyMember';
import SprayPaint from './views/spray-paint/SprayPaint';
import OrderForm from './views/order-form/OrderForm';
import OrderFormDetail from './views/order-form/Detail';
import Tyre from './views/tyre/Tyre';
import Maintenance from './views/maintenance/Maintenance';

import './index.less';

const requireAuth = (nextState, replace) => {
    if (!util.hasLogin()) {
        replace({ pathname: '/login' })
    }
}
util.ajax.get('/user/info').then((response)=>{
    util.setUserInfo(response.data);
    ReactDOM.render(
        <Router history={hashHistory}>
            <Route path="/" component={App}>
                <IndexRoute component={Main} />
                <Route path="login" component={Login} />
                <Route path="vehicle" component={Vehicle} onEnter={requireAuth}/>
                <Route path="vehicle/:id" component={Vehicle} onEnter={requireAuth}/>
                <Route path="member/:id" component={ModifyMember} onEnter={requireAuth}/>
                <Route path="sprayPaint" component={SprayPaint} onEnter={requireAuth}/>
                <Route path="tyre" component={Tyre} onEnter={requireAuth}/>
                <Route path="maintenance" component={Maintenance} onEnter={requireAuth}/>
                <Route path="orderForm" component={OrderForm} onEnter={requireAuth}/>
                <Route path="orderForm/:id" component={OrderFormDetail} onEnter={requireAuth}/>
                <Route path=":selectedTab" component={Main} />
            </Route>
        </Router>
        , document.getElementById('app'));
})

