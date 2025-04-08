/** COMMAND - /log 
 *     Initialize a menu for a user to create and send a Log
 */
const { SlashCommandBuilder, TextInputStyle, MessageFlags, } = require('discord.js');
const { MenuComponentBuilder } = require('../utility/MenuComponentBuilder.js');
const { Log } = require('../utility/Log.js');
const { LogJS: {log_strings} } = require('@constants');
const CacheManager = require('@cache');


module.exports = {
    // Deploy /log command
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription(log_strings.cmd_descript)
        .addSubcommand((subcommand) =>
            subcommand.setName('award').setDescription('Create a log and award points to members of the server!')
                .addIntegerOption(option =>
                    option.setName('points')
                        .setDescription('Award points to members (choices are 10, 25, 50, 100)')  // Updated description for clarity
                        .addChoices(
                            { name: '+10 points 🔺', value: 10 },
                            { name: '+25 points 🔺', value: 25 },
                            { name: '+50 points 💎', value: 50 },
                            { name: '+100 points 💎👑', value: 100 }
                        )
                        .setRequired(true)
                )
                .addAttachmentOption(option => option.setName('add-attachment').setDescription(log_strings.attch_opt_descript))
                .addStringOption(option => option.setName('add-url').setDescription(log_strings.url_opt_descript))
                .addBooleanOption(option =>
                    option.setName('anonymous')
                        .setDescription(log_strings.anon_opt_descript)
                )
             
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('report').setDescription('Create a log to reduce points from members of the server!')
                .addIntegerOption(option =>
                    option.setName('points')
                        .setDescription('Award points to members (choices are 10, 25, 50, 100)')  // Updated description for clarity
                        .addChoices(
                            { name: '-10 points 🔻', value: 10 },
                            { name: '-25 points 🔴', value: 25 },
                            { name: '-50 points 🔴', value: 50 },
                            { name: '-100 points 🔴💀', value: 100 }
                        )
                        .setRequired(true)
                )
                .addAttachmentOption(option => option.setName('add-attachment').setDescription(log_strings.attch_opt_descript))
                .addStringOption(option => option.setName('add-url').setDescription(log_strings.url_opt_descript))
                .addBooleanOption(option =>
                    option.setName('anonymous')
                        .setDescription(log_strings.anon_opt_descript))
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('entry').setDescription('Create a regular log without affecting points')
                .addAttachmentOption(option => option.setName('add-attachment').setDescription(log_strings.attch_opt_descript))
                .addStringOption(option => option.setName('add-url').setDescription(log_strings.url_opt_descript))
                .addBooleanOption(option =>
                    option.setName('anonymous')
                        .setDescription(log_strings.anon_opt_descript))
        ),
            


    // Execute /log
    async execute(interaction) {  
        const authorId = interaction.user.id
        const guildId = interaction.guild.id;
        const settings = CacheManager.getGuildSettings(guildId); 
        let text_channel = settings.text_channel
            ? interaction.client.channels.cache.get(settings.text_channel)
            : interaction.channel;

        const subcommand = interaction.options.getSubcommand();
 

        if (subcommand === 'report' || subcommand === 'award'){
            count = CacheManager.getMemberDailyCount(guildId, authorId, subcommand)

            if (count >= settings.daily_limit){
                interaction.reply({
                    content: `You have reached the limit with the amount of ${subcommand}s you may use this command today\n The next reset is in ${CacheManager.getTimeUntilNextReset()}`, 
                    flags: MessageFlags.Ephemeral})
                return 
            }
        }
        
        const log = new Log();
        log.authorId = authorId

        log.anon = interaction.options.getBoolean('anonymous') ? true : false;
        log.attachment =   interaction.options.getString('attachment');
        log.url = interaction.options.getString('url');
        log.point_action = subcommand;
        let Menu = null;


        switch(subcommand) {
            case 'award':
                Menu = new MenuComponentBuilder(  
                    {
                        user: "user_select", 
                        pointAction: "point_action", 
                        eventName: "event", 
                        locationName: "location", 
                        submit: "submit", 
                        cancel: "cancel"
                    },
                    { ...CacheManager.getGuildSelectionOptions(guildId) },
                    [], // Assuming guild_tags is an empty array
                    "award"
                );
                break;
        
            case 'report':
                Menu = new MenuComponentBuilder(  
                    {
                        user: "user_select", 
                        pointAction: "point_action", 
                        eventName: "event", 
                        locationName: "location", 
                        submit: "submit", 
                        cancel: "cancel"
                    },
                    { ...CacheManager.getGuildSelectionOptions(guildId) },
                    [], // Assuming guild_tags is an empty array
                    "reduce"
                );
                break;
        
            default:
                /** Initialize Log menu */ 
                Menu = new MenuComponentBuilder(  
                    {
                        user: "user_select", 
                        pointAction: null, 
                        eventName: "event", 
                        locationName: "location", 
                        submit: "submit", 
                        cancel: "cancel"
                    },
                    { ...CacheManager.getGuildSelectionOptions(guildId) },
                    [] // Assuming guild_tags is an empty array
                );
                break;
        }

        let actionRows =  Menu.createComponents()  
        const response = await interaction.reply({
			content: log_strings.main_prompt,
			components: actionRows,
            withResponse: true,
            flags: MessageFlags.Ephemeral
		});

        const collector = response.resource.message.createMessageComponentCollector({
            time: 3_600_000 
        });
    

        /** Begin collecting on menu components in the message sent to the user*/
        collector.on('collect', async i => {
            async function updateMenuComponents(){    
                if (log.isFilled()){
                    Menu.setSubmitEnabled();
                }
                actionRows = Menu.createComponents();
                await i.editReply({
                    content: log_strings.main_prompt,
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
                    log.points = i.values.join(', '); 
                    Menu.updatePointActionSelect(log.points) 
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
                            title = log_strings.evnt_mt,
                            label = log_strings.evnt_ml,
                            placeholder = log_strings.evnt_mp
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
                            title = log_strings.loc_mt, 
                            label = log_strings.loc_ml, 
                            placeholder = log_strings.loc_mp);

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
                            content: log_strings.reprompt,
                            flags: MessageFlags.Ephemeral});
                        break;
                    }

                    let mId = `log_description_modal${Date.now()}`

                    const modal = Menu.buildSingleInputModal(
                        customId = mId, 
                        title = log_strings.entry_mt,
                        label = log_strings.entry_ml, 
                        placeholder = log_strings.entry_mp, inputStyle=TextInputStyle.Paragraph); 
                        
              
                    log.entry = await Menu.showModal(i, modal, mId); 

                    if (!log.entry){
                        break;
                    }
                    
                    log.attachment = interaction.options.getAttachment('add-attachment');
                    log.url = interaction.options.getString('add-url');

                    /** Create and send formatted embed of Log entry to the bot's designated text channel */
                    const embed = log.toEmbed(i.user);
                    await text_channel.send({embeds: [embed]})
                    await i.editReply({content:log_strings.success_followup(text_channel), components: [], flags:MessageFlags.Ephemeral});
                    CacheManager.addGuildLog(guildId, log);
                    collector.stop(); 
                    break;
                
                case 'cancel': 
                    await i.deferUpdate();
                    await i.deleteReply();
                    collector.stop(); 
                    return;

                default: // error
                    return;

            }
        })

     
        collector.on('end', () => {
            // No more interactions
        });
    }
};