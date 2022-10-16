require('dotenv').config();

const functions = require("firebase-functions");

var Iyzipay = require('iyzipay');

var iyzipay = new Iyzipay({
    apiKey: process.env.APIKEY,
    secretKey: process.env.SECRETKEY,
    uri: process.env.URI,
});

exports.pay = functions.https.onRequest(async (req, res) => {
    if(req.method == "POST"){
        var request = {
            locale: Iyzipay.LOCALE.TR,
            price: req.body.price,
            paidPrice: req.body.price,
            currency: Iyzipay.CURRENCY.TRY,
            installment: '1',
            paymentChannel: Iyzipay.PAYMENT_CHANNEL.MOBILE,
            paymentCard: {
                cardUserKey: req.body.cardUserKey,
                cardToken: req.body.cardToken,
            },
            buyer: {
                id: req.body.uid,
                name: req.body.name,
                surname: req.body.surname,
                gsmNumber: req.body.gsmNumber,
                email: req.body.email,
                identityNumber: req.body.identityNumber,
                registrationAddress: req.body.address,
                ip: req.body.ip,
                city: req.body.city,
                country: req.body.country,  
            },
            shippingAddress: {
                contactName: req.body.name + req.body.surname,
                city: req.body.city,
                country: req.body.country,  
                address: req.body.address,
            },
            billingAddress: {
                contactName: req.body.name + req.body.surname,
                city: req.body.city,
                country: req.body.country,  
                address: req.body.address,
            },
            basketItems: [
                {
                    id: 'park_odeme_id',
                    name: 'Park Ödeme',
                    category1: 'Hizmet',
                    itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                    price: req.body.price
                }
            ]
        };
        
        iyzipay.payment.create(request, function (err, result) {
            if (err) {
                return res.send(err);
            } else {
                return res.send(result);
            }
        });
    }else{
        return res.send("unauthorized attempt");
    }
});

exports.regCard = functions.https.onRequest(async (req, res) => {
    if(req.method == "POST"){
        iyzipay.card.create({
            locale: Iyzipay.LOCALE.TR,
            email: req.body.email,
            cardUserKey: req.body.cardUserKey,
            card: {
                cardAlias: req.body.cardAlias,
                cardHolderName: req.body.cardHolderName,
                cardNumber: req.body.cardNumber,
                expireMonth: req.body.expireMonth,
                expireYear: req.body.expireYear
            }
        }, function (err, result) {
            if (err) {
                return res.send(err);
            } else {
                return res.send(result);
            }
        });
    }else{
        return res.send("unauthorized attempt");
    }
});

exports.getCards = functions.https.onRequest(async (req, res) => {
    if(req.method == "POST"){
        iyzipay.cardList.retrieve({
            locale: Iyzipay.LOCALE.TR,
            cardUserKey: req.body.cardUserKey,
        }, function (err, result) {
            if (err) {
                return res.send(err);
            } else {
                return res.send(result);
            }
        });
    }else{
        return res.send("unauthorized attempt");
    }
});

exports.delCard = functions.https.onRequest(async (req, res) => {
    if(req.method == "POST"){
        iyzipay.card.delete({
            locale: Iyzipay.LOCALE.TR,
            cardToken: req.body.cardToken,
            cardUserKey: req.body.cardUserKey,
        }, function (err, result) {
            if (err) {
                return res.send(err);
            } else {
                return res.send(result);
            }
        });
    }
    else{
        return res.send("unauthorized attempt");
    }
});