Fiber = Npm.require('fibers');

Meteor.publish 'cart', (cartId) ->
  Carts.find
    cartId: cartId

reorderCart = (cartId) ->
  items = Carts.find {cartId: cartId},
    sort: [['seq', 'asc']]
    fields: {'_id':1}
  idx = 1
  items.forEach (item) ->
    Carts.update item._id,
      '$set':
        seq: idx++

Meteor.methods
  addToCart: (params) ->
    item = Carts.findOne
        cartId: params.cartId
      ,
        sort: [['seq', 'desc']]
    nextSeq = (item?.seq or 0) + 1
    Carts.insert
      seq: nextSeq
      shopId: params.shopId
      cartId: params.cartId
      productId: params.productId
      productName: params.productName
      qty: params.qty or 1
      unitPrice: params.unitPrice

  incCartQty: (_id, qty) ->
    Carts.update {_id: _id},
      '$set':
        qty: qty

  removeCartItem: (cartId, itemId) ->
    Carts.remove itemId
    reorderCart cartId

  checkout: (cartId, shopId, token) ->
    items = Carts.find {cartId: cartId, shopId: shopId},
      sort: [['seq', 'asc']]
    .fetch()

    total = _.reduce items, (acc, item) ->
      acc + (item.unitPrice * item.qty)
    , 0

    shop = Shops.findOne {_id: shopId}
    Stripe = StripeAPI shop.stripeSecretKey

    Stripe.charges.create
      amount: total * 100,
      currency: "USD",
      card: token.id
    ,(err, res) ->
      unless err
        fiber = Fiber () ->
          order =
            token: token
            response: res
            items: items
            shopId: shopId

          Orders.insert order, (err) ->
            Carts.remove
              cartId: cartId
              shopId: shopId
        fiber.run()
      else
        throw new Meteor.Error(402, "Can't checkout items!");




