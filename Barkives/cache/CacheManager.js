require('module-alias/register');
const { spawn } = require('child_process');
const fs = require('node:fs');
const path = require('node:path');
const cachepth_log = path.join(__dirname, 'lg');
const cachepth_guilds = path.join(__dirname, 'gld-configs', 'guild-settings.json');
const logsDBScript = path.join('db-connect', 'process_transaction.py');
const TEST_INTERVAL = 1 * 20 * 1000 // 20 seconds


const CacheManager = {
    cache: new Map(),

    initGuild: function(guildId, guildName = ""){
        let guildCache = {

            guild_name: guildName,

            settings: {
                text_channel: null,
                authorized_roles: null
            },

            selection_options: {
                events: [],
                locations: []
            }, 
            logs: [] };

        this.cache.set(guildId, guildCache);
        return guildCache;
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
        
        if (!guildCache){
            guildCache = this.initGuild(guildId);
        }

        if (!guildCache.logs){
            guildCache.logs = [];
        }
        guildCache.logs.push(log);
      
        
        if (!guildCache.selection_options.events.includes(log.event_name)){
            guildCache.selection_options.events.push(log.event_name)
        }

        if (!guildCache.selection_options.locations.includes(log.location_name)){
            guildCache.selection_options.locations.push(log.location_name)
        }
        this.cache.set(guildId, guildCache);
    },

    getGuildCache: function(guildId) {
        let guildCache = this.cache.get(guildId);
        return guildCache;
    },

    dumpToJSON: function(){
        let { guildsJSON, logsJSON } = this.toJSON();
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
    },

    toJSON: function() {
        let guildsJSON = {guilds: {}};
        let logsJSON = {guilds: []}
        this.cache.forEach((guildCache, guildId) => {
            guildsJSON.guilds[guildId] = {
                guild_name: guildCache.guild_name,
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
    }
};

setInterval(() => {
    CacheManager.dumpToJSON();
}, 1 * 60000);  // 45 miniutes

setInterval(() => {
    CacheManager.sendLogsToDB();
}, 7200000); // two hours


CacheManager.load();
module.exports = CacheManager;