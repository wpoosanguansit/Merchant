Template.account.shop = () ->
  shop = Session.get('shop')
  shop


Template.account.events
  'click #submitBtn': (e) ->
    key = $('#stripeKey').val()
    secretKey = $('#stripeSecretKey').val()
    console.log 'key', key
    Shops.update Session.get('shopId'),
      $set:
        stripeKey: key
        stripeSecretKey: secretKey