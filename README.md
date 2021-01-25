# jdwl ![NPM version](https://badge.fury.io/js/jdwl.png)
[京东物流](http://jos.jd.com/api/list.htm?id=64) Node SDK 

Access Token 获取
https://open.jd.com/home/home#/doc/common?listId=880

获取 Code

```
https://open-oauth.jd.com/oauth2/to_login?app_key=APP_KEY&response_type=code&redirect_uri=http://localhost:7001/api/v3/logistics/callback&state=20180416&scope=snsapi_base
```

获取 Access Token

```
https://open-oauth.jd.com/oauth2/access_token?app_key=APP_KEY&app_secret=APP_SECRET&grant_type=authorization_code&code=1yxNgo
```

安装：

```
npm i jdwl
```

示例：

```
const JDWL = require('jdwl');

const jingdong = new JDWL({
  appKey:'123456780233FA31AD94AA59CFA65305',
  appSecret:'yourappSecret',
  accessToken:'12345678-b0e1-4d0c-9d10-a998d9597d75'
});

jingdong.ldop.receive.trace.get({ customerCode: '010K123456', waybillCode: 'VA45306123456' }).then(data => {
  console.dir(JSON.stringify(data));
});

jingdong.etms.waybillcode.get({ preNum: '100', customerCode: '010K123456', orderType: 0 }).then(data => {
  console.dir(JSON.stringify(data));
});
```
