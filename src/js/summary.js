var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['lib.js']}
    ]
};
Component.entryPoint = function(NS){
    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.SummaryWidget = Y.Base.create('summaryWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            this._widgetList = [];

            this.set('waiting', true);
            appInstance.summaryList(this.onLoadSummaryList, this);
        },
        destructor: function(){
        },
        onLoadSummaryList: function(err, result){
            var arr = [];

            if (result.summaryList){
                result.summaryList.each(function(summary){
                    arr[arr.length] = summary;
                });
            }
            this._renderSummaryItem(arr);
        },
        _renderSummaryItem: function(arr){
            if (arr.length === 0){
                return this._renderSummaryListComplete();
            }
            var summary = arr.pop();

            Brick.use(summary.get('module'), summary.get('component'), function(err, ns){
                var wcName = summary.get('widget');
                if (!err){
                    this._renderSummaryWidget(ns[wcName]);
                }
                this._renderSummaryItem(arr);
            }, this);
        },
        _renderSummaryListComplete: function(){
            this.set('waiting', false);
        },
        _renderSummaryWidget: function(wClass){
            if (!wClass){
                return;
            }
            var tp = this.template,
                ws = this._widgetList,
                wId = ws.length,
                colDiv = tp.append('list', tp.replace('item', {id: wId})),
                div = Y.one('#' + tp.gelid('item.widget') + '-' + wId);

            var w = new wClass({
                srcNode: div
            });

            ws[ws.length] = {
                elColumn: colDiv,
                widget: w
            };
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget,item'}
        }
    });
};