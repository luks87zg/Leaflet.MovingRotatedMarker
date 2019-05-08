(function() {
    // save these original methods before they are overwritten
    var proto_initIcon = L.Marker.prototype._initIcon;
    var proto_setPos = L.Marker.prototype._setPos;

    var oldIE = (L.DomUtil.TRANSFORM === 'msTransform');

    L.Marker.addInitHook(function () {
        var iconOptions = this.options.icon && this.options.icon.options;
        var iconAnchor = iconOptions && this.options.icon.options.iconAnchor;
        if (iconAnchor) {
            iconAnchor = (iconAnchor[0] + 'px ' + iconAnchor[1] + 'px');
        }
        this.options.rotationOrigin = this.options.rotationOrigin || iconAnchor || 'center bottom';
        this.options.rotationAngle = this.options.rotationAngle || 0;

        // Ensure marker keeps rotated during dragging
        this.on('drag', function(e) { e.target._applyRotation(); });

        this.on('move', this.slideCancel, this);
    });

    L.Marker.include({
        _slideToUntil:    undefined,
        _slideToDuration: undefined,
        _slideToLatLng:   undefined,
        _slideFromLatLng: undefined,

        _initIcon: function() {
            proto_initIcon.call(this);
        },

        _setPos: function (pos) {
            proto_setPos.call(this, pos);
            this._applyRotation();
        },

        _applyRotation: function () {
            if(this.options.rotationAngle) {
                this._icon.style[L.DomUtil.TRANSFORM+'Origin'] = this.options.rotationOrigin;

                if(oldIE) {
                    // for IE 9, use the 2D rotation
                    this._icon.style[L.DomUtil.TRANSFORM] = 'rotate(' + this.options.rotationAngle + 'deg)';
                } else {
                    // for modern browsers, prefer the 3D accelerated version
                    this._icon.style[L.DomUtil.TRANSFORM] += ' rotateZ(' + this.options.rotationAngle + 'deg)';
                }
            }
        },

        _onZoom: function(){
            this._isZooming = true;
        },

        _offZoom: function(){
            this._isZooming = false;
        },

        _slideTo: function() {
            if (!this._map) return;
            if(this._isZooming) {
                this._slideFrame = L.Util.requestAnimFrame(this._slideTo, this);
                return;
            }

            this._remaining = this._slideToUntil - performance.now();

            if (this._remaining < 0) {
                this.setLatLng(this._slideToLatLng);
                this.fire('moveend');

                return this;
            }

            var startPoint = this._map.latLngToContainerPoint(this._slideFromLatLng);
            var endPoint   = this._map.latLngToContainerPoint(this._slideToLatLng);
            var percentDone = (this._slideToDuration - this._remaining) / this._slideToDuration;

            var currPoint = endPoint.multiplyBy(percentDone).add(
                startPoint.multiplyBy(1 - percentDone)
            );
            var currLatLng = this._map.containerPointToLatLng(currPoint)
            this.setLatLng(currLatLng);

            this.fire('move', {latlng: currLatLng});

            this._slideFrame = L.Util.requestAnimFrame(this._slideTo, this);
        },

        setRotationAngle: function(angle) {
            this.options.rotationAngle = angle;
            this.update();
            return this;
        },

        setRotationOrigin: function(origin) {
            this.options.rotationOrigin = origin;
            this.update();
            return this;
        },

        // 🍂method slideTo(latlng: LatLng, options: Slide Options): this
        // Moves this marker until `latlng`, like `setLatLng()`, but with a smooth
        // sliding animation. Fires `movestart` and `moveend` events.
        slideTo: function slideTo(latlng, options) {
            if (!this._map) return;
            this._isZooming = false;
            this._slideToDuration = options.duration;
            this._slideToUntil    = performance.now() + options.duration;
            this._slideFromLatLng = this.getLatLng();
            this._slideToLatLng   = latlng;

            if(options.rotationAngle) {
                this.options.rotationAngle= options.rotationAngle
            }

            this.fire('movestart');
            this._slideTo();

            return this;
        },

        // 🍂method slideCancel(): this
        // Cancels the sliding animation from `slideTo`, if applicable.
        slideCancel: function slideCancel() {
            L.Util.cancelAnimFrame(this._slideFrame);
        },

        onAdd: function(map){
            this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;

            if (this._zoomAnimated) {
                map.on('zoomanim', this._animateZoom, this);
            }

            // Fix for skipping the marker calculation when zooming
            map.on('zoomstart', this._onZoom, this);
            map.on('zoomend reset moveend', this._offZoom, this);

            this._initIcon();
            this.update();

        },

        onRemove: function(map){
            if (this.dragging && this.dragging.enabled()) {
                this.options.draggable = true;
                this.dragging.removeHooks();
            }

            if (this._zoomAnimated) {
                map.off('zoomanim', this._animateZoom, this);
            }

            map.off('zoomstart', this._onZoom);
            map.off('zoomend reset moveend', this._offZoom);

            this._removeIcon();
            this._removeShadow();

        },
    });

    L.CircleMarker.include({
        slideTo: L.Marker.prototype.slideTo,
        slideCancel: L.Marker.prototype.slideCancel,
        _slideTo: L.Marker.prototype._slideTo
    });

    L.CircleMarker.addInitHook(function(){
        this.on('move', this.slideCancel, this);
    });

})();