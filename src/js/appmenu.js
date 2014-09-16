/*!
 * Copyright 2014 Alexander Kuzmin <roosit@abricos.org>
 * Licensed under the MIT license
 */

var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['application.js', 'widget.js', 'form.js']},
        {name: 'widget', files: ['notice.js']}
    ]

};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,

        COMPONENT = this,

        SYS = Brick.mod.sys;

    NS.AppMenuItem = Y.Base.create('appMenuItem', Y.Model, [ ], { }, {
        ATTRS: {
            name: {
                value: ''
            },
            title: {
                value: ''
            },
            link: {
                value: ''
            }
        }
    });

    NS.AppMenu = Y.Base.create('appMenu', Y.ModelList, [], {
        model: NS.AppMenuItem
    });

    NS.AppMenuWidget = Y.Base.create('appMenuWidget', Y.Widget, [
        SYS.Language,
        SYS.Template
    ], {
        initializer: function(){

            Y.after(this._syncUIAppMenuWidget, this, 'syncUI');
        },
        _syncUIAppMenuWidget: function(){
            var moduleName = this.get('moduleName') || 'undefined';


        }
    }, {
        ATTRS: {
            moduleName: {
                value: ''
            },
            component: {
                value: COMPONENT
            },
            templateBlockName: {
                value: 'widget,list,row'
            },
            appMenu: {
                value: null
            }
        }
    });

};