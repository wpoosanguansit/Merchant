Shops = new Meteor.Collection('shops');
Products = new Meteor.Collection('products');
Carts = new Meteor.Collection('carts');
Categories = new Meteor.Collection('categories');

var isHomepage = function () {
    return Meteor.Router.page() == 'home'
};

Template.body.isHomepage = function () {
    return isHomepage();
};

Template.body.isNotHomepage = function () {
    return !isHomepage();
}

Template.body.rendered = function () {
    if (!isHomepage()) return;
    
    var images = [
        '/images/sample/home-0.jpg',
        '/images/sample/home-1.jpg',
        '/images/sample/home-2.jpg',
    ];
    //  , url = 'http://api.flickr.com/services/rest?method=flickr.photos.search&api_key=&license=4&privacy_filter=1&content_type=1&extras=url_o&format=json&per_page=5&jsoncallback=?';

    $.backstretch(images, {duration: 8000, fade: 'medium'});
};

Template.body.helpers({
    pathClass: function () {
        return 'page-' + Meteor.Router.page();
    }
})

Template.signup.events({
    'click button#signup': function(e) {
        e.preventDefault();
        
        var valid = $('#signupForm').parsley('validate');
        if (valid) {

            var name = $('#name')[0].value;
            var email = $('#email')[0].value;
            var uri = $('#uri')[0].value;
            var password = $('#password')[0].value;

            Accounts.createUser({
                username: email,
                email: email,
                password: password
            }, function(err) {
                if (! err) {
                    Meteor.call('createShop', {
                        name: name,
                        uri: uri
                    }, function() {
                        Meteor.Router.to('/shop/' + uri);
                    });
                }
            });
        }
    }
});

SessionAmplify = _.extend({}, Session, {
    keys: _.object(_.map(amplify.store.sessionStorage(), function(value, key) {
        return [key, JSON.stringify(value)];
    })),
    set: function (key, value) {
        Session.set(key, value);
        amplify.store.sessionStorage(key, value);
    },
    get: function(key) {
        return amplify.store.sessionStorage(key);
    },
    load: function(key) {
        Session.set(key, this.get(key));
    }
});


Meteor.startup(function() {
    filepicker.setKey("AK0L12u5Q0uvxeKYVx54Xz");
});

CONFIG = {
    PATH: {
        SAMPLE_IMAGE: '/images/sample.jpg',
        UPLOAD_IMAGE: '/images/lightbox_progress.gif'
    },
    IMAGE: {
        MAX_SUBIMAGES: 4
    },
    PRODUCT_LIST: {
        PER_PAGE: 9
    },
    CATEGORY: {
        MAX_LIMIT: 6
    }
};