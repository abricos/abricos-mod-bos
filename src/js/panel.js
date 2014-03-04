/*
 @package Abricos
 @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 */

var Component = new Brick.Component();
Component.requires = {
    mod: [
        // {name: 'sys', files: ['container.js']}
    ],
    yui: ['panel']
};
Component.entryPoint = function (NS) {

    var Y = Brick.YUI,
        L = Y.Lang,
        buildTemplate = this.buildTemplate;

    var CONTENT_BOX = 'contentBox',

        RENDERUI = "renderUI",
        BINDUI = "bindUI",
        SYNCUI = "syncUI",

        HEADER_CONTENT = 'headerContent',
        BODY_CONTENT = 'bodyContent',
        FOOTER_CONTENT = 'footerContent',


        CN_MODAL_CONTENT = 'modal-content',
        UI = Y.Widget.UI_SRC;

    var Bootstrap = function () {
    };
    Bootstrap.ATTRS = {
        headerContent: {
            value: null
        },
        footerContent: {
            value: null
        },
        bodyContent: {
            value: null
        }
    };
    Bootstrap.HTML_PARSER = {
        headerContent: function (contentBox) {
            return this._parseBootsHTML('header');
        },
        bodyContent: function (contentBox) {
            console.log('HTML_PARSER');
            return this._parseBootsHTML('body');
        },
        footerContent: function (contentBox) {
            return this._parseBootsHTML('footer');
        }
    };
    Bootstrap.prototype = {
        initializer: function () {
            this._bootsNode = this.get(CONTENT_BOX);
            this._bootsTPL = {};

            buildTemplate(this._bootsTPL);

            Y.before(this._renderUIBootstrap, this, RENDERUI);
            Y.before(this._bindUIBootstrap, this, BINDUI);
            Y.before(this._syncUIBootstrap, this, SYNCUI);
        },
        _renderUIBootstrap: function () {
            this._bootsNode.addClass(CN_MODAL_CONTENT);

            this._renderBootstrapSections();

            this.after('headerContentChange', this._afterHeaderChange);
            this.after('bodyContentChange', this._afterBodyChange);
            this.after('footerContentChange', this._afterFooterChange);
        },
        _renderBootstrapSections: function () {
            this._renderBootstrap('header');
            this._renderBootstrap('body');
            this._renderBootstrap('footer');
        },
        _renderBootstrap: function (section) {
            var TM = this._bootsTPL._TM;
            var node = Y.Node.create(TM.replace(section));
            this._bootsNode.appendChild(node);
        },

        _bindUIBootstrap: function(){
            console.log('_bindUIBootstrap');
        },
        _syncUIBootstrap: function(){
            console.log('_syncUIBootstrap');
            var bootsParsed = this._bootsParsed;

            if (!bootsParsed || !bootsParsed[HEADER_CONTENT]) {
                this._uiSetBootstrap('header', this.get(HEADER_CONTENT));
            }
        },

        _uiSetBootstrap: function(section, content, where){

        },

        _parseBootsHTML: function (section) {
            console.log(section);
        },

        _afterHeaderChange: function (e) {
            if (e.src !== UI) {
                this._uiSetStdMod(STD_HEADER, e.newVal, e.stdModPosition);
            }
        },

        _afterBodyChange: function (e) {
            console.log('_afterBodyChange');
            if (e.src !== UI) {
                this._uiSetStdMod(STD_BODY, e.newVal, e.stdModPosition);
            }
        },

        _afterFooterChange: function (e) {
            if (e.src !== UI) {
                this._uiSetStdMod(STD_FOOTER, e.newVal, e.stdModPosition);
            }
        },

    };
    NS.WidgetBootstrapPanel = Bootstrap;

};