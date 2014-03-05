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
        Widget = Y.Widget,
        buildTemplate = this.buildTemplate,

        CONTENT_BOX = 'contentBox',

        RENDERUI = "renderUI",
        BINDUI = "bindUI",
        SYNCUI = "syncUI",

        getClassName = Y.ClassNameManager.getClassName;

    var Bootstrap = function () {
    };
    Bootstrap.SECTION_CLASS_NAMES = {
        header: 'modal-header',
        body: 'modal-body',
        footer: 'modal-footer'
    };
    Bootstrap.TEMPLATES = {
        closeButton: '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
        header: '<div class="modal-header"></div>',
        body: '<div class="modal-body"></div>',
        footer: '<div class="modal-footer"></div>'
    };
    Bootstrap.prototype = {

        initializer: function () {
            this._bootsNode = this.get(CONTENT_BOX);

            this._uiSetStdModOrigin = this._uiSetStdMod;
            this._uiSetStdMod = this._uiSetStdModBootstrap;

            Y.after(this._renderUIBootstrap, this, RENDERUI);

            this.after('visibleChange', this._afterVisibleChange);
        },
        _renderUIBootstrap: function () {
            this._bootsNode.replaceClass(getClassName('panel-content'), 'modal-content');
        },
        _getStdModTemplate: function (section) {
            return Y.Node.create(Bootstrap.TEMPLATES[section], this._stdModNode.get('ownerDocument'));
        },
        _findStdModSection: function (section) {
            return this.get(CONTENT_BOX).one("> ." + Bootstrap.SECTION_CLASS_NAMES[section]);
        },
        _uiSetStdModBootstrap: function(section, content, where){
            this._uiSetStdModOrigin(section, content, where);
            if (section === 'header'){
                var node = this.getStdModNode(section);
                var btnNode = Y.Node.create(Bootstrap.TEMPLATES.closeButton);
                node.appendChild(btnNode);
                var __self = this;
                btnNode.once('click', function(event){
                    __self.hide();
                });
            }
        },
        _afterVisibleChange: function(event){
            this.destroy();
           // Y.soon(Y.bind('destroy', this));
        }
    };
    NS.WidgetBootstrapPanel = Bootstrap;

    Y.MyPanel = Y.Base.create('modal', Y.Widget, [
        // Other Widget extensions depend on these two.
        Y.WidgetPosition,
        Y.WidgetStdMod,

        Y.WidgetAutohide,
        Y.WidgetButtons,
        Y.WidgetModality,
        Y.WidgetPositionAlign,
        Y.WidgetPositionConstrain,
        Y.WidgetStack,
        NS.WidgetBootstrapPanel
    ], {


        /*
         BUTTONS: {
         close: {
         // label: '&times;',
         action: 'hide',
         section: 'header',

         // Uses `type="button"` so the button's default action can still
         // occur but it won't cause things like a form to submit.
         template: '<button type="button" data-dismiss="modal" aria-hidden="true">&times;</button>',
         classNames: 'close'
         }
         }/**/
    }, {

        /*
         ATTRS: {
         // TODO: API Docs.
         buttons: {
         value: ['close']
         }
         }
         /**/
    });
};