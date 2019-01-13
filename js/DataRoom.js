/**
 * @fileoverview データクラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
require('date-utils');

const ApiCmn = require('./ApiCmn');
let g_apiCmn = new ApiCmn();


/**
 * データ class
 * @param {void}
 * @constructor
 * @example
 * let obj = new DataRoom();
*/
class DataRoom {

  constructor(jsonObj) {
    this.data = {
      cnt: 0,             // @type {number} : 総入場者数
    };

    this.data = jsonObj;
  }


  /**
   * this.data を取得する。
   * @param {void}
   * @return {object} - this.data
   * @example
   * get();
  */
  get() {
    return this.data;
  }


  /**
   * this.data に値をセットする。
   * @param {object} - セットする json 形式のデータ
   * @return {void}
   * @example
   * set();
  */
  set(jsonObj) {
    this.data = jsonObj;
  }


  /**
   * this.data.cnt を更新する。
   * @param {void}
   * @return {void}
   * @example
   * updateCnt();
  */
  updateCnt() {
    console.log("[DataRoom.js] updateCnt()");
    this.data.cnt++;
  }


};


module.exports = DataRoom;


