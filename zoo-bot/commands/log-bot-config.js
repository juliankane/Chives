const {RoleSelectMenuBuilder, ChannelSelectMenuBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, ButtonStyle, ChannelType} = require('discord.js')
const config =  require('.././config.json');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log-bot-config')
        .setDescription('Set configurations for log-bot in your discord'),
        
    async execute(interaction){
        const textSelect = new ChannelSelectMenuBuilder()
            .setCustomId('channel_select').setChannelTypes(ChannelType.GuildText);

        if (config.textChannelId){
            textSelect.setDefaultChannels(config.textChannelId);
        }

        const roleSelect = new RoleSelectMenuBuilder().setCustomId('role_select').setMaxValues(10);
        

        if (config.roleIds){
            roleSelect.setDefaultRoles(config.roleIds);
        }

        cancelBtn = new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary);
        submitBtn = new ButtonBuilder().setCustomId('submit').setLabel('Submit').setStyle(ButtonStyle.Primary);
        
        const response = await interaction.reply({
            content: 'Select the log-bot text channel and the roles allows to use this bot',
            components: [
                new ActionRowBuilder().addComponents(textSelect),
                new ActionRowBuilder().addComponents(roleSelect),
                new ActionRowBuilder().addComponents([submitBtn, cancelBtn])
            ],
            withResponse: true,
            flags:MessageFlags.Ephemeral
        });


        const collector = response.resource.message.createMessageComponentCollector({
            time: 1000000, 
        });

        let selected_channel = ""; let selected_roles = [];

        collector.on('collect', async(i) => {  
            if (i.customId === 'channel_select'){
                selected_channel = i.values[0];
                console.log(`channel_selected ${selected_channel}`)
                await i.deferUpdate();
            }

            if (i.customId === 'role_select'){
                selected_roles = i.values;
                console.log(`roles selected ${selected_roles}`)
                await i.deferUpdate();

            } 

            if (i.customId === 'submit'){


                if (selected_channel){
                    config.textChannelId = selected_channel;
                }
                if (selected_roles){
                    config.roleIds = selected_roles;
                }
                
                console.log(config);


                try{
                    fs.writeFileSync(path.join(__dirname,'.././config.json'), JSON.stringify(config, null, 2), 'utf-8');
                }
                catch{
                    console.error("Error writing config file");
                }
    
                await i.reply({
                    content:"Configurations have changed!"
                });
                
                collector.stop();
            }

            if (i.customId === 'cancel'){
                console.log('Cancel button pressed');
                await i.reply({ content: 'Cancelled deduction',  flags:MessageFlags.Ephemeral });
                collector.stop();
            }
        })

        collector.on('end', (collected, reason) => {
            console.log('Collector Stopped');
        });



    }

}
