

root = global ? window
 
if root.Meteor.is_client
  root.Template.hello.greeting = ->
    "Welcome to FirstApp."
 
  root.Template.hello.events = "click input": ->
    console.log "You pressed the button"