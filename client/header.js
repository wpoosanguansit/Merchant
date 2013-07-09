Template.header.shopName = function() {
    var shop = Session.get('shop');
    return shop ? shop.name : '---';
};

Template.header.homeUrl = function() {
    return Meteor.Router.shopPath(Session.get('shopUri'));
}

Template.header.cartExists = function() {
    return Carts.find({
        cartId: Session.get('cartId'),
        shopId: Session.get('shopId')
    }).count() > 0;
};

Template.header.cartItemCount = function() {
    return Carts.find({
        cartId: Session.get('cartId'),
        shopId: Session.get('shopId')
    }).count();
};


Template.header.cartUrl = function() {
    var url = Meteor.Router.cartPath(Session.get('shopUri'), Session.get('cartId'));
    return url;
};

Template.user_loggedin.editMode = function() {
    return Session.get('editMode');
}

Template.user_loggedin.editModeChecked = function() {
    return Session.get('editMode') ? 'checked' : '';
}


Template.user_loggedin.events({
    'click #logout': function() {
        Meteor.logout(function(err) {
            SessionAmplify.set('editMode', null);
        });
    },
    'click #editCheckbox input': function() {
        SessionAmplify.set('editMode', !Session.get('editMode'));
    },
    'click #cartBtn': function(e) {
        e.preventDefault();
        var url = Meteor.Router.cartPath(Session.get('shopUri'), Session.get('cartId'));
        Meteor.Router.to(url);
    },
    'click #accountSettingBtn': function(e) {
        e.preventDefault();
        Meteor.Router.to(Meteor.Router.accountSettingPath(Session.get('shopUri')));
    }
});

Template.user_loggedout.events({
    'click #login': function(e) {
        e.preventDefault();
        var valid = $('#loginForm').parsley('validate');
        console.log(valid);
        if (valid) {
            var email = $('#email')[0].value;
            var password = $('#password')[0].value;
            var editMode = $('#editMode').attr('checked') == 'checked';

            Meteor.loginWithPassword(email, password, function(err) {
                SessionAmplify.set('editMode', editMode);
            });
        }
    }
});