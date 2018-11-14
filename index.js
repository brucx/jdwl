'use strict';
const crypto = require('crypto');
const urllib = require('urllib');
const moment = require('moment');

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
   * @param {Object} data 参与签名参数，包含系统参数
   * @return {String} 签名
   */
  sign(data) {
    const signString = [
      this.appSecret, 
      ...Object.entries(data).map(([key, value]) => `${key}${value}`).sort(),
      this.appSecret
    ].join('');
    return crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
  }

  /**
   * 请求封装
   * @param {String} method 接口名称
   * @param {Object} data 业务参数
   * @return {Promise} responce body
   */
  async request({ method, data }) {
    const signData = {
      '360buy_param_json': JSON.stringify(data),
      v: this.version,
      method,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      access_token: this.accessToken,
      app_key: this.appKey,
    };
    const signedData = { ...signData, sign: this.sign(signData) };
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
         * @param {Object} data { 平台信息, 货物相关信息, 收货人信息, 发货人信息等 }
         * @return {Promise} response json
         * @deprecated
         */
        async check(data) {
          const res = await request({ method: 'jingdong.etms.range.check', data });
          return res.jingdong_etms_range_check_responce;
        },
      },
      order: {
        /**
         * 获取京东快递运单打印
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.etms.order.print&id=711
         * @param {Object} data { customerCode, deliveryId }
         * @return {Promise} response json
         */
        async print(data) {
          const res = await request({ method: 'jingdong.etms.order.print', data });
          return res.jingdong_etms_order_print_responce;
        },
      },
      package: {
        /**
         * 修改京东快递包裹数
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.etms.package.update&id=712
         * @param {Object} data { customerCode, deliveryId, packageCount }
         * @return {Promise} response json
         */
        async update(data) {
          const res = await request({ method: 'jingdong.etms.package.update', data });
          return res.jingdong_etms_package_update_responce;
        },
      },
      outerTrace: {
        /**
         * 通过商家编码查询外单全程跟踪
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.etms.outerTrace.queryByBusiId&id=1446
         * @param {Object} data { outerCode, busiId }
         * @return {Promise} response json
         */
        async queryByBusiId(data) {
          const res = await request({ method: 'jingdong.etms.outerTrace.queryByBusiId', data });
          return res.jingdong_etms_outerTrace_queryByBusiId_responce;
        },
      },
      waybill: {
        /**
         * 青龙接单接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.etms.waybill.send&id=2305
         * @param {Object} data { deliveryId, salePlat, customerCode, orderId, senderName, senderAddress, receiveName, receiveAddress, packageCount, weight, vloumn }
         * @return {Promise} response json
         * @deprecated
         */
        async send(data) {
          const res = await request({ method: 'jingdong.etms.waybill.send', data });
          return res.jingdong_etms_waybill_send_responce;
        },
      },
      waybillcode: {
        /**
         * 获取青龙运单号接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.etms.waybillcode.get&id=2311
         * @param {Object} data { preNum:'100', customerCode: '010K139548', orderType: 0 }
         * @return {Promise} response json
         * @deprecated
         */
        async get(data) {
          const res = await request({ method: 'jingdong.etms.waybillcode.get', data });
          return res.jingdong_etms_waybillcode_get_responce;
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
         * @param {Object} data { waybillCode, customerCode }
         * @return {Promise} response json
         */
        async send(data) {
          const res = await request({ method: 'jingdong.ldop.self.pickup.sms.send', data });
          return res.jingdong_ldop_self_pickup_sms_send_responce;
        },
      } } },
      receive: {
        order: {
        /**
         * 运单拦截
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.receive.order.intercept&id=1435
         * @param {Object} data { vendorCode, deliveryId, interceptReason }
         * @return {Promise} response json
         */
          async intercept(data) {
            const res = await request({ method: 'jingdong.ldop.receive.order.intercept', data });
            return res.jingdong_ldop_receive_order_intercept_responce;
          }
        },
        trace: {
          /**
           * 查询物流跟踪消息
           * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.receive.trace.get&id=1539
           * @param {Object} data { customerCode: '010K139548', waybillCode: 'VA45306531675' }
           * @return {Promise} response json
           */
          async get(data) {
            const res = await request({ method: 'jingdong.ldop.receive.trace.get', data });
            return res.jingdong_ldop_receive_trace_get_responce;
          },
        },
        pickuporder: {
          /**
           * 取件单下单
           * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.receive.pickuporder.receive&id=1535
           * @param {Object} data { 取件人相关信息，商家相关信息，物品相关信息等 }
           * @return {Promise} response json
           */
          async receive(data) {
            const res = await request({ method: 'jingdong.ldop.receive.pickuporder.receive', data });
            return res.jingdong_ldop_receive_pickuporder_receive_responce;
          },
        },
      },
      abnormal: {
        /**
         * 异常单审核
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.abnormal.approval&id=2131
         * @param {Object} data { customerCode, deliveryId, responseComment, type }
         * @return {Promise} response json
         */
        async approval(data) {
          const res = await request({ method: 'jingdong.ldop.abnormal.approval', data });
          return res.jingdong_ldop_abnormal_approval_responce;
        },

        /**
         * 查询拒收再投单
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.abnormal.get&id=2132
         * @param {Object} data { customerCode：'010K139548' }
         * @return {Promise} response json
         */
        async get(data) {
          const res = await request({ method: 'jingdong.ldop.abnormal.get', data });
          return res.jingdong_ldop_abnormal_get_responce;
        },
      },
      waybill: {
        /**
         * 重量包裹数查询接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.waybill.query&id=2189
         * @param {Object} data { deliveryId: 'VA45306531675', customerCode: '010K139548' }
         * @return {Promise} response json
         */
        async query(data) {
          const res = await request({ method: 'jingdong.ldop.waybill.query', data });
          return res.jingdong_ldop_waybill_query_responce;
        },

        /**
         * 电子签名接口查询接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.waybill.querySignatureImage&id=2241
         * @param {Object} data { deliveryId: 'VA45306531675', customerCode: '010K139548' }
         * @return {Promise} response json
         */
        async querySignatureImage(data) {
          const res = await request({ method: 'jingdong.ldop.waybill.querySignatureImage', data });
          return res.jingdong_ldop_waybill_querySignatureImage_responce;
        },

        /**
         * 查询运单信息
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.waybill.generalQuery&id=2397
         * @param {Object} data { customerCode: '010K139548', deliveryId: 'VA45306531675' }
         * @return {Promise} response json
         */
        async generalQuery(data) {
          const res = await request({ method: 'jingdong.ldop.waybill.generalQuery', data });
          return res.jingdong_ldop_waybill_generalQuery_responce;
        },

        /**
         * 京东物流接单接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.waybill.receive&id=2122
         * @param {Object} data { salePlat, customerCode, orderId, senderName, senderAddress, senderMobile, senderTel, receiveName, receiveAddress, receiveMobile, packageCount, weight, vloumn }
         * @return {Promise} response json
         */
        async receive(data) {
          const res = await request({ method: 'jingdong.ldop.waybill.receive', data });
          return res.jingdong_ldop_waybill_receive_responce;
        },
      },
      center: { api: {
        /**
         * 运单申报
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.center.api.eportdeclare&id=1960
         * @param {Object} data { 平台信息,货物相关信息,收货人信息,发货人信息等 }
         * @return {Promise} response json
         */
        async eportdeclare(data) {
          const res = await request({ method: 'jingdong.ldop.center.api.eportdeclare', data });
          return res.jingdong_ldop_center_api_eportdeclare_responce;
        },

        /**
         * 收到支付信息接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.center.api.receivePaymentInfo&id=2242
         * @param {Object} data { deliveryId, customerCode, recMoney, receivedMoney, paymentState, paymentTime, payer }
         * @return {Promise} response json
         */
        async receivePaymentInfo(data) {
          const res = await request({ method: 'jingdong.ldop.center.api.receivePaymentInfo', data });
          return res.jingdong_ldop_center_api_receivePaymentInfo_responce;
        },
      } },
      middle: { waybill: {
        /**
         * 取件单查询接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.middle.waybill.WaybillPickupApi&id=2349
         * @param {Object} data { vendorCode, pickupCode }
         * @return {Promise} response json
         */
        async WaybillPickupApi(data) {
          const res = await request({ method: 'jingdong.ldop.middle.waybill.WaybillPickupApi', data });
          return res.jingdong_ldop_middle_waybill_WaybillPickupApi_responce;
        },

        /**
         * 2C全程物流跟踪接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.middle.waybill.Waybill2CTraceApi&id=2394
         * @param {Object} data { tradeCode, waybillCode }
         * @return {Promise} response json
         */
        async Waybill2CTraceApi(data) {
          const res = await request({ method: 'jingdong.ldop.middle.waybill.Waybill2CTraceApi', data });
          return res.jingdong_ldop_middle_waybill_Waybill2CTraceApi_responce;
        },

        /**
         * 获取订单实时位置接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.middle.waybill.WaybillTrackAndTimePositionApi&id=2592
         * @param {Object} data { waybillCode, gpsTime, customerCode }
         * @return {Promise} response json
         */
        async WaybillTrackAndTimePositionApi(data) {
          const res = await request({ method: 'jingdong.ldop.middle.waybill.WaybillTrackAndTimePositionApi', data });
          return res.jingdong_ldop_middle_waybill_WaybillTrackAndTimePositionApi_responce;
        },
      } },
      delivery: {
        /**
         * 送取同步下单接口
         * http://jos.jd.com/api/detail.htm?apiName=jingdong.ldop.delivery.deliveryPickupReceive&id=2447
         * @param {Object} data { josPin, salePlat, customerCode, orderId, senderName, senderAddress, receiveName, receiveAddress, packageCount, weight, vloumn, customerTel, backAddress, customerContract, pickupOrderId, productName, productCount }
         * @return {Promise} response json
         */
        async deliveryPickupReceive(data) {
          const res = await request({ method: 'jingdong.ldop.delivery.deliveryPickupReceive', data });
          return res.jingdong_ldop_delivery_deliveryPickupReceive_responce;
        },
      },
    };
  }
};
