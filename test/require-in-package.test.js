"use strict";

var rule = require("../lib/rules/require-in-package"),
    RuleTester = require("eslint").RuleTester;

var ruleTester = new RuleTester();


var valid = [
    "var fs = require('fs')",
    "var eslint = require('eslint');",
    "var i = require('./i');",
    "var api = require('eslint/lib/api');",
    "var yay = require('@craftsy/yay');",
    "var yay = require('@craftsy/yay/lib/go');",
].map(function(code) {
    return {
        code: code,
        parser: "babel-eslint",
        ecmaFeatures: { "modules": true },
        filename: __filename,
    };
});

var message = "dependency not in the local package.json";

var invalid = [
    "var a = require('b');",
    "var api = require('nonexistant/blah');",
    "var boo = require('@craftsy/boo');",
    "var boo = require('@craftsy/boo/lib/go');",
].map(function(code) {
    return {
        code: code,
        parser: "babel-eslint",
        ecmaFeatures: { "modules": true },
        errors: [{ message: message }],
        filename: __filename,
    };
});

ruleTester.run("require-in-package", rule, {
    valid: valid,
    invalid: invalid
});
