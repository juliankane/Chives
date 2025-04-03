/** COMMAND - /log 
 *     Initialize a menu for a user to create and send a Log
 */
const { SlashCommandBuilder, TextInputStyle, MessageFlags, } = require('discord.js');
const { MenuComponentBuilder, buildSingleInputModal, showModal } = require('./utility/MenuComponentBuilder.js');


const { Log } = require('./utility/Log.js');
const { LogJS } = require('@constants');
const CacheManager = require('@cache');





module.exports = {
    // Deploy /log
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription('Create a log')
        .addAttachmentOption(option => option.setName('add-attachment').setDescription('Attach an image, gif, or video'))
        .addStringOption(option => option.setName('add-url').setDescription('Provide a link (Youtube, Gyazo, Imgur, etc.')),

    // Execute /log
    async execute(interaction) {  
        // author of Log
        const authorId = interaction.user.id;
        const guildId = interaction.guild.id;
        const settings = CacheManager.getGuildSettings(guildId); 
        
        let text_channel = null;
        if (settings.text_channel){
            text_channel = interaction.client.channels.cache.get(settings.text_channel);
        } else {
            text_channel = interaction.channel;
        }
        
        /** Initialize Log menu */ 
        const Menu = new MenuComponentBuilder(  
            customIds = { user: "user_select", 
                pointAction: "point_action", eventName: "event", locationName: "location", 
                submit: "submit", cancel: "cancel"},

            guild_options = {...CacheManager.getGuildSelectionOptions(guildId)}
            );
        

        let actionRows =  Menu.createComponents()  
        const response = await interaction.reply({
			content: 'Creat log ...',
			components: actionRows,
            withResponse: true,
            flags: MessageFlags.Ephemeral
		});

        const collector = response.resource.message.createMessageComponentCollector({
            time: 3_600_000 

        });

        const log = new Log();
        log.authorId = authorId; 

        /** Begin collecting on menu components in the message sent to the user*/
        collector.on('collect', async i => {
            async function updateMenuComponents(){    
                if (log.isFilled()){
                    Menu.setSubmitEnabled();
                }
                actionRows = Menu.createComponents();
                await i.editReply({
                    content: '**Make your selections to create your log entry**',
                    components: actionRows}
                );
            }   

            switch (i.customId){
                /** User Select- Author selected members to include in the log */
                case 'user_select':
                    log.logged_users = i.values; 
                    await i.deferUpdate();
                    await updateMenuComponents();
                    break;

                /** Point Action Select - Author selected 'Award' or 'Report' */
                case 'point_action':
                    log.point_action = i.values.join(', '); 
                    Menu.updatePointActionSelect(log.point_action) 
                    await i.deferUpdate();
                    await updateMenuComponents();
                    break;

                /** Event Select - Author selected an event from the selection menu OR selected to create a new event */
                case 'event':
                    if (!i.values.includes('new')){ // event from menu
                        log.event_name = i.values.join(', '); 
                        await i.deferUpdate();
                    } else { // new event
                        
                        let mId = `event_modal${Date.now()}`;
                        const modal = Menu.buildSingleInputModal(
                            customId = mId,
                            title = 'New Event',
                            label = 'Enter a few words that describe the event',
                            placeholder = 'e.g. Trolling, Gooning, Vibe Maxing...'
                        );
                        log.event_name = await Menu.showModal(i, modal, modalId = mId);
                    } 
                    
                    if (log.event_name){
                        Menu.updateEventSelect(log.event_name)
                        await updateMenuComponents();
                    }
                    break;

                //** Location Select - Author selected a location from selection menu or to create new location */
                case 'location': 
                    if (!i.values.includes('new')){ // location from menu
                        log.location_name = i.values.join(', '); 
                        await i.deferUpdate();

                    } else { 
                        let mId = `location_modal${Date.now()}`
                        const modal = Menu.buildSingleInputModal(
                            customId = mId, 
                            title = 'New Location', 
                            label = 'Enter a new location', 
                            placeholder = 'e.g. IRL, World of Warcraft, Dota 2...');

                        log.location_name = await Menu.showModal(i, modal, modalId = mId);
                    }

                    if (log.location_name){
                        Menu.updateLocationSelect(log.location_name)
                        await updateMenuComponents();
                    }
                    break;

                case 'submit':
                    if (!log.isFilled()){
                        await i.editReply({
                            content: '**Please enter something for each of the fields**',
                            flags: MessageFlags.Ephemeral});
                        break;
                    }

                    let mId = `log_description_modal${Date.now()}`

                    const modal = Menu.buildSingleInputModal(
                        customId = mId, 
                        title = 'Log Entry',
                        label = 'Entry', 
                        placeholder = 'Write log entry...', inputStyle=TextInputStyle.Paragraph); 
                    
                    log.entry = await Menu.showModal(i, modal, mId); 

                    if (!log.entry){
                        break;
                    }
                    
                    log.attachment = interaction.options.getAttachment('add-attachment');
                    log.url = interaction.options.getString('add-url');

                    /** Create and send formatted embed of Log entry to the bot's designated text channel */
                    const embed = log.toEmbed(i.user);
                    await text_channel.send({embeds: [embed]})
                    
                    // Confirm that the log has been accepted - end command
                    await i.followUp({content:`Your log has been submitted and posted in ${text_channel}`,ephemeral: true});
                    CacheManager.addGuildLog(guildId, log);
                    collector.stop(); 
                    break;
                
                case 'cancel': 
                    await i.reply({ content: 'Cancelling log' });
                    collector.stop(); 
                    return;
                    
                default: // error
                    return;

            }
        })

        /** No more interactions */
        collector.on('end', () => { 
			
		});
    }
};


