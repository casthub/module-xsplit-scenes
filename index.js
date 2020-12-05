module.exports = class extends window.casthub.elements.scenes {

    /**
     * Initialize the new Module.
     */
    constructor() {
        super();

        /**
         * The WebSocket Instance for the Module.
         *
         * @type {WS|null}
         */
        this.ws = null;
    }

    /**
     * Run any asynchronous code when the Module is mounted to DOM.
     *
     * @return {Promise}
     */
    async mounted() {
        await super.mounted();

        const { id } = this.identity;

        // Open the WebSocket Connection to XSplit Broadcaster.
        this.ws = await window.casthub.ws(id);

        // Process the initial Scenes.
        this.ws.send('getAllScenes').then(data => this.process(data));

        // Listen to when Scenes change.
        this.ws.on('sceneslist', data => this.process(data));

        // Set the initial active Scene.
        this.ws.send('getActiveScene').then(({ id }) => {
            this.setActive(id);
        });

        // Set the active Scene whenever it changes.
        this.ws.on('scenechange', ({ id }) => {
            this.setActive(id);
        });
    }

    /**
     * Called when a Scene is changed.
     *
     * @param {String|Number} id
     */
    setScene(id) {
        this.ws.send('setActiveScene', {
            id,
        });
    }

    /**
     * Processes a Scene List.
     *
     * @param {Array} all
     */
    process(all) {
        const scenes = {};
        const total = all.length;

        for (let i = 0; i < total; i++) {
            const scene = all[i];
            scenes[scene.id] = {
                title: scene.name,
            };
        }

        this.set(scenes);
    }

};
