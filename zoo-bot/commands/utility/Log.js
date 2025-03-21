const { __cache } = require('../../CacheManager');

class Log{
    constructor(){
        this.data = {};
    }

    sendLog(){
        __cache.addLog(this.data)
    }

    setAuthor(author){
        var _data = this._convertToString(author)
        this.data["logged_by"] = _data; 
        return this;
    }

    setReportedUsers(rep_users){
        var _data = this._convertToArray(rep_users)
        this.data["reported_users"] = _data;
        return this;
    }

    setPointAction(point_action){
        var _data = this._convertToString(point_action)
        this.data["point_action"]=_data;
        return this;
    }

    setEventType(event_type){
        var _data = this._convertToString(event_type);
        this.data["event_name"]=_data;
        return this;
    }

    setLocation(location){
        var _data = this._convertToString(location);
        this.data["location_name"]=_data;
        return this;
    }

    setEntry(entry){
        this.data["entry"] = entry;
        return this;
    }

    setDateTime(){
        this.data["date_time"]=new Date().toISOString().replace('T', ' ').split('.')[0]
        return this;
    }
    
    _convertToString(value) {
    if (Array.isArray(value)) {
        return value.join(','); 
    }
    return value; 
    }

    _convertToArray(value){
        if (!Array.isArray(value)){
            return [value]
        }
        return value;
    }
}

module.exports = {Log};