/**
 * ApiController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var http = require('client-http');
///var csvjs = require('csv-json');
var Converter=require("csvtojson").core.Converter;

var cache_manager = require('cache-manager');
var memory_cache = cache_manager.caching({store: 'memory', max: 1000, ttl: 86400/*seconds*/});

module.exports = {


  /**
   * Action blueprints:
   *    `/api/getallbus`
   */
  getallbus: function (req, res) {

    var url = "http://developer.itsmarta.com/BRDRestService/BRDRestService.svc/GetAllBus";
    http.request(url, function(dataStr){
      var data = JSON.parse(dataStr);
      return res.json(data);
    });
  },

  getstop:function (req,res) {
    //new converter instance
    var csvConverter=new Converter();

    //end_parsed will be emitted once parsing finished
    csvConverter.on("end_parsed",function(jsonObj){
       return res.json(jsonObj);
    });

    //read from file
    csvConverter.from('./data/stops.txt');
  },

  getstoptime:function(req,res) {
    var maxAge = 86400; //24 hours
    if (!res.getHeader('Cache-Control'))
      res.setHeader('Cache-Control', 'public, max-age=' + maxAge);

    var id = "stop_times";

    memory_cache.get(id, function (err, result) {

        if (!err && result) {
          console.log(" WE HAVE CACHE")

          return res.json(result);
        } else {
          console.log(" NO CACHE")
          var csvConverter=new Converter();

          //end_parsed will be emitted once parsing finished
          csvConverter.on("end_parsed",function(jsonObj){
            getstoptimeData = jsonObj;

            console.log(" Cache the data")
            memory_cache.set(id, jsonObj);

            return res.json(jsonObj);
          });

          //read from file
          csvConverter.from('./data/stop_times.txt');
        }

    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ApiController)
   */
  _config: {}


};
