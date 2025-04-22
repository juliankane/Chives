const { ActionRowBuilder, 
    UserSelectMenuBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder
} = require('discord.js')



const EF = {
    build: () => {return new ActionRowBuilder().addComponents(this)},


    addTempOption: function (options ) {
        if (this.temp_flag){
            this.spliceOptions?.(-1,1)
            this.temp_flag = false
        }
        else{
            this.temp_flag = true
        }
        
        this.addOptions?.(
            new StringSelectMenuOptionBuilder().setLabel(options).setValue(options)
        )
    }
    
};





UserSelectMenuBuilder.prototype.build =  EF.build;
ButtonBuilder.prototype.build = EF.build;
StringSelectMenuBuilder.prototype.build = EF.build
StringSelectMenuBuilder.prototype.addTempOption = EF.addTempOption