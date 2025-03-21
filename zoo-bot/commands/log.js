const { SlashCommandBuilder, TextInputStyle, MessageFlags, } = require('discord.js');
const { Menu } = require('./utility/Menu.js');
const { Log } = require('./utility/Log.js');
const { buildSingleInputModal, showModal, buildEmbedLog } = require('./utility/LComponents.js');
const { getNameFromID } = require('./utility/MappingFunctions.js');
const { __cache} = require('.././CacheManager.js');
const config = require('../config.json');  


module.exports = {
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription('Deduct points from members in your discord'),

    async execute(interaction) {

        const allowedRoles = config.roleIds;
        const text_channel = config.textChannelId;




        if(!allowedRoles){
            const roles = interaction.member.roles.cache.map(role=>role.id);
            const isAllowed = roles.some(roleId => allowedRoles.includes(roleId))
            if (!isAllowed){
                await interaction.reply({content: "You do not have the roles to use this command!", Flags: MessageFlags.Ephemeral})
            }
            console.log("User authorized for command usage");
        }
    
        const menu = new Menu();
        let actionRows =  menu.createActionRows()

        const response = await interaction.reply({
			content: '**Make your selections to create your log entry**',
			components: actionRows,
            withResponse: true,
            flags:MessageFlags.Ephemeral
		});

        const collector = response.resource.message.createMessageComponentCollector({
            time: 3_600_000 
        });
        
        let selectedUserIds = []; let pointAction = ''; let eventType = ''; let location = '';  let log_entry = '';

        collector.on('collect', async i => {
            switch (i.customId){
                case 'users':
                    selectedUserIds = i.values;
                    await i.deferUpdate();
                    break;

                case 'point_action':
                    pointAction = i.values;
                    await i.deferUpdate();
                    break;

                case 'event_type':
                    if (i.values.includes('default')){
                        modal = buildSingleInputModal(
                            'event_modal',
                            'New Event',
                            'Enter a few words that describe the event',
                            'e.g. Trolling, Gooning, Vibe Maxing...'
                        );
                        eventType = await showModal(i, modal);
                        
                        __cache.addEventType(eventType, eventType.toLowerCase());
                        eventType = [eventType];
                        _actionRows = menu.updateMenu(pointAction, eventType, location);
       
                        await i.editReply({
                            content: '**Make your selections to create your log entry**',
                            components: [
                                ...actionRows.slice(0,1),
                                ..._actionRows,
                                ...actionRows.slice(4)
                            ]
                        });
                    }
                    else {
                        eventType = i.values;
                        await i.deferUpdate();
                    }
                    break;

                case 'location':
                    if (i.values.includes('default')){
                        modal = buildSingleInputModal(
                            'location_modal',
                            'New Location',
                            'Enter a new location',
                            'e.g. IRL, World of Warcraft, Dota 2...'
                        );

                        location = await showModal(i, modal);
                        __cache.addLocation(location, location.toLowerCase());
                        location = [location]
                        _actionRows = menu.updateMenu(pointAction, eventType, location)
                        await i.editReply({
                            content: '**Make your selections to create your log entry**',
                            components: [
                                ...actionRows.slice(0,1),
                                ..._actionRows,
                                ...actionRows.slice(4)]
                        });
                    }
                    else{
                        location = i.values;
                        await i.deferUpdate();
                    }
                    break;

                case 'create':
                    selected_users_mentions = getNameFromID(selectedUserIds);
                    initiator_mention = getNameFromID(i.user.id);
                    
                    modal = buildSingleInputModal(
                        'log_description_modal',
                        'Log Entry',
                        'Entry',
                        'Write log entry...',
                        inputStyle=TextInputStyle.Paragraph
                    );
                    
                    log_entry = await showModal(i, modal);
                    
                    var log = new Log()
                        .setAuthor(i.user.id)
                        .setReportedUsers(selectedUserIds)
                        .setPointAction(pointAction)
                        .setEventType(eventType)
                        .setLocation(location)
                        .setEntry(log_entry)
                        .setDateTime()

                    const embed = buildEmbedLog(i.user, pointAction, selected_users_mentions, location, eventType, log_entry);


                    const channel = i.client.channels.cache.get(text_channel)

                    channel.send({embeds: [embed]})
                        .then(()=>console.log("Embed sent to text-channel!")).catch(console.error);
                
                    
                    log.sendLog();

                    await i.followUp({content:"Your log has been submitted!",ephemeral: true});

                    collector.stop();
                    break;

                case 'cancel':
                    console.log('Cancel button pressed');
                    await i.reply({ content: 'Cancelled deduction' });
                    collector.stop();
                    break;

                default:
                    console.log('Cancel button pressed');
                    return;
            }
        })

        collector.on('end', () => {
			console.log('Collector Stopped');
		});
    }
};


