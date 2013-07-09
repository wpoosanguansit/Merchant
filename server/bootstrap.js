Shops = new Meteor.Collection('shops');
Products = new Meteor.Collection('products');
Carts = new Meteor.Collection('carts');
Orders = new Meteor.Collection('orders');
Categories = new Meteor.Collection('categories');

if (Shops.find().count() === 0) {
    var userId = Accounts.createUser({
        "username" : "admin@bon.co.th",
        "email" : "admin@bon.co.th",
        "password": 'bonuser'
    });

    var shopId = Shops.insert({
        name: 'Business on Network',
        uri: 'bon',
        userId: userId,
        stripeKey: 'pk_test_nwr9kDFvUzK6IrbkDnpabteU'
    });
    Shops.insert({
        name: 'Opendream',
        uri: 'opendream'
    });

    Products.insert({
        shopId: shopId,
        name: 'beeswax tea lights',
        price: 11.50,
        description: "This cute pendant is Cohen Gum's abominaball design, taken over by Minnette Michael and turned wearable. \nIt is made from hand cut (no laser-cutting here) brass that has been powder-coated black and is hanging on a long (approx 75cm) sterling silver chain. "
    });

    Products.insert({
        shopId: shopId,
        name: 'HG market tote',
        price: 11.50,
        description: "untreated and unbleached flat bottom and gusseted sides hand wash in cold water only "
    });

    Products.insert({
        shopId: shopId,
        name: 'beeswax tea lights',
        price: 11.50,
        description: "This cute pendant is Cohen Gum's abominaball design, taken over by Minnette Michael and turned wearable. \nIt is made from hand cut (no laser-cutting here) brass that has been powder-coated black and is hanging on a long (approx 75cm) sterling silver chain. "
    });

    Products.insert({
        shopId: shopId,
        name: 'beeswax tea lights',
        price: 11.50,
        description: "This cute pendant is Cohen Gum's abominaball design, taken over by Minnette Michael and turned wearable. \nIt is made from hand cut (no laser-cutting here) brass that has been powder-coated black and is hanging on a long (approx 75cm) sterling silver chain. "
    });

}