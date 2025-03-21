const { Events } = require('discord.js')
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../guild-config.json');

module.exports = {
    name: Events.GuildCreate,
    execute(guild){
        console.log(`Joined new server: ${guild.name} (ID: ${guild.id})`);


        let guildConfig = {}
        if (fs.existsSync(configPath)) {
            guildConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
        
        if (!guildConfig[guild.id]) {
            guildConfig[guild.id] = {
                guildName: guild.name,
                logChannelId: "",  // You can set this later
                roleIds: [],
                log_options: {
                    locations: {
                        label: "New location...",
                        value: "default"
                    },
                },
                eventTypes: {
                    events: {
                        label: "New event...",
                        value: "default"
                    }
                }
            };

            fs.writeFileSync(configPath, JSON.stringify(guildConfig, null, 2), 'utf8');
            console.log(`Saved new guild settings for ${guild.name}`);
        }
    }
};


        


        

