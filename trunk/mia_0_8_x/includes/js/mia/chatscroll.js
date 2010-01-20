var chatscroll = {};

chatscroll.Pane = function(scrollContainerId) {
    this.bottomThreshold = 20;
    this.scrollContainerId = scrollContainerId;
    this._lastScrollPosition = 100000000;
};

chatscroll.Pane.prototype.activeScroll = function() {

    var _ref = this,
        scrollDiv = document.getElementById(this.scrollContainerId),
        currentHeight = 0,
        _getElementHeight,
        _hasUserScrolled,
        _scrollIfInZone;

    _getElementHeight = function() {
        var intHt = 0;
        if (scrollDiv.style.pixelHeight) {
            intHt = scrollDiv.style.pixelHeight;
        } else {
            intHt = scrollDiv.offsetHeight;
        }

        return parseInt(intHt, 10);
    };

    _hasUserScrolled = function() {
        if (_ref._lastScrollPosition === scrollDiv.scrollTop || _ref._lastScrollPosition === null) {
            return false;
        }

        return true;
    };

    _scrollIfInZone = function() {
        if (!_hasUserScrolled || (currentHeight - scrollDiv.scrollTop - _getElementHeight() <= _ref.bottomThreshold)) {
            scrollDiv.scrollTop = currentHeight;
            _ref._isUserActive = false;
        }
    };


    if (scrollDiv.scrollHeight > 0) {
        currentHeight = scrollDiv.scrollHeight;
    } else if (scrollDiv.offsetHeight > 0) {
        currentHeight = scrollDiv.offsetHeight;
    }

    _scrollIfInZone();

    _ref = null;
    scrollDiv = null;

};