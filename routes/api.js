const fs = require("fs")
const express = require('express');
const router = express.Router();
const gma = require("../service/GoogleMapApiService")

const SEARCH_RADIUS = 10;
const MINIMAN_NEED_SHOPLIST_LENGHT = 10;
const MAX_SEARCH_REQUEST_RADIUS = 400;

function responseShopList(res,origin,destination,radius){
	let promiseProcess = gma.init(origin,destination,radius);

	promiseProcess
	.then(function(data){
		var shopListArray = new Array();

		for(var i in data){
			Array.prototype.push.apply(shopListArray,data[i])
		}

		if(shopListArray.length < MINIMAN_NEED_SHOPLIST_LENGHT){
			console.log("半径"+radius+"m")
			console.log(shopListArray.length+"個のデータが見つかりました。\n");
			if(radius < MAX_SEARCH_REQUEST_RADIUS){
				radius += SEARCH_RADIUS;
				responseShopList(res,origin,destination,radius);
			}else{
				res.json({
					shopList: [],
					statusCode: 404,
					errMessage: "お店が見つかりませんでした。"
				})
			}
		}else{
			res.json({
				shopList: shopListArray,
				statusCode: 200,
				errMessage: null
			})
		}

	}).catch(function(err){
		console.log(err)
	})
}

router.get('/', function(req, res) {
	const origin = req.query.origin
	const destination = req.query.destination

	responseShopList(res,origin,destination,SEARCH_RADIUS)

});

router.get("/detail",function(req,res){
	const placeId = req.query.placeid;

	const promiseProcess = gma.getShopDetail(placeId);

	promiseProcess
	.then(function(data){
		res.json({
			shopDetail: data
		})
	})
	.catch(function(err){
		throw new Error(err);
	})

})

router.post("/share",function(req,res){

	const jsonData = req.body.route;
	const uuid = req.body.uuid

	fs.writeFile("store/"+uuid+'.json', JSON.stringify(jsonData, null, '    '));

	res.json({
		write: true
	})

})

module.exports = router;