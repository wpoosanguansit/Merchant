Meteor.Router.beforeRouting = function() {
    Session.set('cartId', findCartId());
};

Deps.autorun(function () {
    var shop = Shops.findOne({uri: Session.get('shopUri')});
    if (shop) {
        Session.set('shopId', shop._id);
        Session.set('shop', shop);
    }
});

Meteor.Router.add({
    '/': function() {
        return 'home';
    },
    '/signup': 'signup',
    '/shop/:shopId/cart/:cartId': {
        as: 'cart',
        to: function(shopUri, cartId) {
            Session.set('shopUri', shopUri);
            Session.set('cartId', cartId);
            return 'cart';
        }
    },
    '/shop/:shop': {
        as: 'shop',
        to: function(shopUri) {
            Session.set('shopUri', shopUri);
            Session.set('currentCategory', null);
            SessionAmplify.load('editMode');
            return 'shop';
        }
    },
    '/shop/:shop/:category': {
        as: 'category',
        to: function(shopUri, categoryName) {
            Session.set('shopUri', shopUri);
            var category = Categories.findOne({name: categoryName})
            Session.set('currentCategory', category ? categoryName : null);
            Session.set('currentPage', 1);
            SessionAmplify.load('editMode');
            return 'shop';
        }
    },
    '/shop/:shop/product/:product': {
        as: 'product',
        to: function(shopUri, productId) {
            Session.set('shopUri', shopUri);
            Session.set('productId', productId);
            SessionAmplify.load('editMode');
            document.title = 'Products of ' + shopUri;
            return 'product';
        }
    },
    '/shop/:shop/account/setting': {
        as: 'accountSetting',
        to: function(shopUri) {
            Session.set('shopUri', shopUri);
            return 'account';
        }
    }
});
