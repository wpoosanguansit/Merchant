"""
================  Global Helpers ===================
"""
Handlebars.registerHelper "isEditMode", (options) ->
  if Session.get "editMode"
    options.fn this
  else
    options.inverse this

"""
================  Category Template Helpers ===================
"""
Template.category.categories = ->
  Categories.find shopId: Session.get('shopId'),
    sort: position: 1

Template.category.isActive = ->
  if Session.equals('currentCategory', this.name) then 'active' else ''

Template.category.categoryLink = ->
  Meteor.Router.categoryPath Session.get('shopUri'), this.name

Template.category.isAll = ->
  if Session.equals('currentCategory', null) then 'active' else ''

Template.category.allCategoryLink = ->
  Meteor.Router.categoryPath Session.get('shopUri'), 'all'


"""
================  Category Template onReady ===================
"""
Template.category.rendered = ->
  shopId = Session.get 'shopId'
  tagitui = $('.tag-it')

  tagitui.tagit
    fieldName: 'categoryTag'
    removeConfirmation: true
    allowSpaces: true
    tagLimit: CONFIG.CATEGORY.MAX_LIMIT

    onTagClicked: (ev, ui) ->
      Meteor.Router.to Meteor.Router.categoryPath Session.get('shopUri'), ui.tagLabel

    afterTagAdded: (ev, ui) ->
      # do not create category when widget is initializing (page loading)
      unless ui.duringInitialization
        Meteor.call 'createCategory', ui.tagLabel, shopId

    beforeTagRemoved: (ev, ui) ->
      false if ui.tagLabel is 'ALL'

    afterTagRemoved: (ev, ui) ->
      tagId = ui.tag.prop('id')
      catId = tagId.split('_')[1]
      Meteor.call 'removeCategory', catId, shopId

    onTagEditEnter: (ev, ui) ->
      false if ui.tagLabel is 'ALL'

    onTagEditEnd: (ev, ui) ->
      tagId = ui.tag.prop('id')
      catId = tagId.split('_')[1]
      Meteor.call 'updateCategory', catId, shopId,
        name: ui.tagLabel

    onTagsLoaded: (ev) ->
      # activate focus on empty input
      $(this).find('.tagit-new > input[type=text]').val('').focus()

  tagitui.sortable
    items: "li:not(.tagit-new, .tagit-all)"
    update: (ev, ui) ->
      # serialized data > item[]=xx1&item[]=xx2&...
      result = $(this).sortable('serialize')

      arr = result.split('&')
      arr = _.map arr, (it) -> it.split('=')[1]
      console.log 'cat sortable result >', arr

      for catId, i in arr
        Meteor.call 'updateCategory', catId, shopId,
          position: i + 1

  tagitui.disableSelection()

"""
================  Product Category Template Helpers ===================
"""
Template.productCategory.categories = ->
  Categories.find shopId: Session.get('shopId'),
    sort: name: 1

Template.productCategory.isInCategory = (product) ->
  catIds = product.categories
  match = _.find catIds, (it) ->
    it is this._id
  , this
  checked = 'checked' if match?


"""
================  Product Category Template Events ===================
"""
Template.productCategory.events
  'change input[type=checkbox]': (e, tmpl) ->
    inputEl = $ e.currentTarget
    checked = inputEl.prop 'checked'
    # parent data is automatically passed to template
    productId = tmpl.data._id
    if checked
      Products.update productId,
        '$push':
          'categories': this._id
    else
      Products.update productId,
        '$pull':
          'categories': this._id

