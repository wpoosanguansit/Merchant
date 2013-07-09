Deps.autorun(function() {
    Meteor.subscribe('shops', Session.get('shopUri'));
    Meteor.subscribe('products', Session.get('shopId'));
    Meteor.subscribe('categories', Session.get('shopId'));
});

var getProducts = function(shopId, start) {
    var query = {
        shopId: shopId,
        position: {
            $lte: start
        }
    };
    var currentCategory = getCurrentCategory(shopId);
    if (currentCategory) {
        query['categories'] = currentCategory._id;
    }
    var products = Products.find(query, {
        sort: { position: -1 },
        limit: CONFIG.PRODUCT_LIST.PER_PAGE
    });
    return products;
};

var getCurrentCategory = function(shopId) {
    var category = Session.get('currentCategory');
    var categoryMatch = null;
    Categories.find({shopId: shopId}).forEach(function(cat) {
        if (cat.name == category) {
            categoryMatch = cat;
        }
    });
    return categoryMatch;
};

Template.shop.products = function() {
    Session.set('currentPage', 1);
    var shopId = Session.get('shopId');
    var start = Products.find({ shopId: shopId }).count();
    var products = getProducts(shopId, start);

    return products ? products : [];
};

Template.shop.events({
    'click #addProductBtn': function(e) {
        Meteor.call('createProduct', Session.get('shopId'), function(err, result) {
            $(window).scrollTop(0);
        });
    }
});

Template.shop.preserve('.product-thumbview');

Template.shop.rendered = function() {
    var shopId = Session.get('shopId');

    $( "#sortable" ).sortable({
        items: "li:not(.ui-state-disabled)",
        start: function(ev) {
            $('#top-scroller').show();
            $('#bottom-scroller').show();
            isThumbDown = true;
        },
        update: function(ev, ui) {
            $('#top-scroller').hide();
            $('#bottom-scroller').hide();
            isThumbDown = false;

            // collection of ids of li -> product_12345
            // ie. product[]=123&product[]=344&...
            var queryData = $(this).sortable('serialize');
            var reorderProducts = queryData.split('&');

            var displayProductCount = reorderProducts.length;
            var totalProductCount = Products.find({ shopId: shopId }).count();

            var idMap = {};
            var itemId = ui.item.attr('id');
            for (var i = 0; i < displayProductCount; i++) {
                var id = reorderProducts[i].split('=')[1];
                // checking duplicate
                if (idMap[id]) {
                    if (id == itemId) {
                        idMap[id]++;
                    }
                } else {
                    idMap[id] = 1;
                }
            }
            var i = 0;
            _.each(idMap, function(value, key) {
                // greater position number shows up first in product grid
                Products.update(key, {$set: {"position": totalProductCount - i}});
                i++;
            });
        }
    });
    $( "#sortable" ).disableSelection();

    // infinite scroll -> detect scroll to bottom of window then load more products
    $('#sortable').waypoint(function(direction) {
        if (direction === 'down' && $(this).height() > 0) {
            var currentPage = Session.get('currentPage');
            var query = {shopId: shopId};
            var category = getCurrentCategory(shopId);
            if (category) {
                query['categories'] = category._id;
            }
            var total = Products.find(query).count();
            var hasMore = currentPage <= (total / CONFIG.PRODUCT_LIST.PER_PAGE);

            if (hasMore) {
                currentPage += 1;
                Session.set('currentPage', currentPage);
                var start = total - ((currentPage - 1) * CONFIG.PRODUCT_LIST.PER_PAGE);
                var products = getProducts(shopId, start)

                var that = $(this);
                var frag = Meteor.renderList(
                    products,
                    function(product) {
                        return Template.productItem(product);
                    }
                );

                if (Session.get('editMode')) {
                    that.children().last().before(frag);
                } else {
                    that.append(frag);
                }
            }
        }
    }, {
        offset: function() { // how far from the window top
            return $(window).height() - $(this).height();
        }
    });

    var shop = Shops.findOne(Session.get('shopId'));
    if (!Session.get('editMode') || !shop || Meteor.userId() != shop.userId) {
        $( "#sortable" ).sortable('disable');
        $('.menubar').hide();
    } else {
        $( "#sortable" ).sortable('enable');
        $('.menubar').show();
    }

    setupDropZone();

};

