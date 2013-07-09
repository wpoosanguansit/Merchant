getProduct = ->
    Products.findOne Session.get 'productId'

getVideo = ->
    getProduct()?.video || ''

hasVideo = ->
    '' != $.trim getVideo()

Template.productVideo.hasVideo =
Template.productVideoForm.hasVideo = hasVideo

showVideoSection = ->
    hasVideo() || Session.get 'editMode'

Template.product.showVideoSection          =
Template.productVideo.showVideoSection     =
Template.productVideoForm.showVideoSection = showVideoSection

getVideoUrl = ->
    prefix = 'http://youtube.com/embed/'
    url = getVideo()
    if url.match /\/watch\?/
        url = url.replace /.*?watch\?/, ''

        query = _.object _.map (url.split '&'), (item) ->
            return item.split '='

        if query.v
            url = prefix + $.trim query.v

    if url.match /^https?:\/\/(www.)?youtube.com/
        url.replace(/\?.*$/, '') + '?wmode=opaque'
    else
        ''

Template.productVideo.video =
Template.productVideoForm.video = getVideoUrl

Template.productVideoForm.editMode = ->
    Session.get 'editMode'

Template.productVideoForm.rendered = ->
    $('#product-video-form textarea')
        .hallo()
        .on 'hallodeactivated', (event, data) -> 
            Products.update (Session.get 'productId'), {
                $set:
                    video: data.element.val()
            }
