const { ActionRowBuilder, EmbedBuilder } = require("@discordjs/builders");
const { TextInputBuilder, ModalBuilder, TextInputStyle } = require("discord.js");
const config = require('../../config.json');  

async function showModal(interaction, modal){
    await interaction.showModal(modal);
    try{
        const modalResponse = await interaction.awaitModalSubmit({ 
            time: 60000,
            filter: (modalInteraction) => modalInteraction.user.id === interaction.user.id, // Ensures the modal submission is from the same user
         });

        if (modalResponse){ 
            const logEntry = modalResponse.fields.getTextInputValue('input');            
            console.log("Modal response received:", logEntry); // Logging the modal response value

            await modalResponse.deferUpdate();

            return logEntry; // Return the captured input
        }
        
    } catch (error){ console.error('Error submitting modal reply'); };
}

function buildSingleInputModal(customId, title, label, placeholder, inputStyle = TextInputStyle.Short){
    const modal = new ModalBuilder()
        .setCustomId(customId)
        .setTitle(title);
    
    const textInput = new TextInputBuilder()
        .setCustomId('input')
        .setLabel(label)
        .setStyle(inputStyle)
        .setPlaceholder(placeholder);

    if (inputStyle === TextInputStyle.Paragraph){
        textInput.setMaxLength(1024);
    }


    const row = new ActionRowBuilder().addComponents(textInput);
    modal.addComponents(row);
    return modal;
}

function buildEmbedLog(creator, pointAction, reported_users, location, event, entry){
    const userAvatarURL = creator.displayAvatarURL({extension: 'png'});
    const eventTypeVars = config.eventTypeVars;

    const embed = new EmbedBuilder ()
        .setColor(0x0099FF)  // Embed color
        .setAuthor({name: creator.globalName, iconURL: userAvatarURL})
        .setTitle('Created Log')
        .setDescription(eventTypeVars[pointAction].embedDescription)
        .addFields( 
            {name: eventTypeVars[pointAction].embedField,  value: reported_users.join(','), inline: false},
            {name: 'Reason',            value: event.join(', '),            inline:false},
            {name: 'Location',          value: location.join(', '),             inline:false},
            {name: 'Details',           value: entry,                           inline: false}
        )
        .setTimestamp();

    return embed;
}

module.exports = {
    buildSingleInputModal, showModal, buildEmbedLog
};