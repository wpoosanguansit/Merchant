Template.aboutInner.shop = -> Session.get 'shop'

getMapCode = ->
    shop = Session.get 'shop'
    code = ''

    if shop
        code = shop.mapCode || ''
        code = code.replace /width\s*=\s*"\d+"/, 'width="100%"'

    code

Template.aboutInner.mapCode = -> getMapCode()
    

Template.aboutInner.editable = -> Session.get 'editMode'

Template.aboutInner.editableClass = ->
    'editable' if Session.get('editMode')

Template.aboutInner.expand = -> Session.get 'aboutExpand'

Template.aboutInner.preserve ['.shop-about-wrapper']

Template.aboutInner.rendered = ->
    shopName  = $('.shop-name')
    shopAbout = $('.shop-about')
    shopMap   = $('#input-shop-map')
    editable  = Session.get('editMode') || false

    halloPlugins =
        'halloformat': {},
        'halloheadings': {},
        'hallojustify': {},
        'hallolists': {}

    shopMap
        .hallo({
            editable: editable,
            placeholder: 'Enter map embed code'
        })
        .on 'hallodeactivated', (event, data) ->
            Shops.update (Session.get 'shopId'), {
                $set: {
                    mapCode: data.element.text()
                }
            }

    shopAbout
        .hallo({
            editable: editable,
            placeholder: 'Enter your shop information here',
            plugins: halloPlugins
        })
        .on 'hallodeactivated', (event, data) ->
            Shops.update (Session.get 'shopId'), {
                $set: {
                    about: data.element.html()
                }
            }

Template.aboutButton.shop = -> Session.get 'shop'

Template.aboutButton.rendered = ->

    $('.about-button').click (e) ->
        e.preventDefault()

        side    = $('.hidden-side')
        wrapper = $('.main-content-wrapper')
        main    = $('main', wrapper)

        if wrapper.hasClass('allow-left')
            Session.set('aboutExpand', false)
            $(this).removeClass('active')
            wrapper.removeClass('allow-left')
            side.removeClass('show')
        else
            Session.set('aboutExpand', true)
            $(this).addClass('active')
            wrapper.addClass('allow-left')
            side.addClass('show')

Template.map.preserve ['div.shop-map']
Template.map.mapCode = -> getMapCode()
