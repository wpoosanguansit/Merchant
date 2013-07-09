Meteor.methods({
    findShopId: function(shopUri) {
        console.log('server', shopUri);
        var shop = Shops.findOne({
            uri: shopUri
        });
        console.log(shop);
        return shop._id;
    },

    createShop: function(params) {
        if (! this.userId)
            throw new Meteor.Error(403, "You must be logged in");
        var shopId = Shops.insert({
            name: params.name,
            uri: params.uri,
            userId: this.userId
        });

        Products.insert({
            shopId: shopId,
            name: 'beeswax tea lights',
            price: 11.50,
            description: "This cute pendant is Cohen Gum's abominaball design, taken over by Minnette Michael and turned wearable. \nIt is made from hand cut (no laser-cutting here) brass that has been powder-coated black and is hanging on a long (approx 75cm) sterling silver chain. ",
            images: []
        });

        Products.insert({
            shopId: shopId,
            name: 'flour + sugar scoop',
            price: 200.00,
            description: "L-R in 1st photo: maple, sumac, maple, yellow cedar\nhand carved + one of a kind",
            images: []
        });

        return shopId;
    },

    createProduct: function(shopId, params) {
        params = params || {};
        if (! this.userId)
            throw new Meteor.Error(403, "You must be logged in");
        var total = Products.find({ shopId: shopId }).count();
        var cnt = params.cnt || 1;
        var results = [];
        var images = [];
        if (params.uploadFlag) {
            images = [params.uploadProgressImage];
        }
        for (var i = 0; i < cnt; i++) {
            var _id = Products.insert({
                shopId: shopId,
                name: params.name || 'flour + sugar scoop',
                price: params.price || 200.00,
                description: params.description || "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.",
                images: images,
                position: ++total
            });
            results.push(_id);
        }
        return results;
    },

    createCategory: function(name, shopId) {
        if (! this.userId)
            throw new Meteor.Error(403, "You must be logged in");

        if (!name)
            throw new Meteor.Error(400, "Missing required parameters");

        var shop = Shops.findOne(shopId);
        if (this.userId !== shop.userId)
            throw new Meteor.Error(401, "You are not an owner of a shop");

        var total = Categories.find({ shopId: shopId }).count();
        Categories.insert({
            name: name,
            shopId: shopId,
            position: ++total
        });
    },

    updateCategory: function(categoryId, shopId, params) {
        if (! this.userId)
            throw new Meteor.Error(403, "You must be logged in");

        var shop = Shops.findOne(shopId);
        if (this.userId !== shop.userId)
            throw new Meteor.Error(401, "You are not an owner of a shop");

        Categories.update(categoryId, {"$set": params});
    },

    removeCategory: function(categoryId, shopId) {
        if (! this.userId)
            throw new Meteor.Error(403, "You must be logged in");

        var shop = Shops.findOne(shopId);
        if (this.userId !== shop.userId)
            throw new Meteor.Error(401, "You are not an owner of a shop");

        Categories.remove(categoryId);
        Products.update({ categories: categoryId },
            { '$pull': { categories: categoryId } },
            { multi: true });
    }
});


Products.allow({
    insert: function (userId, product) {
        return false; // no cowboy inserts -- use createProduct method
    },
    update: function (userId, product, fields, modifier) {
        var shop = Shops.findOne(product.shopId);
        if (userId !== shop.userId)
            return false; // not the owner

        var allowed = ["name", "description", "price", "images", "position", "categories", "video", "audio", "location"];
        if (_.difference(fields, allowed).length)
            return false; // tried to write to forbidden field

        // A good improvement would be to validate the type of the new
        // value of the field (and if a string, the length.) In the
        // future Meteor will have a schema system to makes that easier.
        return true;
    },
    remove: function (userId, product) {
        // You can only remove products that you created and nobody is going to.
        var shop = Shops.findOne(product.shopId);
        return shop.userId === userId;
    }
});

Meteor.publish('shops', function(shopUri) {
    return Shops.find({
        uri: shopUri
    });
});

Meteor.publish('products', function(shopId) {
    return Products.find({
        shopId: shopId
    });
});

Meteor.publish('categories', function(shopId) {
    return Categories.find({
        shopId: shopId
    });
});

