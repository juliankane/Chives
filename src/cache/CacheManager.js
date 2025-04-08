require('module-alias/register');
const { spawn } = require('child_process');
const fs = require('node:fs');
const path = require('node:path');
const cachepth_log = path.join(__dirname, 'lg');
const cachepth_guilds = path.join(__dirname, 'gld-configs', 'guild-settings.json');
const logsDBScript = path.join('db-connect', 'process_transaction.py');
const TEST_INTERVAL = 1 * 20 * 1000;

const CacheManager = {
    cache: new Map(),
    lastResetTime: Date.now(),

    initGuild: function(guildId, guildName = ""){
        let guildCache = {

            guild_name: guildName,
            member_daily: {},

            settings: {
                text_channel: null,
                authorized_roles: null,
                daily_limit: 10
            },

            selection_options: {
                events: [],
                locations: []
            }, 

            logs: [] };

        this.cache.set(guildId, guildCache);
        return guildCache;
    },

    setGuildSelectionOptions: function(guildId, options){
        let guildCache = this.cache.get(guildId);
        guildCache.selection_options = options;

        this.cache.set(guildId, guildCache)
    },

    getGuildSelectionOptions: function(guildId){
        let guildCache = this.cache.get(guildId);
         
        if (!guildCache){
            guildCache = this.initGuild(guildId); 
        }

        return guildCache.selection_options;
    },

    getGuildSettings: function(guildId, guildName = ""){
        let guildCache = this.cache.get(guildId)

        if (!guildCache){
            
            guildCache = this.initGuild(guildId, guildName = guildName); 
        }

        return guildCache.settings;
    },

    setGuildSettings: function(guildId, guildSettings) {
        let guildCache = this.cache.get(guildId);
     
        guildCache.settings = guildSettings;
        this.cache.set(guildId, guildCache)
    },

    addGuildLog: function(guildId, log){
        let guildCache = this.cache.get(guildId);
        console.log(`Adding log to guild ${guildId}`)
        console.log(log);
        
        if (!guildCache.member_daily[log.authorId]){
            console.log(`Reinitializing member`)
            guildCache.member_daily[log.authorId] = {
                'award': 0,
                'report': 0
            };
        }

        if (log.point_action){
            guildCache.member_daily[log.authorId][log.point_action] += log.logged_users.length;
       
        } 

        if (!guildCache){
            guildCache = this.initGuild(guildId);
        }

        if (!guildCache.logs){
            guildCache.logs = [];
        }

        if (!guildCache.selection_options.events.includes(log.event_name)){
            guildCache.selection_options.events.push(log.event_name)
        }

        if (!guildCache.selection_options.locations.includes(log.location_name)){
            guildCache.selection_options.locations.push(log.location_name)
        }

        guildCache.logs.push(log);

        this.cache.set(guildId, guildCache);
    },

    getGuildCache: function(guildId) {
        let guildCache = this.cache.get(guildId);
        return guildCache;
    },


    getMemberDailyCount: function(guildId, memberId, type) {
        let guildCache = this.cache.get(guildId);
        
        if (!guildCache.member_daily){
            guildCache.member_daily = {};
        }
        
        if (!guildCache.member_daily[memberId]){
            console.log(`Initializing daily count for member with ID ${memberId}`)
            guildCache.member_daily[memberId] = 
            { 'award': 0,
            'report': 0};
        }

        const count = guildCache.member_daily[memberId][type] ;        
        this.cache.set(guildId, guildCache)
        return count;
    },




    dumpToJSON: function(){
        let { guildsJSON, logsJSON } = this.toJSON();
        console.log(`Caching...`)
        try {
            fs.writeFile(cachepth_guilds, JSON.stringify(guildsJSON, null, 2), (err) => {
            })
        } catch(err){
            console.error(`Error saving guild cache from object:`)
            console.error(guildsJSON)
        }

        try {
            logsJSON.guilds.forEach((guild) => {
                const logFilePath = path.join(cachepth_log, `${guild.gid}.lg.json`);
                try{
                    fs.writeFile(logFilePath, JSON.stringify(guild, null, 2), (err) => {
                        if (err) {
                            console.error(`Error ${err} saving logs for ${guild.gid}`);
                        } else {
                            
                        }
                    });
                } catch (err){
                    console.error(`Error writing logs for guild ${guild.id} to ${logFilePath}`);
                }
            })
        } catch(err){
            console.error(`Error saving log files from Log object`)
            console.error(logsJSON)
        }
        console.log(`Caching Success!`)
    },


    toJSON: function() {
        let guildsJSON = {guilds: {}};
        let logsJSON = {guilds: []}
        this.cache.forEach((guildCache, guildId) => {
            guildsJSON.guilds[guildId] = {
                guild_name: guildCache.guild_name,
                member_daily: guildCache.member_daily,
                settings: { ...guildCache.settings},
                selection_options: { ...guildCache.selection_options},
            };

            if (guildCache.logs){
                logsJSON.guilds.push({
                        guild_name: guildCache.guild_name, 
                        gid: guildId,
                        logs: guildCache.logs.map( log => log.toJSON() )
                }) 
            }
        });
        
        return { guildsJSON, logsJSON }
    },

    sendLogsToDB: function() {

        console.log(`Sending logs to db at ${Date.now()}`)
        fs.readdir(cachepth_log, (err, files) => {

            if (err){
                console.error(`Failed to read log folder: ${err}`)
                return;
            }

            files.forEach(file => {
                if (file.endsWith('.lg.json')){
                    const filePath = path.join(cachepth_log, file);
         
                    const pythonProcess = spawn('python3', [logsDBScript, filePath]);
                    pythonProcess.stdout.on('data', (data) => {
                        
                    });
    
                    // Stream stderr in real-time
                    pythonProcess.stderr.on('data', (data) => {
                        console.error(`Python stderr: ${data}`);
                    });
    
                    // Handle process exit
                    pythonProcess.on('close', (code) => {
                        if (code === 0) {
                            
                        } else {
                            console.error(`Process exited with code ${code}`);
                        }
                    });
    
                    pythonProcess.on('error', (error) => {
                        console.error(`Failed to start Python process: ${error.message}`);
                    });
                }
            })
        })
    },

    getTimeUntilNextReset: function() {
        const currentTime = Date.now();
        const timeRemaining = (lastResetTime + 86400000) - currentTime; // 86400000ms = 24 hours
    
        // Convert the time remaining into hours and minutes
        const hours = Math.floor(timeRemaining / 3600000); // 1 hour = 3600000 milliseconds
        const minutes = Math.floor((timeRemaining % 3600000) / 60000); // 1 minute = 60000 milliseconds
    
        return `${hours} hours and ${minutes} minutes`;
    },



    RESET_DAILY_COUNT: function(){
        this.cache.forEach((guildCache, guildId) => {
            guildCache.member_daily = {};
            this.cache.set(guildId, guildCache);
        }),


        this.lastResetTime = Date.now();
    },

    load: function() { 
        try{
            if (fs.existsSync(cachepth_guilds)) {
                const rawData = fs.readFileSync(cachepth_guilds); 
                const jsonData = JSON.parse(rawData);
                this.cache = new Map(Object.entries(jsonData.guilds));
            }

            
            
        } catch(err){
            console.error(`Error loading cache on startup`);
        }
    },

};

setInterval(() => {
    CacheManager.RESET_DAILY_COUNT()
}, 86400000); // 24 hours in milliseconds

// Dump logs to JSON every 6 hours (21600000ms)
setInterval(() => {
    CacheManager.dumpToJSON();
}, 21600000);  // 6 hours in milliseconds

// Send logs to the database one minute after dumping (i.e., 1 minute = 60000ms)
setInterval(() => {
    setTimeout(() => {
        CacheManager.sendLogsToDB();
    }, 60000);  // 1 minute after the dump
}, 21600000);  // 6 hours in milliseconds



CacheManager.load();
module.exports = CacheManager;