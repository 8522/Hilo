/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/drag.html?noHeader' width = '550' height = '250' scrolling='no'></iframe>
 * <br/>
 * 使用示例:
 * <pre>
 * var bmp = new Bitmap({image:img});
 * Hilo.util.copy(bmp, Hilo.drag);
 * bmp.startDrag([0, 0, 550, 400]);
 * </pre>
 * @class drag是一个包含拖拽功能的mixin。可以通过 Class.mix(view, drag)或Hilo.util.copy(view, drag)来为view增加拖拽功能。
 * @mixin
 * @static
 * @module hilo/util/drag
 * @requires hilo/core/Hilo
 */
var drag = {
    _isDragStart:false,
    /**
     * 是否需要 transform，父元素有 transform 时需要设置为true
     * @default false
     * @type {Boolean}
     */
    dragNeedTransform:false,
    /**
     * 开始拖拽。
      * @param {Array} bounds 拖拽范围，基于父容器坐标系，[x, y, width, height]， 默认无限制
    */
    startDrag:function(bounds){
        var that = this;
        
        if(that._isDragStart){
            that.stopDrag();
        }
        that._isDragStart = true;

        var stage;
        bounds = bounds||[-Infinity, -Infinity, Infinity, Infinity];
        var mouse = {
            x:0,
            y:0,
            preX:0,
            preY:0
        };
        var minX = bounds[0];
        var minY = bounds[1];
        var maxX = bounds[2] == Infinity?Infinity:minX + bounds[2];
        var maxY = bounds[3] == Infinity?Infinity:minY + bounds[3];

        var worldPoint = {
            x:0, 
            y:0
        };

        function onStart(e){
            e.stopPropagation();
            updateMouse(e);
            that.off(Hilo.event.POINTER_START, onStart);

            worldPoint.x = that.x;
            worldPoint.y = that.y;
            
            if(that.dragNeedTransform && that.parent){
                that.parent.getConcatenatedMatrix().transformPoint(worldPoint);
            }

            that.__dragX = worldPoint.x - mouse.x;
            that.__dragY = worldPoint.y - mouse.y;

            if(!stage){
                stage = that.getStage();
            }
            stage.on(Hilo.event.POINTER_MOVE, onMove);
            document.addEventListener(Hilo.event.POINTER_END, onStop);
            that.fire("dragStart", mouse);
        }

        function onStop(e){
            document.removeEventListener(Hilo.event.POINTER_END, onStop);
            stage && stage.off(Hilo.event.POINTER_MOVE, onMove);

            that.on(Hilo.event.POINTER_START, onStart);
            that.fire("dragEnd", mouse);
        }

        function onMove(e){
            updateMouse(e);

            worldPoint.x = mouse.x + that.__dragX;
            worldPoint.y = mouse.y + that.__dragY;

            if(that.dragNeedTransform && that.parent){
                that.parent.getConcatenatedMatrix().invert().transformPoint(worldPoint);
            }

            that.x = Math.max(minX, Math.min(maxX, worldPoint.x));
            that.y = Math.max(minY, Math.min(maxY, worldPoint.y));
            that.fire("dragMove", mouse);
        }

        function updateMouse(e){
            mouse.preX = mouse.x;
            mouse.preY = mouse.y;
            mouse.x = e.stageX;
            mouse.y = e.stageY;
        }

        function stopDrag(){
            that._isDragStart = false;
            document.removeEventListener(Hilo.event.POINTER_END, onStop);
            stage && stage.off(Hilo.event.POINTER_MOVE, onMove);
            that.off(Hilo.event.POINTER_START, onStart);
        }
        that.on(Hilo.event.POINTER_START, onStart);

        that.stopDrag = stopDrag;
    },
    /**
     * 停止拖拽。
    */
    stopDrag:function(){
        this._isDragStart = false;
    }
};