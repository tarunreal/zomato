var Zomato = require('./zomato');
console.log(Zomato.callAPI);
var qs = {
    'q':'desi vibes'
}

Zomato.init("b7b54ece20fead34c8c9156027a1cfb2");
Zomato.callAPI('/categories',{},function(b){

    console.log(b);
});
