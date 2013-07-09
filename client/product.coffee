Template.product.product = ->
    Products.findOne Session.get 'productId'

Template.product.mainImageUrl = (product) ->
    path = product.images[0] or  CONFIG.PATH.SAMPLE_IMAGE

Template.product.showSubImage = ->
    display = true
    if !(Session.get 'editMode') and (this.url?.indexOf 'http') == -1
        display = false

    display

Template.product.subImagesUrl = (product) ->
    range = [1..CONFIG.IMAGE.MAX_SUBIMAGES]

    images = for i in range
        url = (product and product.images[i]) or ''
        if Session.get('editMode') and url is ''
            url = CONFIG.PATH.SAMPLE_IMAGE

        {
            index: i
            url: url
        }

# attach hallo on document ready
Template.product.rendered = ->
    shop = Shops.findOne Session.get 'shopId'

    # Bind lightbox gallery to each product image
    $('.product-image-wrapper').magnificPopup
        delegate: 'a.image-container'
        type: 'image'
        gallery:
            enabled: true

    if !(Session.get 'editMode') or !shop or Meteor.userId() != shop.userId
        return

    $('.product-name')
        .hallo()
        .on 'hallodeactivated', (event, data) ->
            Products.update (Session.get 'productId'), {
                $set:
                    name: data.element.text()
            }

    $('.product-price')
        .hallo()
        .on 'hallodeactivated', (event, data) ->
            productId = Session.get 'productId'
            content = data.element.html()
            amount = Math.round(parseFloat(content)*100)/100 || 0
            data.element.html(amount)
            Products.update productId,
                $set:
                    "price": amount

    $('.product-description')
        .hallo(
            plugins:
                'halloformat': {}
                'halloblock': {}
                'hallojustify': {}
                'hallolists': {}
                'hallolink': {}
                'halloreundo': {}
            editable: true
        )
        .on 'hallodeactivated', (event, data) ->
            Products.update (Session.get 'productId'),
                $set:
                    "description": data.element.html()


    # add filepicker action to image transition
    $('.image-transition').html '<div class="picker caption"><h3>+ add</h3></div>'

Template.product.events
    'click .picker': (e) ->
        e.stopPropagation()
        e.preventDefault()

        thumbnailPosition = $(e.currentTarget).parents('.thumbnail').attr('class')
        # position 0 is main image, 1..max_sub is sub images
        position = thumbnailPosition?.match(/.*position-(\d)/)[1] || 0

        filepicker.pick
            mimetypes: ['image/*']
            services:['COMPUTER', 'FACEBOOK', 'GMAIL']
            maxSize: 1000*1024 # bytes
        , (FPFile) ->
            productId = Session.get('productId')
            product = Products.findOne(productId)
            modifier = {$set: {}}
            modifier.$set["images." + position] = FPFile.url
            Products.update productId, modifier
        , (FPError) ->
            console.log FPError.toString()

    'click #addToCart': (e) ->
        cartId = Session.get('cartId')
        shopId = Session.get('shopId')

        Meteor.call 'addToCart',
            cartId: cartId
            shopId: shopId
            productId: this._id
            productName: this.name
            qty: 1
            unitPrice: this.price
        url = Meteor.Router.cartPath Session.get('shopUri'), cartId
        Meteor.Router.to url

Template.product.preserve ['.product-location']
Template.product.showLocationSection = ->
    product = Products.findOne (Session.get 'productId')
    product?.location?.latitude || product?.location?.longitude || (Session.get 'editMode')

Template.productLocation.product = ->
    Products.findOne Session.get 'productId'

Template.productLocation.rendered = ->

    $('.product-location #product-lat').on 'blur'
    , (event) ->
        product = Products.findOne (Session.get 'productId')
        valid = $('.product-location form').parsley('validate')
        if (valid)
            Products.update (Session.get 'productId'),
                $set:
                    "location":
                        "latitude": $(this).val(),
                        "longitude": product?.location?.longitude

    $('.product-location #product-lng').on 'blur'
    , (event) ->
        product = Products.findOne (Session.get 'productId')
        valid = $('.product-location form').parsley('validate')
        if (valid)
            Products.update (Session.get 'productId'),
                $set:
                    "location":
                        "latitude": product?.location?.latitude,
                        "longitude": $(this).val()