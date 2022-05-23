//================================================================================
//#region CSS

// ==UserScript==
// @name         Better Editor (KnowYourMeme)
// @namespace    https://github.com/neatcrown/
// @version      0.1
// @description  Makes improvements the the KYM Entry Editor.
// @author       NeatCrown
// @match        https://knowyourmeme.com/memes/*/edit
// @icon         https://github.com/neatcrown/kym-userscripts/raw/master/src/bettereditor.png
// @grant        GM_addStyle
// ==/UserScript==

/* globals jQuery, $ */

//================================================================================
//#region CSS
(function() {
  'use strict';

  GM_addStyle(`

    #content {
      display:flex;
      flex-direction: column;
      width: fit-content;

      position : relative;
      left: 25%;
      transform: translateX(-25%);
    }
    .sideBySide {
      display:flex;
      flex-direction: row;
    }
    #entry-preview, #previewEntry_body {
      width:720px;
    }
    #entry-preview-button {
      margin-left: auto;
      line-height: 100%;
      margin-bottom: auto;
    }
    #entry-preview {
      height: 100%;
    }
    textarea {
      resize: none;
    }
`);

  //#endregion CSS

  //================================================================================
  //#region MOVING AROUND ELEMENTS

  var side_by_side = $('#markItUpEntry_body').parent(1).before(
      `<div id='content'>` +
      `<div id='content_header' class='sideBySide'></div>` +
      `<div id='editor_bodies' class='sideBySide iee-div'></div>` +
      `</div>`
  );

  let editing_element = $('#markItUpEntry_body');
  let preview_element = $('#entry-preview');

  let header = $('#entry_body').prev();

  $('#editor_bodies').append(editing_element);
  $('#editor_bodies').append(`<div id='previewEntry_body'>`);
  $('#content_header').append(header);
  $('#content_header').append($('#entry-preview-button'));
  $('#previewEntry_body').append(preview_element);

  $(`textarea`).css('width', $('#entry-preview').css('width'));

  //#endregion MOVING AROUND ELEMENTS

  //================================================================================
  //#region VIEWPORT SCROLLING

  const TOP_OFFSET = 12;
  const BOT_OFFSET = 24;

  //returns the top position of the editor
  function editorPosition() {
      return $(".markItUpHeader").offset().top - $('.navbar').height() - TOP_OFFSET;
  }
  //dismisses the "other viewers" box
  function dismissViewers() {
      $('#other-edit-viewers').parent().css({'position': 'relative', 'top': '0px'});
  }

  //adjusts the height of the editor so it's full visile on any vertical resolution
  //(minimum recommended HORIZONTAL resolution is 1440 )
  function resizeEntry() {
      $('#entry_body').css( 'height',
                           window.innerHeight - $('.navbar').height() - $('.markItUpHeader').outerHeight(true) - TOP_OFFSET - BOT_OFFSET);
  }

  //scrolls to tne editor so it's fully in view
  $('#entry-preview-button').on('click', function() {
      $([document.documentElement, document.body]).animate({
          scrollTop: editorPosition()
      }, Math.abs( $(window).scrollTop() - editorPosition()));
      dismissViewers();
  });

  //resizes the editor when the viewport is resized
  $(window).on('resize', resizeEntry);

  resizeEntry();

  //#endregion VIEWPORT SCROLLING
})();