var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'user', files: ['permission.js']},
        {name: 'sys', files: ['application.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    SYS.Application.build(COMPONENT, {}, {
        initializer: function(){
            this.initCallbackFire();
        }
    }, [], {});
};