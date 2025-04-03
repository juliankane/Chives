/** Command - Set the configuration of log bot*/
const {RoleSelectMenuBuilder, ChannelSelectMenuBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, ButtonStyle, ChannelType} = require('discord.js')
const CacheManager = require('@cache');

module.exports = {
    // deploy /log-bot-config command 
    data: new SlashCommandBuilder()
        .setName('log-bot-config')
        .setDescription('Set configurations for log-bot in your discord'),

    // execute command
    async execute(interaction) {

        if (!interaction.member.permissions.has('Administrator')){
            
            await interaction.reply(`Only administrators can use this command`);
            return;
        }
        
        const guildId = interaction.guildId;
        let guildSettings = CacheManager.getGuildSettings(guildId);

        // Select TextChannel options
        const channelSelect = new ChannelSelectMenuBuilder().setCustomId('channel').setChannelTypes(ChannelType.GuildText);

        if (guildSettings.text_channel){
            channelSelect.setDefaultChannels(guildSettings.text_channel);
        }

        const roleSelect = new RoleSelectMenuBuilder().setCustomId('role').setMaxValues(10);

        if (guildSettings.authorized_roles){
            roleSelect.setDefaultRoles(guildSettings.authorized_roles);
        }

        const submitBtn = new ButtonBuilder().setCustomId('submit').setLabel('Submit').setStyle(ButtonStyle.Primary);
        const cancelBtn = new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary);

        actionRows = [
            new ActionRowBuilder().addComponents(channelSelect),
            new ActionRowBuilder().addComponents(roleSelect),
            new ActionRowBuilder().addComponents([submitBtn, cancelBtn])]


        const response = await interaction.reply({
            content: 'Select the log-bot text channel and the roles allows to use this bot',
            components: [
                new ActionRowBuilder().addComponents(channelSelect),
                new ActionRowBuilder().addComponents(roleSelect),
                new ActionRowBuilder().addComponents([submitBtn, cancelBtn])],
            withResponse: true,
            flags: MessageFlags.Ephemeral
        });

        const collector = response.resource.message.createMessageComponentCollector({
            time: 1000000, 
        });

        collector.on('collect', async(i) => {  
            if (i.customId === 'channel'){ // select channel
                guildSettings.text_channel = i.values.join(', ');
                await i.deferUpdate();
            }

            if (i.customId === 'role'){ // select allowed roles 
                guildSettings.authorized_roles = i.values;
                await i.deferUpdate();
            } 

            if (i.customId === 'submit'){ // submit settings
                CacheManager.setGuildSettings(guildId, guildSettings);
                await i.reply({ content: 'Configurations have changed!',  flags:MessageFlags.Ephemeral });
                collector.stop();
            }

            if (i.customId === 'cancel'){ 
                await i.reply({ content: 'Cancelling log-bot-config',  flags:MessageFlags.Ephemeral });
                collector.stop();
            }
        });

        collector.on('end', (collected, reason) => {

        });
    }

}
