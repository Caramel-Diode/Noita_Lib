class runtimeEnvironment {
    /**
     * 预备队列 
     * @type {Array<DB.spell>} 
     */
    deck = [];
    /**
     * 施放队列 
     * @type {Array<DB.spell>} 
     */
    hand = [];
    /**
     * 废弃队列 
     * @type {Array<DB.spell>} 
     */
    discarded = [];
}