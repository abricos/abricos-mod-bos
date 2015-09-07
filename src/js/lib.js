var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'user', files: ['permission.js']},
        {name: 'sys', files: ['application.js']},
        {name: '{C#MODNAME}', files: ['model.js']}
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
    }, [], {
        ATTRS: {
            isLoadAppStructure: {value: true},
            SummaryList: {value: NS.SummaryList}
        },
        REQS: {
            summaryList: {
                attribute: true,
                type: 'modelList:SummaryList'
            }
        }
    });
};