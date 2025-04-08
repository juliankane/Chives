const { Events } = require('discord.js')
const { spawn } = require('child_process');
const path = require('path');


module.exports = {
    name: Events.GuildCreate,

    async execute(guild){
        console.log(`Received invitation from guild ${guild.name} ID: ${guild.id}`)
        await guild.members.fetch();
        
        const guildData = {
            guild: {
                g_id: guild.id,
                g_name: guild.name
            },
            users: guild.members.cache.filter(member => !member.user.bot)  // Exclude bots
                .map(member => ({
                u_id: member.id,
                u_name: member.user.username
            }))
        };


        const data = JSON.stringify(guildData);

        const pythonProcess = spawn('python3', [
            path.join('db-connect', 'new_guild.py'), data])


        pythonProcess.stdout.on('data', (data) => {
            
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Script Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            console.log(`Python exited with code: ${code}`)
        });
    }
};


        


        

