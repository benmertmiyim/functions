require('dotenv').config();

const functions = require("firebase-functions");

var Iyzipay = require('iyzipay');

const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

var db = admin.firestore();



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

exports.rating = functions.firestore
    .document('vendors/{userId}/ratings/{ratingId}')
    .onWrite( async (change, context) => {
       
        let totalSecurity = 0;
        let totalAccessibility = 0;
        let totalServiceQuality = 0;
        let count = 0;

        let path = 'vendors/' + context.params.userId + '/ratings';
        let collecRef = db.collection(path);
        let allComm = await collecRef.get().then(snapshot => {

            snapshot.forEach(doc => {
                let document = doc.data();
                totalSecurity += document.security;
                totalAccessibility += document.accessibility;
                totalServiceQuality += document.serviceQuality;
                count += 1;
            });

        }).catch(err => {
            console.log('Error getting documents', err);
        });

        if(count != 0){
            totalAccessibility = totalAccessibility / count;
            totalSecurity = totalSecurity / count;
            totalServiceQuality = totalServiceQuality / count;
        }
        
        let rating = (totalAccessibility + totalSecurity + totalServiceQuality) / 3;
        
        let vendorRef = db.collection('vendors').doc(context.params.userId);
        vendorRef.update({"security":totalSecurity,"accessibility":totalAccessibility,"serviceQuality":totalServiceQuality,"rating":rating});
        return null;
    });

exports.addVendor = functions.firestore.document('vendors/{userId}')
.onCreate( async (change, context) => {
    let vendorRef = db.collection('vendors').doc(context.params.userId);
    vendorRef.update({"active":false,"img_list":[],"hourly_price":10,"start_price":10,"accessibility":5,"rating":5,"security":5,"serviceQuality":5});
    return null;
});
