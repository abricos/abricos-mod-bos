/*
 @package Abricos
 @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 */

var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['container.js']},
        {name: 'bos', files: ['panel.js']}
    ]
};
Component.entryPoint = function (NS) {

    var Y = Brick.YUI;
    var buildTemplate = this.buildTemplate;

    var TPL = function () {
        buildTemplate(this, 'bootstrap');
    };
    var tpl = new TPL();

    var modal = new Y.MyPanel({
            bodyContent: 'Modal body',
            centered: true,
            headerContent: 'Modal header',
            modal: true,
            render: '.example',
            width: 450
        }
    );
    modal.show();

    /*
    var TEMPLATED = 'templated',
        BOUNDING_BOX = 'boundingBox',
        CONTENT_BOX = 'contentBox';

    var Template = function () {

    };
    // Template.TEMPLATED_CLASS_NAME = Y.Widget.getClassName(TEMPLATED);
    Template.ATTRS = {

    };
    Template.prototype = {
        initializer: function () {
            var bbox = this.get(BOUNDING_BOX);
            // console.log(bbox);

        }
    };
    NS.WidgetTemplate = Template;

    var MyPanel = Y.Base.create('abricos-panel', Y.Widget, [
        Y.WidgetPosition,
        NS.WidgetTemplate,
        NS.WidgetBootstrapPanel,
        // Y.WidgetStdMod,

        Y.WidgetAutohide,
        // Y.WidgetModality,
        Y.WidgetPositionAlign,
        Y.WidgetPositionConstrain,
        Y.WidgetStack
    ], {

    }, {

    });

    var TPL = function () {
        buildTemplate(this, 'bootstrap');
    };
    var tpl = new TPL();

    document.body.innerHTML = '';
    // var elId = tpl._TM.idManager['widget']['id'];

    var dialog = new MyPanel({
        // headerContent: 'This is a Header Content',
        bodyContent: 'This is a BODY Content',
        // footerContent: 'This is a Footer Content',
        width: 410,
        centered: true,
        modal: true,
        render: '.example',
        visible: false
    });
    dialog.bodyContent = 'asdfasfasasd';
    dialog.show();


    /*
     var TestPanel = function(){
     TestPanel.superclass.constructor.apply(this, {
     // fixedcenter: true
     });
     };
     Y.extend(TestPanel, Brick.widget.NewPanel, {

     initTemplate: function(){
     return buildTemplate(this, 'panel').replace('panel');
     },
     onLoad: function(){
     Brick.console('onLoad');
     },
     onClick: function(el){
     Brick.console('onClick');

     var tp = this._TId['panel'];
     switch(el.id){
     case tp['bok']:
     case tp['bclose']: this.close(); return true;
     }

     return false;
     }
     });
     NS.TestPanel = TestPanel;
     /**/

};