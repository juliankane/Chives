const { spawn } = require('child_process');
const path = require('path');
const {SlashCommandBuilder, MessageFlags} = require('discord.js')

module.exports = {
    // deploy /log-bot-config command 
    data: new SlashCommandBuilder()
        .setName('hate-ivan')
        .setDescription(`Command for when Ivan can't check his DMs`),

    // execute command
    async execute(interaction){
        console.log(interaction.user.id)
        if (interaction.user.id != 173928626889162753){
            await interaction.reply({
                content:'You are not authorized to use this command',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        guild = interaction.guild;
        
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
            
        });

        await interaction.reply({
            content:'Command executed successfully',
            flags: MessageFlags.Ephemeral
        });
    }

}