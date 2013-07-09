getProduct = ->
    Products.findOne Session.get 'productId'

showAudioSection = ->
    getProduct()?.audio || Session.get 'editMode'

Template.product.showAudioSection      =
Template.productAudio.showAudioSection = showAudioSection

getAudio = ->
    getProduct()?.audio

hasAudio = ->
    getAudio()?.url

Template.productAudio.audio = getAudio
Template.productAudio.hasAudio = hasAudio

Template.productAudio.editMode = ->
    Session.get 'editMode'

setupAudioDropZone = ->
    target = $('.product-audio')

    filepicker.makeDropPane $('.audio-drop-zone', target), {
        multiple: false,
        dragEnter: ->
            $('.audio-drop-zone', target).css {
                'backgroundColor': "#E0E0E0",
                'border': "1px solid #000"
            }
        dragLeave: ->
            $('.audio-drop-zone', target).css {
                'backgroundColor': "#F6F6F6",
                'border': "1px dashed #666"
            }
        onSuccess: (fpfiles) ->
            if hasAudio()
                filepicker.remove getAudio(), ->
                    Products.update (Session.get 'productId'), {
                        $set:
                            audio: fpfiles[0]
                    }
        onProgress: (percentage) ->
            $("#progress-text", target).text "Uploading (#{percentage})"
    }

Template.productAudio.rendered = ->
    $('audio').mediaelementplayer
        audioWidth: '100%'

    if Session.get 'editMode'
        setupAudioDropZone()
