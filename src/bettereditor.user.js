//================================================================================
//#region CSS

// ==UserScript==
// @name         Better Editor (KnowYourMeme)
// @namespace    https://github.com/neatcrown/
// @version      0.2
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
    :root {
      --editor-margins: 40px;
      --dyn-width: calc(clamp(960px, 100vw, 1440px + var(--editor-margins)) - var(--editor-margins));
      --dyn-height: calc(100vh - var(--top-offset) - var(--bot-offset) - var(--head-offset));
      --right-offset: calc(100vw - (var(--left-offset) + var(--dyn-width)));
    }
    #editor_content {
      display:flex;
      flex-direction: column;
      width: var(--dyn-width);
      height: var(--dyn-height);
      max-width: 1440px;
      margin-left: calc((var(--left-offset) + var(--right-offset) - var(--editor-margins)) / 2 - var(--left-offset));
    }
    #editor_bodies, #editor_header {
      display:flex;
      flex-direction: row;
    }
    #editor_bodies, #markItUpEntry_body {
      flex-grow: 1;
      flex-shrink: 1;
      overflow: hidden;
    }
    #previewEntry_body {
      width: 720px;
      min-width: 720px;
    }
    #entry-preview-button {
      margin-left: auto;
      line-height: 100%;
      margin-bottom: auto;
    }
    #entry-preview, #entry_body, #previewEntry_body, .markItUpContainer  {
      height: 100%;
      resize: none;
    }
`);

  //#endregion CSS

  //================================================================================
  //#region MOVING AROUND ELEMENTS

  var side_by_side = $('#markItUpEntry_body').parent(1).before(
    `<div id='editor_content'>` +
      `<div id='editor_header'></div>` +
      `<div id='editor_bodies'></div>` +
    `</div>`
  );

  let editing_element = $('#markItUpEntry_body');
  let preview_element = $('#entry-preview');

  let header = $('#entry_body').prev();

  $('#editor_bodies').append(editing_element);
  $('#editor_bodies').append(`<div id='previewEntry_body'>`);
  $('#editor_header').append(header);
  $('#editor_header').append($('#entry-preview-button'));
  $('#previewEntry_body').append(preview_element);

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

  //adjusts the horizontal position of the editor to center-screen
  function repositionEntry() {
    document.documentElement.style.setProperty('--left-offset', $('.required > .col-sm-12').offset().left + 'px');
  }
  //scrolls to tne editor so it's fully in view
  $('#entry-preview-button').on('click', function() {
    $([document.documentElement, document.body]).animate({
      scrollTop: editorPosition()
    }, Math.abs( $(window).scrollTop() - editorPosition()));
    dismissViewers();
  });

  //resizes the editor when the viewport is resized
  $(window).on('resize', repositionEntry);

  //sets CSS variables
  document.documentElement.style.setProperty('--top-offset', TOP_OFFSET + 'px');
  document.documentElement.style.setProperty('--bot-offset', BOT_OFFSET + 'px');
  document.documentElement.style.setProperty('--head-offset', $('.navbar').height() + 'px');

  repositionEntry();

  //#endregion VIEWPORT SCROLLING
})();