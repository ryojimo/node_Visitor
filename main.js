/**
 * @fileoverview メイン・システム
 * @author       Ryoji Morita
 * @version      0.0.1
*/

// 必要なライブラリをロード
let http     = require('http');
let socketio = require('socket.io');
let fs       = require('fs');
let colors   = require('colors');
require('date-utils');
let schedule = require('node-schedule');
let express  = require('express');

const DataPersons = require('./js/DataPersons');
const DataRoom    = require('./js/DataRoom');


// Ver. 表示
let now = new Date();
console.log("[main.js] " + now.toFormat("YYYY年MM月DD日 HH24時MI分SS秒").rainbow);
console.log("[main.js] " + "ver.01 : app.js".rainbow);
console.log("[main.js] " + "access to http://localhost:2000");

// Express オブジェクトを生成
let ex_app = express();
let ex_server = ex_app.listen(2001, function() {
    console.log("[main.js] " + "Node.js is listening to PORT:" + ex_server.address().port);
});

// サーバー・オブジェクトを生成
let server = http.createServer();

// request イベント処理関数をセット
server.on('request', doRequest);

// 待ち受けスタート
server.listen(process.env.VMC_APP_PORT || 2000);
console.log("[main.js] Server running!");

// request イベント処理
function doRequest(
  req,    // http.IncomingMessage オブジェクト : クライアントからのリクエストに関する機能がまとめられている
  res     // http.serverResponse  オブジェクト : サーバーからクライアントへ戻されるレスポンスに関する機能がまとめられている
){
  switch(req.url) {
  case '/':
    fs.readFile('./app/app.html', 'UTF-8', function(err, data) {
      if(err) {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.write('File Not Found.');
        res.end();
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/html',
                          'Access-Control-Allow-Origin': '*'
                   });
      res.write(data);
      res.end();
    });
  break;
  case '/app.js':
    fs.readFile('./app/app.js', 'UTF-8', function(err, data) {
      res.writeHead(200, {'Content-Type': 'application/javascript',
                          'Access-Control-Allow-Origin': '*'
                   });
      res.write(data);
      res.end();
    });
  break;
  case '/style.css':
    fs.readFile('./app/style.css', 'UTF-8', function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/css',
                          'Access-Control-Allow-Origin': '*'
                   });
      res.write(data);
      res.end();
    });
  break;
  }
}


let io = socketio.listen(server);


//-----------------------------------------------------------------------------
// 起動の処理関数
//-----------------------------------------------------------------------------
let timerFlg;

let persons = new DataPersons();
let room    = new DataRoom();


startSystem();


/**
 * システムを開始する
 * @param {void}
 * @return {void}
 * @example
 * startSystem();
*/
function startSystem() {
  console.log("[main.js] startSystem()");
};


//-----------------------------------------------------------------------------
// クライアントからコネクションが来た時の処理関数 (Express)
//-----------------------------------------------------------------------------
ex_app.get("/api/ranking", function(req, res, next) {
  console.log("[main.js] ex_app.get(\"/api/ranking\")");

  let obj = persons.getRankingTop50(function(err, doc) {
    console.log("[main.js] err     = " + err);
    console.log("[main.js] doc     = " + JSON.stringify(doc));
    res.json(doc);
  });
});


ex_app.get("/api/gid/:gid", function(req, res, next) {
  console.log("[main.js] ex_app.get(\"/api/gid/:gid\")");

  let target = { 'gid': req.params.gid };

  let obj = persons.query(target, function(err, doc) {
    console.log("[main.js] err     = " + err);
    console.log("[main.js] doc     = " + JSON.stringify(doc));
    res.json(doc);
  });
});


ex_app.get("/api/date/:date", function(req, res, next) {
  console.log("[main.js] ex_app.get(\"/api/date/:date\")");

  let target = req.params.date;

  let obj = room.getOneDay(target, function(err, doc) {
    console.log("[main.js] err     = " + err);
    console.log("[main.js] doc     = " + JSON.stringify(doc));
    res.json(doc);
  });
});


//-----------------------------------------------------------------------------
// クライアントからコネクションが来た時の処理関数
//-----------------------------------------------------------------------------
io.sockets.on('connection', function(socket) {

  // 切断したときに送信
  socket.on('disconnect', function() {
    console.log("[main.js] " + 'disconnect');
//  io.sockets.emit('S_to_C_DATA', {value:'user disconnected'});
  });


  // Client to Server
  socket.on('C_to_S_NEW', function(data) {
    console.log("[main.js] " + 'C_to_S_NEW');
  });


  socket.on('C_to_S_DELETE', function(data) {
    console.log("[main.js] " + 'C_to_S_DELETE');
  });


  socket.on('C_to_S_GET_VISITOR', function() {
    console.log("[main.js] " + 'C_to_S_GET_VISITOR');

    let obj = persons.getRankingTop50(function(err, doc) {
      console.log("[main.js] err     = " + err);

      console.log("[main.js] doc     = " + JSON.stringify(doc));
      io.sockets.emit('S_to_C_VISITOR', doc);
    });
  });


  socket.on('C_to_S_GET_VISITOR_ONE_DAY', function(data) {
    console.log("[main.js] " + 'C_to_S_GET_VISITOR_ONE_DAY');
    console.log("[main.js] data.date   = " + data.date);

    let obj = room.getOneDay(data.date, function(err, data) {
//      console.log("[main.js] data     = " + JSON.stringify(data));
      io.sockets.emit('S_to_C_VISITOR_ONE_DAY', {ret:err, value:data});
    });
  });


});


/**
 * 数字が 1 桁の場合に 0 埋めで 2 桁にする
 * @param {number} num - 数値
 * @return {number} num - 0 埋めされた 2 桁の数値
 * @example
 * toDoubleDigits(8);
*/
let toDoubleDigits = function(num) {
//  console.log("[main.js] toDoubleDigits()");
//  console.log("[main.js] num = " + num);
  num += '';
  if(num.length === 1) {
    num = '0' + num;
  }
  return num;
};


/**
 * 現在の日付を YYYY-MM-DD 形式で取得する
 * @param {void}
 * @return {string} day - 日付
 * @example
 * yyyymmdd();
*/
let yyyymmdd = function() {
  console.log("[main.js] yyyymmdd()");
  let date = new Date();

  let yyyy = date.getFullYear();
  let mm   = toDoubleDigits(date.getMonth() + 1);
  let dd   = toDoubleDigits(date.getDate());

  let day = yyyy + '-' + mm + '-' + dd;
  console.log("[main.js] day = " + day);
  return day;
};


/**
 * 現在の時刻を HH:MM:SS 形式で取得する
 * @param {void}
 * @return {string} time - 時刻
 * @example
 * hhmmss();
*/
let hhmmss = function() {
  console.log("[main.js] hhmmss()");
  let date = new Date();

  let hour = toDoubleDigits(date.getHours());
  let min  = toDoubleDigits(date.getMinutes());
  let sec  = toDoubleDigits(date.getSeconds());

  let time = hour + ':' + min + ':' + sec;
  console.log("[main.js] time = " + time);
  return time;
};


