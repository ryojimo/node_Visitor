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
 * let obj = new DataPerson();
*/
class DataPerson {

  constructor(jsonObj) {
    this.data = {
      gid: "",            // @type {string} : 訪問者の Global ID
      name: "",           // @type {string} : 訪問者の名前
      cnt: 0,             // @type {number} : 訪問回数
      lastVisitDay: "",   // @type {string} : 最後に来た日にち
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
   * this.data.cnt, this.data.lastVisiteDay を更新する。
   * @param {void}
   * @return {void}
   * @example
   * updateCnt();
  */
  updateCnt() {
    console.log("[DataPerson.js] updateCnt()");

    this.data.cnt++;
    this.lastVisitDay = g_apiCmn.yyyymmdd();
  }


};


/**
 * コレクションの全ドキュメントに対して query に一致するドキュメントを問い合わせる。
 * @param {Object} query - 問い合わせの情報
 * @param {function(boolean, Object)} callback - データを取得するためのコールバック関数
 * @return {void}
 * @example
 * query( {'gid': 0000114347}, function( err, doc ){} );
*/
DataPerson.prototype.query = function( query, callback ){
  console.log( "[DataPerson.js] query()" );
  console.log( "[DataPerson.js] query = " + JSON.stringify(query) );

  MongoClient.connect( this.mongo_url, function(err, db){
    if( err ) throw err;

    let dbo = db.db( 'persons' );           // データベースを取得する
    let clo = dbo.collection( 'visitor' );  // コレクションを取得する

    clo.find( query ).toArray( function(err, docs){
      try{
        if( err ) throw err;

        db.close();
        console.log( "[DataPerson.js] docs.length = " + docs.length );
//        console.log( "[DataPerson.js] docs        = " + JSON.stringify(docs) );
        callback( true, docs );
      }
      catch( e ){
        console.log( "[DataPerson.js] e = " + e + " : " + e.message );
        db.close();
        callback( false, docs );
      }
    });
  });
}


/**
 * 訪問回数が多い Top 50 を取得する
 * @param {function(boolean, Object)} callback - データを取得するためのコールバック関数
 * @return {void}
 * @example
 * getRankingTop50( function( err, doc ){} );
*/
DataPerson.prototype.getRankingTop50 = function( callback ){
  console.log( "[DataPerson.js] getRankingTop50()" );

  MongoClient.connect( this.mongo_url, function(err, db){
    if( err ) throw err;

    let dbo = db.db( 'persons' );           // データベースを取得する
    let clo = dbo.collection( 'visitor' );  // コレクションを取得する

    let sort = { cnt: -1 };

    // ドキュメントを取得する
    clo.find( {}, {sort:{cnt: -1}, limit:50} ).toArray( function(err, docs){
      try{
        if (err) throw err;

        db.close();
        console.log( "[DataPerson.js] docs.length = " + docs.length );
//        console.log( "[DataPerson.js] docs = " + JSON.stringify(docs) );
        callback( true, docs );
      }
      catch( e ){
        console.log( "[DataPerson.js] e = " + e + " : " + e.message );
        db.close();
        callback( false, docs );
      }
    });
  });
}


module.exports = DataPerson;


