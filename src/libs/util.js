import axios from 'axios';
import env from '../../build/env';

let util = {

};
util.title = function (title) {
    title = title || '鼎骏医车';
    window.document.title = title;
};

const ajaxUrl = env === 'development'
    ? 'http://127.0.0.1:8080'
    : env === 'production'
        ? 'https://repair-api.djrentcar.com'
        : 'https://debug.url.com';

util.client_id = env === 'development' ? 'tonr' : 'tonr';
util.client_secret = env === 'development' ? 'secret' : 'secret';

util.baseURL = ajaxUrl;

util.ajax = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// 添加请求拦截器
util.ajax.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    let token = localStorage.accessToken;

    if (util.hasLogin()) {
        config.params = {
            access_token: token,
            ...config.params
        };
    }

    return config;
}, function (error) {
    return Promise.reject(error);
});

util.hasLogin = function () {
    return !!localStorage.accessToken && new Date().getTime() < window.localStorage.expiration - 10 * 1000;
};

util.inOf = function (arr, targetArr) {
    let res = true;
    arr.forEach(item => {
        if (targetArr.indexOf(item) < 0) {
            res = false;
        }
    });
    return res;
};

util.oneOf = function (ele, targetArr) {
    return targetArr.indexOf(ele) >= 0;
};

util.transformTreeData = function (data, titleKey, defaultExpanded = true) {
    let [map, roots, node] = [{}, []];
    data.forEach((d) => {
        if (titleKey) {
            d.title = d[titleKey];
            d.label = d[titleKey];
        }
        d.expand = d.expand || defaultExpanded;
        map[d.id] = d;
        if ((!d.parent || !d.parent.id) && !d.parentId) {
            roots.push(d);
        }
    });

    for (let key of Object.getOwnPropertyNames(map)) {
        node = map[key];
        if (!node.parent && !node.parentId) {
            continue;
        }
        let parent = map[(node.parent && node.parent.id) || node.parentId];
        if (!parent) {
            roots.push(node);
            continue;
        }
        parent.children = parent.children || [];
        if (!util.oneOf(node, parent.children)) {
            parent.children.push(node);
        }
    }
    return roots;
};

util.bytesToSize = function (bytes) {
    if (!bytes) return '0 B';

    let k = 1024;

    let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    let i = Math.floor(Math.log(bytes) / Math.log(k));

    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

util.executeGenerator = function (gen) {
    let g = gen();

    function next (data) {
        var result = g.next(data);
        if (result.done) return result.value;
        result.value.then(function (data) {
            next(data);
        });
    }

    next();
};

util.dateToLong = function (date) {
    return date ? new Date(date).getTime() : null;
};

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
util.dateFormat = function (date, fmt = 'yyyy-MM-dd') {
    let o = {
        'M+': date.getMonth() + 1,                 // 月份
        'd+': date.getDate(),                    // 日
        'H+': date.getHours(),                   // 小时
        'm+': date.getMinutes(),                 // 分
        's+': date.getSeconds(),                 // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        'S': date.getMilliseconds()             // 毫秒
    };
    if (/(y+)/.test(fmt)) { fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length)); }
    for (let k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) { fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))); }
    }
    return fmt;
};

util.dateTimeFormat = function (date, fmt = 'yyyy-MM-dd HH:mm:ss') {
    return util.dateFormat(date, fmt);
};

util.dateFormatPretty = function (date) {
    let second = 1000;
    let minutes = second * 60;
    let hours = minutes * 60;
    let days = hours * 24;
    let months = days * 30;
    let myDate = date;
    let nowtime = new Date();
    let longtime = nowtime.getTime() - myDate.getTime();
    if (longtime > months * 2) {
        return date.format('yyyy-MM-dd HH:mm:ss');
    } else if (longtime > months) {
        return '1个月前';
    } else if (longtime > days * 7) {
        return ('1周前');
    } else if (longtime > days) {
        return (Math.floor(longtime / days) + '天前');
    } else if (longtime > hours) {
        return (Math.floor(longtime / hours) + '小时前');
    } else if (longtime > minutes) {
        return (Math.floor(longtime / minutes) + '分钟前');
    } else if (longtime > second) {
        return (Math.floor(longtime / second) + '秒前');
    } else {
        return (longtime + ' error ');
    }
};

util.formatMoney = function (s, n = 2) {
    function isNull() {
        return '0' + (n > 0? '.': '') + '0'.repeat(n);
    }
    if (!s && s !== 0) {
        return isNull();
    }
    n = n > 0 && n <= 20 ? n : 2;
    s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
    let l = s.split(".")[0].split("").reverse(),
        r = s.split(".")[1];
    let t = "";
    for (let i = 0; i < l.length; i++) {
        t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
    }
    if (t.split("").reverse().join("")) {
        return t.split("").reverse().join("") + "." + r;
    } else {
        return isNull();
    }
}

let user = null;

util.getUserInfo = () => {
    return user;
}

util.setUserInfo = (u) => {
    user = u;
}

util.getQueryString = function (name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r !== null)return  decodeURI(r[2]); return null;
};

export default util;
