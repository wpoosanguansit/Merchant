Deps.autorun () ->
  Meteor.subscribe 'cart', Session.get('cartId')

"""
================  Cart Functions ===================
"""
@findCartId = () ->
  # check local storage
  cartId = amplify.store 'cartId'
  unless (cartId)
    cartId = Meteor.userId()
    unless (cartId)
      cartId = Random.id()
    amplify.store 'cartid', cartId
  cartId


"""
================  Template Helpers ===================
"""

Template.cart.items = () ->
  Carts.find
    cartId: Session.get('cartId')
    shopId: Session.get('shopId')

Template.cart.total = () ->
  items = Carts.find
    cartId: Session.get('cartId')
    shopId: Session.get('shopId')
  _(items.fetch()).reduce (acc, item) ->
    acc + (item.unitPrice * item.qty)
  , 0

Template.cartItem.total = () ->
  this.unitPrice * this.qty


"""
================  Template Events ===================
"""

Template.cart.events
  'click button#checkoutBtn': (e) ->
    # disable checkout button
    $('button#checkoutBtn').prop('disabled', true);

    items = Carts.find
      cartId: Session.get('cartId')
      shopId: Session.get('shopId')

    names = _.collect items.fetch(), (item) ->
      item.productName

    token = (res) ->
      Meteor.call 'checkout', Session.get('cartId'), Session.get('shopId'), res, (err) ->
        unless (err)
          Meteor.Router.to Meteor.Router.shopPath(Session.get('shopUri'))
        else
          html = Template.checkoutError(err)
          $('#errorBlock')[0].innerHTML = html

    shop = Shops.findOne
      _id: Session.get('shopId')

    StripeCheckout.open({
        key:         shop.stripeKey,
        address:     false,
        amount:      parseInt($('#totalAmount')[0].innerHTML) * 100,
        currency:    'usd',
        name:        $('a.brand')[0].text,
        description: names.join(','),
        panelLabel:  'Checkout',
        token:       token
      });


Template.cartItem.events
  'change input': (e) ->
    newQty = e.target.value
    Meteor.call 'incCartQty', this._id, newQty

  'click .deleteBtn': (e) ->
    Meteor.call 'removeCartItem', this.cartId, this._id
