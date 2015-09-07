var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['appModel.js']},
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        SYS = Brick.mod.sys;

    NS.Summary = Y.Base.create('summary', SYS.AppModel, [], {
        structureName: 'Summary'
    });

    NS.SummaryList = Y.Base.create('summaryList', SYS.AppModelList, [], {
        appItem: NS.Summary
    });

};