const fs = require('fs');
const path = require('path');
const { optionsFilePath } = require('./config.json'); // Make sure this path is correct
const { spawn } = require('child_process');
const { clearTimeout } = require('timers');

class CacheManager {
    constructor() {
        if (CacheManager.instance) {
            return CacheManager.instance;
        }
        this.options_cch = this.loadOptions(); 
        this.logs_cch = { logs: [] }
        this.__batchSize = 10
        this.__dumpDelay = 1 * 60 * 1000;
        this.__inactivityTimer = null;
        CacheManager.instance = this;
    }
    
    loadOptions() {
        try {
            if (fs.existsSync(optionsFilePath)) {
                const data = fs.readFileSync(optionsFilePath, 'utf-8');
                return JSON.parse(data);
            } else {
                return { locations: [], eventTypes: [] };
            }
        } catch (error) {
            console.error('Error loading options:', error);
            return { locations: [], eventTypes: [] };
        }
    }

    saveOptions() {
        try {
            const data = JSON.stringify(this.options_cch, null, 2); // Pretty-print JSON
            fs.writeFileSync( optionsFilePath , data, 'utf-8');
        } catch (error) {
            console.error('Error saving options:', error);
        }
    }

    getLocations() {
        return this.options_cch.locations;
    }

    getEvents() {
        return this.options_cch.eventTypes;
    }

    addLocation(label, value){
        const timestamp = new Date().toISOString();
        const location = { label, value, last_accessed:timestamp};
        this.options_cch.locations.push(location);
        this.saveOptions();
    }

    addEventType(label, value){
        const timestamp = new Date().toISOString();
        const event = { label, value, last_accessed:timestamp};
        this.options_cch.eventTypes.push(event);
        this.saveOptions();
    }

    deleteLocation(label){
        this.options_cch.locations = this.options_cch.locations.filter(loc => loc.label !== label); // Remove location from in-memory cache
        this.saveOptions(); // Persist the updated options to the file
    }

    deleteEventType(label){
        this.options_cch.eventTypes = this.options_cch.eventTypes.filter(loc => loc.label !== label); // Remove location from in-memory cache
        this.saveOptions(); // Persist the updated options to the file
    }

    updateLocationTimestamp(value) {
        const location = this.options_cch.locations.find(loc => loc.value === value);
        if (location) {
            location.last_accessed = new Date().toISOString(); // Update last accessed timestamp
            this.saveOptions(); // Persist the updated options to the file
        }
    }

    // Update last accessed timestamp of an event type
    updateEventTypeTimestamp(value) {
        const eventType = this.options_cch.eventTypes.find(type => type.value === value);
        if (eventType) {
            eventType.last_accessed = new Date().toISOString(); // Update last accessed timestamp
            this.saveOptions(); // Persist the updated options to the file
        }
    }

    addLog(log){
        this.logs_cch.logs.push(log);
        console.log(`Log added...\n Current Logs\n ${this.logs_cch.logs}`);
        
        if (this.logs_cch.logs.length >= this.__batchSize){
            console.log(`Batch limit reached ${this.__batchSize} dumping logs to database...`)
            this.dumpLogsToLambda();
            console.log(`Complete`);
        }

        else{
            clearTimeout(this.__inactivityTimer);
            this.__inactivityTimer = setTimeout(() => {
                if (this.logs_cch.logs.length > 0) {
                    this.dumpLogsToLambda();
                }
            }, this.__dumpDelay);    
            
        }
    }
    
    dumpLogsToLambda(){
        const mainProjectDir = __dirname;
        const filePath = path.join(mainProjectDir, '/loggingData.json');
    
        if (!fs.existsSync(mainProjectDir)) {
            fs.mkdirSync(mainProjectDir, { recursive: true });
        }
    
        fs.writeFileSync(filePath, JSON.stringify(this.logs_cch, null, 2), 'utf-8');
    
        const python_process = spawn('python', [path.join(mainProjectDir, 'process_transaction.py'), filePath])
    
        // Handle data received from the Python script
        python_process.stdout.on('data', (data) => {
            console.log(`Python Output: ${data.toString()}`);
        });
    
        // Handle errors from the Python script
        python_process.stderr.on('data', (data) => {
            console.error(`Python Error: ${data.toString()}`);
        });
    
        // Handle the exit event of the Python process
        python_process.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);
            if (code !== 0) {
                console.error('There was an issue running the Python script.');
            }
        });
    
        python_process.on('error', (err) => {
            console.error(`Failed to start subprocess: ${err.message}`);
        });


        this.logs_cch = {logs: []};
        return;
    }
    

    
}





const __cache = new CacheManager();
module.exports = { __cache };