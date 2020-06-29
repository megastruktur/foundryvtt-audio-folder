// Adds a new button to playlist.
Hooks.on("renderPlaylistDirectory", async (app, html) => {

  let playlist_controls = html.find(".playlist-controls");

  let audio_folder_add = $(`<a class="sound-control"><i class="fas fa-list"></i></a>`);
  audio_folder_add.click(function(event) {
    const li = $(event.currentTarget).parents('.playlist');
    const playlist = game.playlists.get(li.data("entityId"));
    showAudioFolderAdd(playlist);
  });
  audio_folder_add.insertAfter(playlist_controls.children('[data-action="playlist-add"]'));

});


/**
 * Show the form to batch-add tracks.
 * @param {Entity} playlist 
 */
function showAudioFolderAdd(playlist) {
  new AudioFolderPlaylistConfig(playlist, {}, {top: 30, left: window.innerWidth - 670}).render(true);
}


/**
 * Playlist Sound Configuration Sheet
 * @type {FormApplication}
 *
 * @param {Playlist} playlist   The Playlist entity within which the Sound is configured
 * @param {Object} sound        An Object for the Playlist Sound data
 * @param {Object} options      Additional application rendering options
 */
class AudioFolderPlaylistConfig extends PlaylistSoundConfig {

  /* -------------------------------------------- */

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "audio-folder-config",
      template: "modules/audio-folder/templates/edit-audio-folder.html",
      width: 360
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async _updateObject(event, formData) {

    if (!game.user.isGM) throw "You do not have the ability to edit playlist sounds.";

    formData["volume"] = AudioHelper.inputToVolume(formData["lvolume"]);

    // Get Audio extensions.
    let types_array = CONST.AUDIO_FILE_EXTENSIONS.reduce((arr, t) => {
      arr.push(`.${t}`);
      arr.push(`.${t.toUpperCase()}`);
      return arr;
    }, []);
    
    
    var data = {action: "browseFiles", storage: "data", target: formData.path};
    var options = {extensions: types_array};
    
    // Get the file list, parse it and create items.
    game.socket.emit("manageFiles", data, options, result => {

      for (let file of result.files) {
        let track_data = {
          lvolume: formData.lvolume,
          volume: formData.volume,
          path: file,
          name: decodeURI(file.replace(/^.*[\\\/]/, ''))
        }
        if (typeof formData.repeat !== "undefined") {
          track_data.repeat = formData.repeat;
        }
        // modules/audio-folder/test

        this.playlist.createEmbeddedEntity("PlaylistSound", track_data, {});
      }
    });
  }
}