/**
 * @file log.js
 * @command /log
 * @subcommands award, report, entry
 * @description Command for a user to create a log entry
 */
require('module-alias/register');

const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const { MenuBuilder } = require('../utils/Menu/MenuBuilder.js')
const path = require('path'); const fs = require('fs'); const yaml = require('js-yaml');
const config = yaml.load(fs.readFileSync(path.join(__dirname, '../config/log-config.yml'), 'utf8'));
const ClientVariables = require('../ClientVariables');


function getNameFromID(ids) {
    if (Array.isArray(ids)) {
        return ids.map(id => `<@${id}>`); // return a list
    } else {
        return `<@${ids}>`; // return a string
    }
}



module.exports = {
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription("none")
        .addSubcommand((subcommand) =>
            subcommand.setName('award').setDescription('Create a log and award points to members of the server!')
                .addIntegerOption(option =>
                    option.setName('points')
                        .setDescription('Award points to members (choices are 10, 25, 50, 100)')  // Updated description for clarity
                        .addChoices(
                            { name: '+10 points 🔺', value: 10 },
                            { name: '+25 points 🔺', value: 25 },
                            { name: '+50 points 💎', value: 50 },
                            { name: '+100 points 💎👑', value: 100 })
                        .setRequired(true))
                .addAttachmentOption(option => option.setName('add-attachment').setDescription("none"))
                .addStringOption(option => option.setName('add-url').setDescription("none"))
                .addBooleanOption(option =>
                    option.setName('anonymous')
                        .setDescription("none")
                )
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('report').setDescription('Create a log to reduce points from members of the server!')
                .addIntegerOption(option =>
                    option.setName('points')
                        .setDescription('Award points to members (choices are 10, 25, 50, 100)')  // Updated description for clarity
                        .addChoices(
                            { name: '-10 points 🔻', value: -10 },
                            { name: '-25 points 🔴', value: -25 },
                            { name: '-50 points 🔴', value: -50 },
                            { name: '-100 points 🔴💀', value: -100 }
                        )
                        .setRequired(true)
                )
                .addAttachmentOption(option => option.setName('add-attachment').setDescription("none"))
                .addStringOption(option => option.setName('add-url').setDescription("none"))
                .addBooleanOption(option =>
                    option.setName('anonymous')
                        .setDescription("none"))
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('entry').setDescription('Create a regular log without affecting points')
                .addAttachmentOption(option => option.setName('add-attachment').setDescription("none"))
                .addStringOption(option => option.setName('add-url').setDescription("none"))
                .addBooleanOption(option =>
                    option.setName('anonymous')
                        .setDescription("none"))
        ),



    async execute(interaction) {  
        const LogInput = {
            authorId: interaction.user.id,
            attachment: interaction.options.getString('attachment'),
            url: interaction.options.getString('url'),
            point_action: interaction.options.getSubcommand(),
            points: interaction.options.getInteger('points') || 0,
            tagged_users: "",
            event_name: "",
            location_name: "",
            entry: "",


            cache(){
                
            }
        }




        // const settings = call cache    
        const Menu = new MenuBuilder(config.menu_components)
        Menu.build(config.menu_components)
        const response = await Menu.show(interaction, false, embed)


        const collector = response.resource.message.createMessageComponentCollector({
            time: 3_600_000
        });


        collector.on('collect', async i => {    
            switch (i.customId){
                case 'user':
                    LogInput.tagged_users = i.values;
                    await i.deferUpdate();
                    break;

                case 'event':
                    values = i.values.join(', ')
                    if (values === 'new') {
                        const value = await Menu.GetInputFromModal(i, config.modals.event_modal, "event")
                        LogInput.event_name = valueembed.setAuthor(LogInput.authorId)
                        .setTitle()
                    }
                    break;

                case 'location':
                    values = i.values.join(', ')
                    if (values === 'new') {
                        const value = await Menu.GetInputFromModal(i, config.modals.location_modal, "location")
                        LogInput.location_name = value
                        await Menu.addMenuOptions("location", value)
                        await Menu.show(i, true)
                    } else {
                        LogInput.location_name = values
                        await i.deferUpdate()
                    }
                    break;
                
        collector.on('end', () => {
            action_config = config.embed[point_action]
            emb = new EmbedBuilder()
                    .setTitle(action_config.final_embed.title)
                    .setColor(action_config.color)
                    .setTimestamp(Date.now())
                    .setFooter(`Written by ${LogInput.username}`)
                    .addFields(bold())


        });
                case 'details':
                    LogInput.entry = await Menu.GetInputFromModal( i, config.modals.details_modal, inputs = "details" )
                    await Menu.updateComponent('details', {emoji: '✅', label: 'Details submitted'})
                    await Menu.show(i, true)
                    
                    break;


                case 'submit':
                   
                    collector.stop(); 
                    break;
                
                case 'cancel':
                    await i.deferUpdate();
                    await i.deleteReply();
                    collector.stop();
                    break;


                default:
                    return
            }
        });

     




    }
};