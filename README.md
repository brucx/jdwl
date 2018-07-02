# jdwl
京东物流Node SDK

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
