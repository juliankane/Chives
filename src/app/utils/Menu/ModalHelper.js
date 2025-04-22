const {ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder} = require('discord.js')



class EModalBuilder extends ModalBuilder{
    constructor(data) {
        data.custom_id = EModalBuilder.stamp(data.custom_id); // ✅ update custom_id
        super(data);   
    }


    static stamp(id){
        return `${id}_${Date.now()}`
    }
    
}

module.exports = {EModalBuilder}


