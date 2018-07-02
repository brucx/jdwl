'use strict';
const crypto = require('crypto');
const urllib = require('urllib');

module.exports = class JDWL {

  constructor({ appKey, accessToken, appSecret }) {
    this.endpoint = 'https://api.jd.com/routerjson';
    this.appKey = appKey;
    this.accessToken = accessToken;
    this.appSecret = appSecret;
    this.version = '2.0';
  }

  /**
   * API 签名
   * http://jos.jd.com/doc/channel.htm?id=157
   * @param {Object} data - 参与签名参数，包含系统参数
   * @param {String} appSecret - 京东 APP 密钥
   * @return {String} - 签名
   */
  sign(data) {
    const dataArr = [];
    for (const key in data) {
      dataArr.push(key + data[key]);
    }
    dataArr.sort();
    const md5 = crypto.createHash('md5');
    const signString = this.appSecret + dataArr.join('') + this.appSecret;
    const result = md5.update(signString).digest('hex');
    return result.toUpperCase();
  }

  /**
   * 请求封装
   * @param {String} method - 接口名称
   * @param {Object} data - 业务参数
   * @return {Object} - responce body
   */
  async request({ method, data }) {
    const signData = Object.assign({ '360buy_param_json': JSON.stringify(data) }, {
      v: this.version,
      method,
      timestamp: '2018-06-29 17:27:59',
      access_token: this.accessToken,
      app_key: this.appKey,
    });
    const signedData = Object.assign(signData, { sign: this.sign(signData) });
    try {
      const result = await urllib.request(this.endpoint, {
        method: 'GET',
        data: signedData,
      });
      const dataJson = JSON.parse(result.data);
      return dataJson;
    } catch (err) {
      console.error(err);
    }
  }

  get etms() {
    const request = this.request.bind(this);
    return {
      range: {
        /**
         * 是否可以京配
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.etms.range.check&id=1023
         */
        check() {},
      },
      order: {
        /**
         * 获取京东快递运单打印
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.etms.order.print&id=711
         */
        print() {},
      },
      package: {
        /**
         * 修改京东快递包裹数
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.etms.package.update&id=712
         */
        update() {},
      },
      outerTrace: {
        /**
         * 通过商家编码查询外单全程跟踪
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.etms.outerTrace.queryByBusiId&id=1446
         */
        queryByBusiId() {},
      },
      waybill: {
        /**
         * 青龙接单接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.etms.waybill.send&id=2305
         */
        send() {},
      },
      waybillcode: {
        /**
         * 获取青龙运单号接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.etms.waybillcode.get&id=2311
         * @param {Object} data - { preNum:'100', customerCode: '010K139548', orderType: 0 }
         * @return {Object} - response json
         */
        async get(data) {
          return request({ method: 'jingdong.etms.waybillcode.get', data });
        },
      },
    };
  }

  get ldop() {
    const request = this.request.bind(this);
    return {
      self: { pickup: { sms: {
        /**
         * 重发自提码接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.self.pickup.sms.send&id=2160
         */
        send() {},
      } } },
      receive: {
        order: {
        /**
         * 运单拦截
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.receive.order.intercept&id=1435
         */
          intercept() {},
        },
        trace: {
          /**
           * 查询物流跟踪消息
           * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.receive.trace.get&id=1539
           * @param {Object} data - { customerCode: '010K139548', waybillCode: 'VA45306531675' }
           * @return {Object} - response json
           */
          async get(data) {
            return request({ method: 'jingdong.ldop.receive.trace.get', data });
          },
        },
        pickuporder: {
          /**
           * 取件单下单
           * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.receive.pickuporder.receive&id=1535
           */
          receive() {},
        },
      },
      abnormal: {
        /**
         * 异常单审核
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.abnormal.approval&id=2131
         */
        approval() {},
        /**
         * 查询拒收再投单
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.abnormal.get&id=2132
         */
        get() {},
      },
      waybill: {
        /**
         * 重量包裹数查询接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.waybill.query&id=2189
         */
        query() {},
        /**
         * 电子签名接口查询接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.waybill.querySignatureImage&id=2241
         */
        querySignatureImage() {},
        /**
         * 查询运单信息
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.waybill.generalQuery&id=2397
         * @param {Object} data - { customerCode: '010K139548', deliveryId: 'VA45306531675' }
         * @return {Object} - response json
         */
        async generalQuery(data) {
          return request({ method: 'jingdong.ldop.waybill.generalQuery', data });
        },
        /**
         * 京东物流接单接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.waybill.receive&id=2122
         */
        receive() {},
      },
      center: { api: {
        /**
         * 运单申报
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.center.api.eportdeclare&id=1960
         */
        eportdeclare() {},
        /**
         * 收到支付信息接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.center.api.receivePaymentInfo&id=2242
         */
        receivePaymentInfo() {},
      } },
      middle: { waybill: {
        /**
         * 取件单查询接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.middle.waybill.WaybillPickupApi&id=2349
         */
        WaybillPickupApi() {},
        /**
         * 2C全程物流跟踪接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.middle.waybill.Waybill2CTraceApi&id=2394
         */
        Waybill2CTraceApi() {},
        /**
         * 获取订单实时位置接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.middle.waybill.WaybillTrackAndTimePositionApi&id=2592
         */
        WaybillTrackAndTimePositionApi() {},
      } },
      delivery: {
        /**
         * 送取同步下单接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.delivery.deliveryPickupReceive&id=2447
         */
        deliveryPickupReceive() {},
      },
    };
  }
};