Template.productItem.helpers({
    productLink: function() {
        return Meteor.Router.productPath(Session.get('shopUri'), this._id);
    },

    mainImageUrl: function() {
        return this.images[0] || CONFIG.PATH.SAMPLE_IMAGE;
    },

    sortState: function() {
        return Session.equals('currentCategory', null) ? 'ui-state-default' : 'ui-state-disabled';
    }

});

Template.productItem.events({
    'click a.image-container': function(e) {
        e.preventDefault();
        console.log(e);
        console.log(this);
        Meteor.Router.to(Meteor.Router.productPath(Session.get('shopUri'), this._id));
    }
});


setupDropZone = function() {
    // console.log($('div.drop-zone'));
    var ids = [];
    filepicker.makeDropPane($('div.drop-zone')[0], {
        multiple: true,
        dragEnter: function() {
            $('div.drop-zone').css({
                'backgroundColor': "#E0E0E0",
                'border': "1px solid #000"
            });
        },
        dragLeave: function() {
            $('div.drop-zone').css({
                'backgroundColor': "#F6F6F6",
                'border': "1px dashed #666"
            });
        },
        onStart: function(files) {
            Meteor.call('createProduct', Session.get('shopId'), {
                cnt: files.length,
                uploadFlag: true,
                uploadProgressImage: CONFIG.PATH.UPLOAD_IMAGE
            }, function(err, result) {
                ids.length = 0;
                var cnt = result.length;
                for (var i = 0; i < cnt; i++) {
                    ids.push(result[i]);
                }
            });
        },
        onSuccess: function(fpfiles) {
            var cnt = fpfiles.length;
            var findName = function(name) {
                var idx = name.indexOf('.');
                if (idx > -1) {
                    return name.substring(0, idx);
                }
                return name;
            }
            for (var i = 0; i < cnt; i++) {
                var _id = ids[i];
                Products.update(_id, {
                    '$set': {
                        name: findName(fpfiles[i].filename),
                        'images.0': fpfiles[i].url
                    }
                });
            }
            $("div#progress-text").text("");
        },
        onError: function(type, message) {

        },
        onProgress: function(percentage) {
            $("div#progress-text").text("Uploading ("+percentage+"%)");
        }
    });
};

Meteor.startup(function() {
    var isThumbDown = false;
    var direction = 1; // go up
    var sc = null; // scroller time interval

    $('#top_scroller').hover(
        function(e) {
            direction = 1;
            if (!sc) {
                sc = setInterval(scroll, 10);
                console.log('hover top ......', sc)
            }
        },
        function(e) {
            console.log('clear', sc)
            clearInterval(sc);
            sc = null;
        }
    );

    $('#bottom_scroller').hover(
        function(e) {
            if (!sc) {
                direction = -1;
                sc = setInterval(scroll, 10);
            }
        },
        function(e) {
            console.log('clear')
            clearInterval(sc);
            sc = null;
        }
    );

    function scroll() {
        var pos = $(document).scrollTop() - (direction * 2);
        console.log('scroll>', pos)
        $("html, body").scrollTop(pos);
    }

    // TODO mouse move to top/bottom area, then scroll a page
    $(document).mousemove(function(e) {
        // console.log('move >', e.clientY)
        if (isThumbDown) {
            console.log('mm');
        }
    });

    Deps.autorun(function() {

    })
});

Template.productDeleteButton.events = {
    'click .product-delete-button': function (event) {
        var isConfirm = confirm("This will delete this product permanently, sure?");
        if (isConfirm) {
            Products.remove(this._id);
        }
    }
};
