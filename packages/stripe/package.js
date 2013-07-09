Package.describe({
    summary: "Node-Stripe."
});

Npm.depends({ "stripe": "1.3.0" });

Package.on_use(function (api) {
    api.add_files('stripe_server.js', 'server');
});