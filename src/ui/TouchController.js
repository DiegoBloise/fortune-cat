class TouchController {
    constructor(canvas) {
        this.canvas = canvas;
        this.touches = new Map();
        this.gestures = {
            tap: null,
            longPress: null,
            swipe: null
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        this.canvas.addEventListener('touchcancel', this.handleTouchCancel.bind(this));
        
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        this.canvas.addEventListener('click', this.handleClick.bind(this));
    }

    handleTouchStart(event) {
        event.preventDefault();
        
        for (let touch of event.changedTouches) {
            this.touches.set(touch.identifier, {
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY,
                startTime: Date.now()
            });
        }
        
        this.startLongPressDetection(event.changedTouches[0]);
    }

    handleTouchMove(event) {
        event.preventDefault();
        
        for (let touch of event.changedTouches) {
            if (this.touches.has(touch.identifier)) {
                const touchData = this.touches.get(touch.identifier);
                touchData.x = touch.clientX;
                touchData.y = touch.clientY;
                touchData.moved = true;
            }
        }
    }

    handleTouchEnd(event) {
        event.preventDefault();
        
        for (let touch of event.changedTouches) {
            if (this.touches.has(touch.identifier)) {
                const touchData = this.touches.get(touch.identifier);
                const duration = Date.now() - touchData.startTime;
                
                if (!touchData.moved) {
                    this.handleTap(touch.clientX, touch.clientY, touch);
                } else if (duration < 500) {
                    this.handleSwipe(touchData, touch);
                }
                
                this.touches.delete(touch.identifier);
            }
        }
        
        this.clearLongPressDetection();
    }

    handleTouchCancel(event) {
        event.preventDefault();
        this.touches.clear();
        this.clearLongPressDetection();
    }

    handleMouseDown(event) {
        this.touches.set('mouse', {
            x: event.clientX,
            y: event.clientY,
            startX: event.clientX,
            startY: event.clientY,
            startTime: Date.now()
        });
    }

    handleMouseMove(event) {
        if (this.touches.has('mouse')) {
            const touchData = this.touches.get('mouse');
            touchData.x = event.clientX;
            touchData.y = event.clientY;
            touchData.moved = true;
        }
    }

    handleMouseUp(event) {
        if (this.touches.has('mouse')) {
            const touchData = this.touches.get('mouse');
            const duration = Date.now() - touchData.startTime;
            
            if (!touchData.moved) {
                this.handleTap(event.clientX, event.clientY, event);
            }
            
            this.touches.delete('mouse');
        }
    }

    handleMouseLeave(event) {
        this.touches.delete('mouse');
        this.clearLongPressDetection();
    }

    handleClick(event) {
        event.preventDefault();
    }

    handleTap(x, y, originalEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const relativeX = x - rect.left;
        const relativeY = y - rect.top;
        
        const cell = this.getCellFromCoordinates(relativeX, relativeY);
        
        if (cell) {
            this.emit('tap', {
                x: relativeX,
                y: relativeY,
                cell: cell,
                originalEvent: originalEvent
            });
        }
    }

    handleSwipe(touchData, originalEvent) {
        const deltaX = touchData.x - touchData.startX;
        const deltaY = touchData.y - touchData.startY;
        
        const minSwipeDistance = 50;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > minSwipeDistance) {
                const direction = deltaX > 0 ? 'right' : 'left';
                this.emit('swipe', {
                    direction: direction,
                    originalEvent: originalEvent
                });
            }
        } else {
            if (Math.abs(deltaY) > minSwipeDistance) {
                const direction = deltaY > 0 ? 'down' : 'up';
                this.emit('swipe', {
                    direction: direction,
                    originalEvent: originalEvent
                });
            }
        }
    }

    startLongPressDetection(touch) {
        this.clearLongPressDetection();
        
        this.gestures.longPress = setTimeout(() => {
            if (!touch || !touch.identifier) {
                return;
            }
            
            const touchData = this.touches.get(touch.identifier);
            if (touchData && !touchData.moved) {
                const rect = this.canvas.getBoundingClientRect();
                const relativeX = touch.clientX - rect.left;
                const relativeY = touch.clientY - rect.top;
                
                this.emit('longPress', {
                    x: relativeX,
                    y: relativeY,
                    cell: this.getCellFromCoordinates(relativeX, relativeY),
                    originalEvent: touch
                });
            }
        }, 500);
    }

    clearLongPressDetection() {
        if (this.gestures.longPress) {
            clearTimeout(this.gestures.longPress);
            this.gestures.longPress = null;
        }
    }

    getCellFromCoordinates(x, y) {
        const canvas = this.canvas;
        if (!canvas) {
            return null;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return null;
        }
        
        const padding = 20;
        const cellSize = (canvas.width - padding * 4) / 3;
        
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const cellX = padding + col * (cellSize + padding);
                const cellY = padding + row * (cellSize + padding);
                
                if (x >= cellX && x <= cellX + cellSize &&
                    y >= cellY && y <= cellY + cellSize) {
                    return { row, col, index: row * 3 + col };
                }
            }
        }
        
        return null;
    }

    emit(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        this.canvas.dispatchEvent(event);
    }

    addEventListener(eventName, callback) {
        this.canvas.addEventListener(eventName, callback);
    }

    removeEventListener(eventName, callback) {
        this.canvas.removeEventListener(eventName, callback);
    }

    destroy() {
        this.clearLongPressDetection();
        
        const touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
        const mouseEvents = ['mousedown', 'mousemove', 'mouseup', 'mouseleave', 'click'];
        
        [...touchEvents, ...mouseEvents].forEach(eventType => {
            this.canvas.removeEventListener(eventType, this[`handle${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`]);
        });
    }
}