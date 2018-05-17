/*!
 * Bootstrap Validator Plugin
 * version: v0.1-2018.04.15
 * Requires jQuery v1.5 or later
 * Copyright (c) 2016 Gavin
 * https://github.com/lugavin
 *
 * Uses CommonJS, AMD or browser globals to create a jQuery plugin.
 * https://github.com/umdjs/umd/blob/master/templates/jqueryPlugin.js
 *
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var validators = {
        notempty: {
            validator: function () {
                return this.val() != '';
            },
            message: 'The value can\'t be empty.'
        },
        regexp: {
            validator: function () {
                return new RegExp(this.data('bv-regexp')).test(this.val());
            },
            message: 'This value is not valid.'
        }
    };

    $.fn.validator = function (options) {

        var opts = $.extend({}, $.fn.validator.defaults, options || {});

        var $form = this; // $('#form').validator() => this = $('#form')

        $form.attr('novalidate', 'novalidate').addClass(opts.formClass);

        // - $.data(this, name, data)
        // - $.data(this, name)

        $form.options = opts;

        $form.$fields = $form.find(':input').not(String(opts.excluded));

        $form.$fields.on(opts.trigger, function () {

            var $field = $(this);

            $field.hover(function () {
                showTip.apply($field);
            }, function () {
                hideTip.apply($field);
            });

            var valid = true;
            $.each(validators, function (validator, obj) {
                if ($field.data('bv-' + validator)) {
                    // 使用 call(thisArg, args) 或 apply(thisArg, argArray) 方法改变this指针的指向
                    if (!obj.validator.call($field)) {
                        valid = false;
                        $field.attr('title', $field.data('bv-' + validator + '-message') || obj.message);
                        opts.autoFocus && $field.focus();
                        return false; // return (true|false) = (continue|break);
                    }
                }
            });

            if (!valid) {
                $field.parent().removeClass('has-success').addClass('has-error');
                $field.attr('data-bv-result', 'INVALID');
                showTip.apply($field);
                $form.trigger(opts.events.fieldError, [$field]);
            } else {
                $field.parent().removeClass('has-error').addClass('has-success');
                $field.attr('data-bv-result', 'VALID');
                hideTip.apply($field);
                $form.trigger(opts.events.fieldSuccess, [$field]);
            }

        });

        /**
         * var validate = function () {
         *     // code to validate form entries
         * };
         *
         * // delegate events under the ".validator" namespace
         * $("form").on("click.validator", "button", validate);
         * $("form").on("keypress.validator", "input[type='text']", validate);
         *
         * // remove event handlers in the ".validator" namespace
         * $("form").off(".validator");
         */
        $form.on('click', opts.submitButton, function (e) {
            e.preventDefault();
            if ($form.$fields.trigger(opts.trigger).filter('[data-bv-result="INVALID"]').length) {
                $form.trigger(opts.events.formError);
                opts.autoFocus && $form.$fields[0].focus();
            } else {
                $form.trigger(opts.events.formSuccess);
                $(this).attr('disabled', 'disabled');
            }
        });

        function showTip() {
            if ($(this).attr('data-bv-result') === 'INVALID') {
                $(this).tooltip({
                    container: 'body',
                    trigger: 'manual',         // click | hover | focus | manual
                    placement: opts.placement, // top | bottom | left | right | auto
                    template: opts.template
                }).tooltip('fixTitle').tooltip('show');
            }
        }

        function hideTip() {
            $(this).tooltip('hide');
        }

        return $form;

    };

    $.fn.validator.defaults = {

        trigger: 'keyup',

        submitButton: '[type="submit"]',

        // The form CSS class
        formClass: 'bv-form',

        // The first invalid field will be focused automatically
        autoFocus: true,

        // Indicate fields which won't be validated
        excluded: [':submit,:reset,:button,:image,:file'],

        // How to position the tooltip - top | bottom | left | right | auto.
        placement: 'right', // top | bottom | left | right | auto

        // Base HTML to use when creating the tooltip.
        // The tooltip's title will be injected into the .tooltip-inner.
        // .tooltip-arrow will become the tooltip's arrow.
        // The outermost wrapper element should have the .tooltip class.
        template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',

        // Use custom event name to avoid window.onerror being invoked by jQuery
        events: {
            fieldError: 'error.field.bv',
            fieldSuccess: 'success.field.bv',
            formError: 'error.form.bv',
            formSuccess: 'success.form.bv'
        }

    };

}));
